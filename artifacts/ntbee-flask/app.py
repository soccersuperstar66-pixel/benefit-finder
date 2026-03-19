import os
import sqlite3
import json
import secrets
from flask import (
    Flask,
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    g,
    session,
    abort,
)

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/ntbee/static",
)
app.secret_key = os.environ.get("SECRET_KEY", "ntbee-demo-secret-key-2024")

DB_PATH = os.path.join(os.path.dirname(__file__), "submissions.db")

# ---------------------------------------------------------------------------
# CSRF helpers
# ---------------------------------------------------------------------------

def generate_csrf_token() -> str:
    if "_csrf_token" not in session:
        session["_csrf_token"] = secrets.token_hex(32)
    return session["_csrf_token"]


def validate_csrf_token() -> None:
    token = session.get("_csrf_token")
    form_token = request.form.get("_csrf_token", "")
    if not token or not secrets.compare_digest(token, form_token):
        abort(400, "Invalid or missing CSRF token.")


app.jinja_env.globals["csrf_token"] = generate_csrf_token

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    if "db" not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        g.db = conn
    return g.db


@app.teardown_appcontext
def close_db(exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            household_size INTEGER NOT NULL,
            monthly_income REAL NOT NULL,
            zip_code TEXT NOT NULL,
            dependents INTEGER NOT NULL,
            elderly_disabled INTEGER NOT NULL,
            monthly_housing REAL NOT NULL,
            monthly_childcare REAL NOT NULL,
            eligible_programs TEXT NOT NULL,
            total_estimated_monthly REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# 2024 Eligibility logic
# ---------------------------------------------------------------------------

# 2024 FPL (48 contiguous states + DC)
FPL_BASE = 15060
FPL_PER_ADDITIONAL = 5380

# SNAP maximum monthly allotments by household size (USDA FY 2024)
SNAP_MAX_ALLOTMENTS = {1: 291, 2: 535, 3: 766, 4: 973, 5: 1155, 6: 1386, 7: 1532, 8: 1751}

# State Median Income (2024 federal reference, family of 4 = $72,000/yr)
SMI_BASE_FAMILY4 = 72000
SMI_PER_PERSON_ADJUSTMENT = 6000  # approximate scaling


def annual_fpl(household_size: int) -> float:
    size = max(1, household_size)
    return FPL_BASE + FPL_PER_ADDITIONAL * (size - 1)


def monthly_fpl(household_size: int) -> float:
    return annual_fpl(household_size) / 12


def annual_smi(household_size: int) -> float:
    base = SMI_BASE_FAMILY4
    diff = household_size - 4
    return base + diff * SMI_PER_PERSON_ADJUSTMENT


def check_eligibility(data: dict) -> list[dict]:
    household_size = int(data["household_size"])
    monthly_income = float(data["monthly_income"])
    dependents = int(data["dependents"])
    elderly_disabled = int(data["elderly_disabled"])
    monthly_housing = float(data.get("monthly_housing", 0))
    monthly_childcare = float(data.get("monthly_childcare", 0))
    annual_income = monthly_income * 12

    fpl_monthly = monthly_fpl(household_size)
    smi_annual = annual_smi(household_size)

    results = []

    # --- SNAP ---
    snap_threshold = fpl_monthly * 1.30
    if monthly_income <= snap_threshold:
        size_key = min(household_size, 8)
        max_allotment = SNAP_MAX_ALLOTMENTS.get(size_key, 1751 + (household_size - 8) * 200)
        # Simplified net income benefit calculation
        net_income = monthly_income * 0.8  # 80% net income rule approximation
        snap_benefit = max(23, max_allotment - int(net_income * 0.3))
        snap_benefit = min(snap_benefit, max_allotment)
        results.append(
            {
                "program": "SNAP",
                "full_name": "Supplemental Nutrition Assistance Program",
                "agency": "USDA / State DHS",
                "apply_url": "https://www.fns.usda.gov/snap/how-apply",
                "estimated_monthly": snap_benefit,
                "label": f"~${snap_benefit:,}/month in grocery benefits",
                "description": "Helps buy groceries at authorized retailers. Benefit loaded on an EBT card each month.",
                "threshold_pct": 130,
                "icon": "🛒",
            }
        )

    # --- Medicaid ---
    medicaid_threshold = fpl_monthly * 1.38
    if monthly_income <= medicaid_threshold:
        per_person_value = 500 * household_size
        results.append(
            {
                "program": "Medicaid",
                "full_name": "Medicaid / CHIP Health Coverage",
                "agency": "CMS / State Medicaid Office",
                "apply_url": "https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/",
                "estimated_monthly": per_person_value,
                "label": f"~${per_person_value:,}/month in health coverage value",
                "description": "Comprehensive health insurance including doctor visits, prescriptions, hospital care, and preventive services.",
                "threshold_pct": 138,
                "icon": "🏥",
            }
        )

    # --- LIHEAP ---
    liheap_threshold = fpl_monthly * 1.50
    if monthly_income <= liheap_threshold:
        # Priority for elderly/disabled or high housing cost
        base_benefit = 35
        if elderly_disabled > 0:
            base_benefit = 50
        if monthly_housing > 1000:
            base_benefit += 20
        results.append(
            {
                "program": "LIHEAP",
                "full_name": "Low Income Home Energy Assistance Program",
                "agency": "HHS / State Energy Office",
                "apply_url": "https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap",
                "estimated_monthly": base_benefit,
                "label": f"~${base_benefit}/month in energy assistance (avg)",
                "description": "Helps pay heating and cooling bills, and may cover energy crisis emergencies or weatherization.",
                "threshold_pct": 150,
                "icon": "💡",
            }
        )

    # --- CCAP (Child Care Assistance) ---
    ccap_smi_threshold = smi_annual * 0.85
    if dependents > 0 and monthly_childcare > 0 and annual_income <= ccap_smi_threshold:
        # Subsidy is roughly 85% of actual costs up to a ceiling
        subsidy = min(monthly_childcare * 0.85, 800 * dependents)
        subsidy = round(subsidy)
        results.append(
            {
                "program": "CCAP",
                "full_name": "Child Care and Development Fund (CCDF)",
                "agency": "HHS / State Child Care Agency",
                "apply_url": "https://www.acf.hhs.gov/occ/ccdf-programs",
                "estimated_monthly": subsidy,
                "label": f"~${subsidy:,}/month in child care subsidies",
                "description": "Subsidizes child care costs so parents can work, attend school, or participate in job training.",
                "threshold_pct": 85,
                "icon": "👧",
            }
        )

    return results


# ---------------------------------------------------------------------------
# Blueprint & routes
# ---------------------------------------------------------------------------

bp = Blueprint("ntbee", __name__, url_prefix="/ntbee")


@bp.route("/")
def index():
    return render_template("index.html")


@bp.route("/checker", methods=["GET", "POST"])
def checker():
    errors = {}
    form_data = {}

    if request.method == "POST":
        validate_csrf_token()
        form_data = request.form.to_dict()

        # Validate
        try:
            hs = int(form_data.get("household_size", 0))
            if hs < 1 or hs > 20:
                errors["household_size"] = "Enter a number between 1 and 20."
        except ValueError:
            errors["household_size"] = "Please enter a valid number."

        try:
            inc = float(form_data.get("monthly_income", -1))
            if inc < 0:
                errors["monthly_income"] = "Enter your monthly income (0 or more)."
        except ValueError:
            errors["monthly_income"] = "Please enter a valid dollar amount."

        zip_code = form_data.get("zip_code", "").strip()
        if not zip_code or not zip_code.isdigit() or len(zip_code) != 5:
            errors["zip_code"] = "Enter a valid 5-digit ZIP code."

        try:
            dep = int(form_data.get("dependents", 0))
            if dep < 0:
                errors["dependents"] = "Enter 0 or more."
        except ValueError:
            errors["dependents"] = "Please enter a valid number."

        try:
            eld = int(form_data.get("elderly_disabled", 0))
            if eld < 0:
                errors["elderly_disabled"] = "Enter 0 or more."
        except ValueError:
            errors["elderly_disabled"] = "Please enter a valid number."

        for field in ("monthly_housing", "monthly_childcare"):
            try:
                val = float(form_data.get(field, 0))
                if val < 0:
                    errors[field] = "Enter 0 or more."
            except ValueError:
                errors[field] = "Please enter a valid dollar amount."

        if not errors:
            programs = check_eligibility(form_data)
            total = sum(p["estimated_monthly"] for p in programs)

            db = get_db()
            cur = db.execute(
                """
                INSERT INTO submissions
                    (household_size, monthly_income, zip_code, dependents,
                     elderly_disabled, monthly_housing, monthly_childcare,
                     eligible_programs, total_estimated_monthly)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    int(form_data["household_size"]),
                    float(form_data["monthly_income"]),
                    form_data["zip_code"].strip(),
                    int(form_data["dependents"]),
                    int(form_data["elderly_disabled"]),
                    float(form_data.get("monthly_housing", 0)),
                    float(form_data.get("monthly_childcare", 0)),
                    json.dumps([p["program"] for p in programs]),
                    total,
                ),
            )
            db.commit()
            submission_id = cur.lastrowid
            return redirect(url_for("ntbee.results", submission_id=submission_id))

    return render_template("checker.html", errors=errors, form_data=form_data)


@bp.route("/results/<int:submission_id>")
def results(submission_id):
    db = get_db()
    row = db.execute(
        "SELECT * FROM submissions WHERE id = ?", (submission_id,)
    ).fetchone()
    if row is None:
        return render_template("404.html"), 404

    row_dict = dict(row)
    programs = check_eligibility(row_dict)
    total = sum(p["estimated_monthly"] for p in programs)

    return render_template(
        "results.html",
        row=row_dict,
        programs=programs,
        total=total,
    )


@bp.route("/admin")
def admin():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM submissions ORDER BY created_at DESC"
    ).fetchall()
    rows = [dict(r) for r in rows]
    for r in rows:
        r["eligible_programs"] = json.loads(r["eligible_programs"])
    return render_template("admin.html", rows=rows)


app.register_blueprint(bp)

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

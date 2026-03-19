import os
import json
from collections import Counter
from datetime import datetime

from flask import (
    Flask, Blueprint, render_template, redirect, url_for,
    request, flash, abort
)
from flask_login import (
    LoginManager, login_user, logout_user, login_required, current_user
)
from dotenv import load_dotenv

load_dotenv()

from models import db, User, EligibilityCheck
from eligibility import check_eligibility
from forms import LoginForm, SignupForm, CheckerForm
from utils import export_csv_response


def create_app() -> Flask:
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
        static_url_path="/ntbee/static",
    )

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") or os.urandom(32).hex()
    db_path = os.path.join(os.path.dirname(__file__), "ntbee.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "ntbee.login"
    login_manager.login_message = "Please log in to access that page."
    login_manager.login_message_category = "info"

    @login_manager.user_loader
    def load_user(uid: str):
        return db.session.get(User, int(uid))

    with app.app_context():
        db.create_all()
        if not User.query.filter_by(is_admin=True).first():
            admin = User(email="admin@govbenefits.local", is_admin=True)
            admin.set_password("admin1234!")
            db.session.add(admin)
            db.session.commit()
            print("── Admin created: admin@govbenefits.local / admin1234! ──")

    bp = Blueprint("ntbee", __name__, url_prefix="/ntbee")

    # ── Public pages ───────────────────────────────────────────────────────

    @bp.route("/")
    def index():
        return render_template("index.html")

    @bp.route("/about")
    def about():
        return render_template("about.html")

    @bp.route("/privacy")
    def privacy():
        return render_template("privacy.html")

    @bp.route("/contact")
    def contact():
        return render_template("contact.html")

    # ── Eligibility checker ────────────────────────────────────────────────

    @bp.route("/checker", methods=["GET", "POST"])
    def checker():
        form = CheckerForm()
        if form.validate_on_submit():
            fields = [
                "household_size", "monthly_income", "zip_code", "dependents",
                "children_under5", "school_age_children", "elderly_disabled",
                "pregnant", "has_disability", "monthly_housing", "monthly_childcare",
            ]
            data = {f: getattr(form, f).data for f in fields}
            data["monthly_housing"] = data["monthly_housing"] or 0
            data["monthly_childcare"] = data["monthly_childcare"] or 0

            programs = check_eligibility(data)
            total = sum(p["estimated_monthly"] for p in programs)

            save = form.save_results.data and current_user.is_authenticated
            check = EligibilityCheck(
                user_id=current_user.id if save else None,
                household_size=data["household_size"],
                monthly_income=data["monthly_income"],
                zip_code=data["zip_code"],
                dependents=data["dependents"] or 0,
                children_under5=data["children_under5"] or 0,
                school_age_children=data["school_age_children"] or 0,
                elderly_disabled=data["elderly_disabled"] or 0,
                pregnant=bool(data["pregnant"]),
                has_disability=bool(data["has_disability"]),
                monthly_housing=data["monthly_housing"],
                monthly_childcare=data["monthly_childcare"],
                eligible_programs=json.dumps([p["program"] for p in programs]),
                total_estimated_monthly=total,
            )
            db.session.add(check)
            db.session.commit()
            return redirect(url_for("ntbee.results", check_id=check.id))

        return render_template("checker.html", form=form)

    @bp.route("/results/<int:check_id>")
    def results(check_id: int):
        check = db.session.get(EligibilityCheck, check_id)
        if not check:
            abort(404)
        data = {
            k: getattr(check, k) for k in [
                "household_size", "monthly_income", "zip_code", "dependents",
                "children_under5", "school_age_children", "elderly_disabled",
                "pregnant", "has_disability", "monthly_housing", "monthly_childcare",
            ]
        }
        programs = check_eligibility(data)
        total = sum(p["estimated_monthly"] for p in programs)
        return render_template("results.html", check=check, programs=programs, total=total)

    # ── Auth ───────────────────────────────────────────────────────────────

    @bp.route("/login", methods=["GET", "POST"])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for("ntbee.index"))
        form = LoginForm()
        if form.validate_on_submit():
            user = User.query.filter_by(email=form.email.data.strip().lower()).first()
            if user and user.check_password(form.password.data):
                login_user(user, remember=True)
                next_page = request.args.get("next")
                return redirect(next_page or url_for("ntbee.index"))
            flash("Invalid email or password.", "danger")
        return render_template("login.html", form=form)

    @bp.route("/signup", methods=["GET", "POST"])
    def signup():
        if current_user.is_authenticated:
            return redirect(url_for("ntbee.index"))
        form = SignupForm()
        if form.validate_on_submit():
            email = form.email.data.strip().lower()
            if User.query.filter_by(email=email).first():
                flash("An account with that email already exists.", "warning")
            else:
                user = User(email=email)
                user.set_password(form.password.data)
                db.session.add(user)
                db.session.commit()
                login_user(user)
                flash("Welcome! Your account has been created.", "success")
                return redirect(url_for("ntbee.index"))
        return render_template("signup.html", form=form)

    @bp.route("/logout")
    @login_required
    def logout():
        logout_user()
        flash("You have been logged out.", "info")
        return redirect(url_for("ntbee.index"))

    # ── User dashboard ─────────────────────────────────────────────────────

    @bp.route("/dashboard")
    @login_required
    def dashboard():
        checks = (
            EligibilityCheck.query
            .filter_by(user_id=current_user.id)
            .order_by(EligibilityCheck.created_at.desc())
            .all()
        )
        return render_template("dashboard.html", checks=checks)

    # ── Admin ──────────────────────────────────────────────────────────────

    @bp.route("/admin")
    @login_required
    def admin():
        if not current_user.is_admin:
            abort(403)
        checks = (
            EligibilityCheck.query
            .order_by(EligibilityCheck.created_at.desc())
            .all()
        )
        all_progs = []
        for c in checks:
            all_progs.extend(c.programs_list())
        program_counts = dict(Counter(all_progs))

        return render_template(
            "admin.html",
            checks=checks,
            program_counts=json.dumps(program_counts),
            total_users=User.query.count(),
            total_checks=len(checks),
            avg_value=round(
                sum(c.total_estimated_monthly for c in checks) / len(checks)
            ) if checks else 0,
        )

    @bp.route("/admin/export.csv")
    @login_required
    def export_csv():
        if not current_user.is_admin:
            abort(403)
        checks = EligibilityCheck.query.order_by(EligibilityCheck.created_at.desc()).all()
        return export_csv_response(checks)

    # ── Error handlers ─────────────────────────────────────────────────────

    @app.errorhandler(404)
    def not_found(e):
        return render_template("404.html"), 404

    @app.errorhandler(403)
    def forbidden(e):
        return render_template("403.html"), 403

    app.register_blueprint(bp)
    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

"""
No-Touch Benefits Eligibility Engine — eligibility.py
10-program eligibility checker using 2024 Federal Poverty Level guidelines.
"""

# ── 2024 Federal Poverty Level guidelines (annual, CONUS) ──────────────────
_FPL_BASE = 15060
_FPL_ADDITIONAL = 5380


def _annual_fpl(household_size: int) -> float:
    size = max(1, int(household_size))
    return _FPL_BASE + (size - 1) * _FPL_ADDITIONAL


def _monthly_fpl(household_size: int) -> float:
    return _annual_fpl(household_size) / 12


# ── Estimated benefit values ───────────────────────────────────────────────
SNAP_PER_PERSON = 204
MEDICAID_VALUE = 500
LIHEAP_MONTHLY = 125
WIC_MONTHLY = 120
CCAP_MONTHLY = 650
SECTION8_MONTHLY = 900
SSI_MONTHLY = 943
SCHOOL_MEALS_MONTHLY = 90
TANF_MONTHLY = 500
LIFELINE_MONTHLY = 30


def _snap(data: dict):
    threshold = 1.30 * _monthly_fpl(data["household_size"])
    if data["monthly_income"] > threshold:
        return None
    benefit = min(SNAP_PER_PERSON * data["household_size"], 1756)
    return {
        "program": "SNAP",
        "full_name": "Supplemental Nutrition Assistance Program",
        "icon": "🛒",
        "description": "Monthly food benefits loaded on an EBT card, usable at most grocery stores and farmers markets.",
        "label": f"~${benefit:,.0f}/month in food benefits",
        "estimated_monthly": benefit,
        "agency": "USDA / State DHS",
        "threshold_pct": "130",
        "apply_url": "https://www.fns.usda.gov/snap/state-directory",
        "help_url": "https://www.benefits.gov/benefit/361",
        "help_url_label": "SNAP on Benefits.gov",
        "phone_label": "SNAP Hotline",
        "phone": "1-800-221-5689",
        "documents": [
            "Photo ID (driver's license, passport, or state ID)",
            "Proof of address (utility bill, lease, or bank statement)",
            "Proof of income (pay stubs, award letters, tax returns)",
            "Social Security numbers for all household members",
            "Bank statements (last 3 months)",
        ],
        "steps": [
            "Contact your state SNAP office or visit your state's benefits portal",
            "Complete the online or paper application",
            "Attend a phone or in-person interview with a caseworker",
            "Provide required documents (upload, mail, or fax)",
            "If approved, receive EBT card within 7–10 business days",
        ],
    }


def _medicaid(data: dict):
    hs = data["household_size"]
    income = data["monthly_income"]
    threshold_adult = 1.38 * _monthly_fpl(hs)
    threshold_child = 2.00 * _monthly_fpl(hs)
    has_children = (data.get("dependents") or 0) > 0 or (data.get("children_under5") or 0) > 0
    if income > threshold_adult and not (has_children and income <= threshold_child):
        return None
    sublabel = "CHIP" if income > threshold_adult else "Medicaid"
    return {
        "program": "Medicaid",
        "full_name": f"Medicaid / CHIP ({sublabel})",
        "icon": "🏥",
        "description": "Free or very low-cost health coverage including doctor visits, prescriptions, mental health care, and hospital stays.",
        "label": f"~${MEDICAID_VALUE:,}/month in health coverage value",
        "estimated_monthly": MEDICAID_VALUE,
        "agency": "CMS / State Medicaid Agency",
        "threshold_pct": "138 (adults) / 200 (children/CHIP)",
        "apply_url": "https://www.healthcare.gov/medicaid-chip/",
        "help_url": "https://www.medicaid.gov/about-us/beneficiary-resources/index.html",
        "help_url_label": "Medicaid resources",
        "phone_label": "Healthcare.gov",
        "phone": "1-800-318-2596",
        "documents": [
            "Photo ID or birth certificate",
            "Social Security numbers for all applicants",
            "Proof of income (pay stubs, SSA award letter)",
            "Proof of residency (utility bill, lease)",
            "Current health insurance cards (if any)",
        ],
        "steps": [
            "Apply at HealthCare.gov, your state marketplace, or state Medicaid office",
            "Complete the application with household and income info",
            "Submit required documentation",
            "Receive eligibility notice (usually within 45 days)",
            "If approved, choose a plan and receive your Medicaid ID card",
        ],
    }


def _liheap(data: dict):
    threshold = 1.50 * _monthly_fpl(data["household_size"])
    if data["monthly_income"] > threshold:
        return None
    priority = (data.get("elderly_disabled") or 0) > 0 or (data.get("children_under5") or 0) > 0
    note = " Priority given to households with young children or elderly/disabled members." if priority else ""
    return {
        "program": "LIHEAP",
        "full_name": "Low Income Home Energy Assistance Program",
        "icon": "💡",
        "description": f"One-time or seasonal grants to help pay heating and cooling bills.{note}",
        "label": f"~${LIHEAP_MONTHLY}/month average energy assistance",
        "estimated_monthly": LIHEAP_MONTHLY,
        "agency": "HHS / State Energy Office",
        "threshold_pct": "150",
        "apply_url": "https://www.acf.hhs.gov/ocs/map/liheap-map-state-and-territory-contact-listing",
        "help_url": "https://www.benefits.gov/benefit/623",
        "help_url_label": "LIHEAP on Benefits.gov",
        "phone_label": "LIHEAP Helpline",
        "phone": "1-866-674-6327",
        "documents": [
            "Photo ID for all adult household members",
            "Social Security numbers",
            "Proof of address",
            "Recent utility bill (account number, provider name)",
            "Proof of income for all household members (last 30 days)",
        ],
        "steps": [
            "Find your local LIHEAP office via the state map at acf.hhs.gov",
            "Apply during open enrollment period (often Oct–May, varies by state)",
            "Submit application and documents in person, by mail, or online",
            "A caseworker will contact you to verify information",
            "Benefits are paid directly to your utility provider",
        ],
    }


def _wic(data: dict):
    threshold = 1.85 * _monthly_fpl(data["household_size"])
    if data["monthly_income"] > threshold:
        return None
    has_young = (data.get("children_under5") or 0) > 0 or data.get("pregnant", False)
    if not has_young:
        return None
    return {
        "program": "WIC",
        "full_name": "Special Supplemental Nutrition Program for Women, Infants, and Children",
        "icon": "🤱",
        "description": "Monthly food packages (formula, produce, dairy, cereals) and nutrition counseling for pregnant/postpartum women and children under 5.",
        "label": f"~${WIC_MONTHLY}/month in nutrition benefits",
        "estimated_monthly": WIC_MONTHLY,
        "agency": "USDA / State WIC Agency",
        "threshold_pct": "185",
        "apply_url": "https://www.fns.usda.gov/wic/wic-local-agency-contact-information",
        "help_url": "https://www.benefits.gov/benefit/369",
        "help_url_label": "WIC on Benefits.gov",
        "phone_label": "WIC Helpline",
        "phone": "1-800-942-3678",
        "documents": [
            "ID for the applicant (birth certificate, driver's license)",
            "Proof of residency",
            "Proof of income OR proof of SNAP/Medicaid participation (auto income-eligible)",
            "Proof of pregnancy (if applicable)",
            "Child's birth certificate (for infant/child applicants)",
        ],
        "steps": [
            "Find your local WIC clinic at fns.usda.gov/wic",
            "Call or go online to schedule an eligibility appointment",
            "Bring required documents to the appointment",
            "Complete a nutrition assessment with WIC staff",
            "If approved, receive an EBT-style card loaded monthly with approved food items",
        ],
    }


def _ccap(data: dict):
    threshold = 2.50 * _monthly_fpl(data["household_size"])
    has_children = (data.get("children_under5") or 0) > 0 or (data.get("school_age_children") or 0) > 0
    if data["monthly_income"] > threshold or not has_children:
        return None
    childcare_cost = data.get("monthly_childcare") or 0
    benefit = min(childcare_cost * 0.80 if childcare_cost > 0 else CCAP_MONTHLY, CCAP_MONTHLY)
    return {
        "program": "CCAP",
        "full_name": "Child Care Assistance Program (CCDF Subsidy)",
        "icon": "👶",
        "description": "Subsidized child care so you can work, attend school, or participate in job training. Covers licensed daycare centers and home-based providers.",
        "label": f"~${benefit:,.0f}/month in child care assistance",
        "estimated_monthly": benefit,
        "agency": "HHS ACF / State Child Care Agency",
        "threshold_pct": "250 (proxy for 85% SMI)",
        "apply_url": "https://childcareta.acf.hhs.gov/consumers",
        "help_url": "https://www.childcare.gov/index.php/consumer-education/find-financial-help",
        "help_url_label": "ChildCare.gov — financial help",
        "phone_label": "Child Care Helpline",
        "phone": "1-800-394-3366",
        "documents": [
            "Photo ID for the applying parent/guardian",
            "Child's birth certificate and Social Security number",
            "Proof of income (recent pay stubs, employer letter)",
            "Proof of work, school enrollment, or training program",
            "Name and license number of chosen child care provider",
        ],
        "steps": [
            "Contact your state's child care subsidy office or visit childcare.gov",
            "Complete the state application form",
            "Provide documentation of income and work/school status",
            "Choose an eligible licensed child care provider",
            "Once approved, subsidy is paid directly to the provider; you pay only the co-pay",
        ],
    }


def _section8(data: dict):
    threshold = 1.50 * _monthly_fpl(data["household_size"])
    if data["monthly_income"] > threshold:
        return None
    return {
        "program": "Section 8",
        "full_name": "Section 8 Housing Choice Voucher Program",
        "icon": "🏠",
        "description": "Rental assistance vouchers that pay the difference between market rent and 30% of your income. Note: waiting lists are often long — apply immediately.",
        "label": f"~${SECTION8_MONTHLY}/month in rental assistance",
        "estimated_monthly": SECTION8_MONTHLY,
        "agency": "HUD / Local Public Housing Authority (PHA)",
        "threshold_pct": "150 (proxy for 50% AMI)",
        "apply_url": "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
        "help_url": "https://www.benefits.gov/benefit/4117",
        "help_url_label": "Section 8 on Benefits.gov",
        "phone_label": "HUD Helpline",
        "phone": "1-800-955-2232",
        "documents": [
            "Photo ID for all adult household members",
            "Birth certificates and Social Security numbers for all members",
            "Proof of income (all sources, last 30 days)",
            "Rental history / landlord references",
            "Documentation of any disabilities (if applicable, for preference)",
        ],
        "steps": [
            "Find your local PHA at hud.gov and apply to their Section 8 waiting list",
            "Keep your contact info current — waiting lists can take 1–5+ years",
            "When a voucher is issued, find an eligible rental unit",
            "PHA inspects the unit and sets the contract rent",
            "Landlord receives subsidy directly; you pay 30% of your income as rent",
        ],
    }


def _ssi(data: dict):
    has_disability = data.get("has_disability", False)
    has_elderly = (data.get("elderly_disabled") or 0) > 0
    if not has_disability and not has_elderly:
        return None
    threshold = 1.00 * _monthly_fpl(data["household_size"])
    if data["monthly_income"] > threshold:
        return None
    return {
        "program": "SSI",
        "full_name": "Supplemental Security Income",
        "icon": "🛡️",
        "description": "Monthly cash payments for people who are 65+, blind, or have a qualifying disability with limited income and resources.",
        "label": f"Up to ${SSI_MONTHLY}/month in cash",
        "estimated_monthly": SSI_MONTHLY,
        "agency": "Social Security Administration (SSA)",
        "threshold_pct": "100",
        "apply_url": "https://www.ssa.gov/ssi/",
        "help_url": "https://www.benefits.gov/benefit/1237",
        "help_url_label": "SSI on Benefits.gov",
        "phone_label": "Social Security",
        "phone": "1-800-772-1213",
        "documents": [
            "Social Security card or number",
            "Birth certificate or proof of age",
            "Medical records documenting disability (if applicable)",
            "Proof of income and bank account balances",
            "Proof of residency",
        ],
        "steps": [
            "Call SSA at 1-800-772-1213 or visit ssa.gov to start the application",
            "Complete the SSI application (SSA-8001-BK for adults)",
            "Provide medical evidence of disability (SSA may order exams at no cost)",
            "SSA reviews application — decision typically within 3–6 months",
            "If approved, benefits begin from application date; Medicaid usually included",
        ],
    }


def _school_meals(data: dict):
    school_kids = data.get("school_age_children") or 0
    if school_kids <= 0:
        return None
    threshold_free = 1.30 * _monthly_fpl(data["household_size"])
    threshold_reduced = 1.85 * _monthly_fpl(data["household_size"])
    if data["monthly_income"] > threshold_reduced:
        return None
    meal_type = "Free" if data["monthly_income"] <= threshold_free else "Reduced-price"
    benefit = SCHOOL_MEALS_MONTHLY * school_kids
    return {
        "program": "School Meals",
        "full_name": f"National School Lunch & Breakfast Program ({meal_type})",
        "icon": "🍎",
        "description": f"{meal_type} school breakfast and lunch for {school_kids} school-age child{'ren' if school_kids > 1 else ''}.",
        "label": f"~${benefit}/month in school meal savings",
        "estimated_monthly": benefit,
        "agency": "USDA / School District",
        "threshold_pct": "130 (free) / 185 (reduced price)",
        "apply_url": "https://www.fns.usda.gov/nslp",
        "help_url": "https://www.benefits.gov/benefit/623",
        "help_url_label": "School Meals on Benefits.gov",
        "phone_label": "School Nutrition",
        "phone": "1-800-628-9999",
        "documents": [
            "Completed school meal application form (from your child's school)",
            "Child's name, school, and grade",
            "Proof of income OR proof of SNAP/TANF participation (auto-qualifies)",
            "Social Security number of an adult household member",
        ],
        "steps": [
            "Get a free/reduced meal application from your child's school or district website",
            "Fill out the form with household income and member information",
            "Submit to the school cafeteria or main office",
            "Benefits begin as soon as the application is approved (usually within days)",
            "You will receive written notice of approval or denial",
        ],
    }


def _tanf(data: dict):
    threshold = 0.50 * _monthly_fpl(data["household_size"])
    dependents = (data.get("dependents") or 0) + (data.get("children_under5") or 0)
    if data["monthly_income"] > threshold or dependents <= 0:
        return None
    return {
        "program": "TANF",
        "full_name": "Temporary Assistance for Needy Families",
        "icon": "💼",
        "description": "Short-term cash assistance and support services (job training, child care, work readiness) for families with dependent children.",
        "label": f"~${TANF_MONTHLY}/month in cash assistance",
        "estimated_monthly": TANF_MONTHLY,
        "agency": "HHS ACF / State TANF Agency",
        "threshold_pct": "50",
        "apply_url": "https://www.acf.hhs.gov/ofa/programs/tanf/about",
        "help_url": "https://www.benefits.gov/benefit/614",
        "help_url_label": "TANF on Benefits.gov",
        "phone_label": "State TANF Office",
        "phone": "1-877-696-6775",
        "documents": [
            "Photo ID for all adult household members",
            "Birth certificates for all children",
            "Social Security numbers for all household members",
            "Proof of income and employment status",
            "Proof of residency",
        ],
        "steps": [
            "Contact your state TANF agency or local social services office",
            "Complete the TANF application (in person, online, or by mail)",
            "Attend an orientation or eligibility interview",
            "Participate in required work activities (job search, training, etc.)",
            "If approved, receive monthly grant via EBT card or direct deposit",
        ],
    }


def _lifeline(data: dict):
    threshold = 1.35 * _monthly_fpl(data["household_size"])
    snap_elig = data["monthly_income"] <= 1.30 * _monthly_fpl(data["household_size"])
    medicaid_elig = data["monthly_income"] <= 1.38 * _monthly_fpl(data["household_size"])
    ssi_pot = data.get("has_disability") or (data.get("elderly_disabled") or 0) > 0
    auto_qualify = snap_elig or medicaid_elig or ssi_pot
    if data["monthly_income"] > threshold and not auto_qualify:
        return None
    return {
        "program": "Lifeline",
        "full_name": "Lifeline Internet/Phone Benefit (FCC)",
        "icon": "📶",
        "description": "Up to $9.25/month ($34.25 on Tribal lands) off your phone or internet bill. Auto-qualifies if you receive SNAP, Medicaid, or SSI.",
        "label": f"~${LIFELINE_MONTHLY}/month off internet or phone bill",
        "estimated_monthly": LIFELINE_MONTHLY,
        "agency": "FCC / National Verifier",
        "threshold_pct": "135",
        "apply_url": "https://www.lifelinesupport.org",
        "help_url": "https://www.benefits.gov/benefit/1708",
        "help_url_label": "Lifeline on Benefits.gov",
        "phone_label": "Lifeline Support",
        "phone": "1-800-234-9473",
        "documents": [
            "Photo ID or driver's license",
            "Social Security number (last 4 digits)",
            "Proof of income OR proof of SNAP/Medicaid/SSI enrollment",
            "Proof of address",
        ],
        "steps": [
            "Go to lifelinesupport.org to apply through the National Verifier",
            "Choose to qualify by income or by program participation",
            "Upload required documents",
            "Once approved (usually within days), choose a participating carrier",
            "Contact your carrier to apply your Lifeline discount",
        ],
    }


CHECKERS = [_snap, _medicaid, _liheap, _wic, _ccap, _section8, _ssi, _school_meals, _tanf, _lifeline]


def check_eligibility(data: dict) -> list:
    results = []
    for checker in CHECKERS:
        result = checker(data)
        if result is not None:
            results.append(result)
    return results

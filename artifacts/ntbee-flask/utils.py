import csv
import io
from flask import make_response


def export_csv_response(checks):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Date", "ZIP", "Household Size", "Monthly Income ($)",
        "Dependents", "Children <5", "School Children", "Elderly (65+)",
        "Pregnant", "Disability", "Housing Cost ($)", "Child Care ($)",
        "Eligible Programs", "Total Est. Monthly ($)"
    ])
    for c in checks:
        writer.writerow([
            c.id,
            c.created_at.strftime("%Y-%m-%d %H:%M"),
            c.zip_code,
            c.household_size,
            f"{c.monthly_income:.2f}",
            c.dependents,
            c.children_under5,
            c.school_age_children,
            c.elderly_disabled,
            "Yes" if c.pregnant else "No",
            "Yes" if c.has_disability else "No",
            f"{c.monthly_housing:.2f}",
            f"{c.monthly_childcare:.2f}",
            ", ".join(c.programs_list()),
            f"{c.total_estimated_monthly:.2f}",
        ])
    resp = make_response(output.getvalue())
    resp.headers["Content-Type"] = "text/csv; charset=utf-8"
    resp.headers["Content-Disposition"] = "attachment; filename=ntbee_export.csv"
    return resp

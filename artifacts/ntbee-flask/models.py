import json
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    checks = db.relationship("EligibilityCheck", backref="user", lazy=True)

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


class EligibilityCheck(db.Model):
    __tablename__ = "eligibility_checks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    household_size = db.Column(db.Integer, nullable=False)
    monthly_income = db.Column(db.Float, nullable=False)
    zip_code = db.Column(db.String(10), nullable=False)
    dependents = db.Column(db.Integer, default=0)
    children_under5 = db.Column(db.Integer, default=0)
    school_age_children = db.Column(db.Integer, default=0)
    elderly_disabled = db.Column(db.Integer, default=0)
    pregnant = db.Column(db.Boolean, default=False)
    has_disability = db.Column(db.Boolean, default=False)
    monthly_housing = db.Column(db.Float, default=0.0)
    monthly_childcare = db.Column(db.Float, default=0.0)
    eligible_programs = db.Column(db.Text, nullable=False, default="[]")
    total_estimated_monthly = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def programs_list(self) -> list:
        return json.loads(self.eligible_programs)

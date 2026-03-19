from flask_wtf import FlaskForm
from wtforms import (
    StringField, PasswordField, IntegerField, FloatField, BooleanField
)
from wtforms.validators import (
    DataRequired, Email, EqualTo, NumberRange, Optional, Length, ValidationError
)


class LoginForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])


class SignupForm(FlaskForm):
    email = StringField("Email address", validators=[DataRequired(), Email()])
    password = PasswordField(
        "Password",
        validators=[DataRequired(), Length(min=8, message="Password must be at least 8 characters.")]
    )
    confirm = PasswordField(
        "Confirm password",
        validators=[DataRequired(), EqualTo("password", message="Passwords must match.")]
    )


class CheckerForm(FlaskForm):
    household_size = IntegerField(
        "Number of people in your household",
        validators=[DataRequired(message="Please enter your household size."), NumberRange(min=1, max=20)]
    )
    monthly_income = FloatField(
        "Total monthly gross income ($)",
        validators=[DataRequired(message="Please enter your monthly income (enter 0 if none)."), NumberRange(min=0)]
    )
    zip_code = StringField(
        "ZIP code",
        validators=[DataRequired(), Length(min=5, max=5, message="Enter a valid 5-digit ZIP code.")]
    )
    dependents = IntegerField(
        "Total children / dependents in household",
        validators=[Optional(), NumberRange(min=0)],
        default=0
    )
    children_under5 = IntegerField(
        "Children under age 5",
        validators=[Optional(), NumberRange(min=0)],
        default=0
    )
    school_age_children = IntegerField(
        "School-age children (ages 5–17)",
        validators=[Optional(), NumberRange(min=0)],
        default=0
    )
    elderly_disabled = IntegerField(
        "Household members age 65 or older",
        validators=[Optional(), NumberRange(min=0)],
        default=0
    )
    pregnant = BooleanField("Household includes a pregnant, postpartum, or breastfeeding member")
    has_disability = BooleanField("Household includes a member with a disability")
    monthly_housing = FloatField(
        "Monthly rent or mortgage cost ($)",
        validators=[Optional(), NumberRange(min=0)],
        default=0
    )
    monthly_childcare = FloatField(
        "Monthly child care cost ($)",
        validators=[Optional(), NumberRange(min=0)],
        default=0
    )
    save_results = BooleanField("Save my results to my account")

    def validate_zip_code(self, field):
        if field.data and not field.data.isdigit():
            raise ValidationError("ZIP code must be 5 digits only.")

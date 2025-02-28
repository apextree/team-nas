from flask import Blueprint, render_template, request, flash, redirect, url_for, session
from models.user import User
from password_strength import PasswordPolicy
from extensions import db

policy = PasswordPolicy.from_names(
    length=8,  # min length: 8
    uppercase=2,  # need min. 2 uppercase letters
    numbers=2,  # need min. 2 digits
    special=2,  # need min. 2 special characters
    nonletters=2,  # need min. 2 non-letter characters (digits, specials, anything)
)

register_bp = Blueprint("register", __name__)

@register_bp.route("/register", methods=["GET", "POST"])
def register():
    # Store form data to repopulate the form if there are errors
    form_data = {
        'username': request.form.get('username', ''),
        'password': request.form.get('password', '')
    }

    if request.method == "POST":
        username = form_data['username']
        password = form_data['password']
        captcha_response = request.form.get("captcha")
        
        stored_result = session.get("captcha_result")
        
        if not stored_result or captcha_response != stored_result:
            flash("Invalid CAPTCHA. Please try again.", "error")
            return render_template("register.html", form_data=form_data)

        session.pop("captcha_result", None)  # Clear the captcha after use

        # Validate password strength
        password_validation = policy.test(password)
        if password_validation:
            error_messages = ["Password requirements not met:"]
            requirements_not_met = []
            for failed_test in password_validation:
                if failed_test.name == "length":
                    requirements_not_met.append("• Password must be at least 8 characters long")
                elif failed_test.name == "uppercase":
                    requirements_not_met.append("• Password must contain at least 2 uppercase letters")
                elif failed_test.name == "numbers":
                    requirements_not_met.append("• Password must contain at least 2 numbers")
                elif failed_test.name == "special":
                    requirements_not_met.append("• Password must contain at least 2 special characters")
                elif failed_test.name == "nonletters":
                    requirements_not_met.append("• Password must contain at least 2 non-letter characters")
            
            flash("\n".join(error_messages + requirements_not_met), "error")
            return render_template("register.html", 
                                form_data=form_data,
                                password_requirements=requirements_not_met)

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash("Username already exists. Please choose a different one.", "error")
            return render_template("register.html", form_data=form_data)

        try:
            new_user = User(username=username)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            
            flash("Registration successful! You can now log in.", "success")
            return redirect(url_for("login.login"))
        except Exception as e:
            db.session.rollback()
            flash("Registration failed. Please try again.", "error")
            return render_template("register.html", form_data=form_data)

    return render_template("register.html", form_data=form_data)


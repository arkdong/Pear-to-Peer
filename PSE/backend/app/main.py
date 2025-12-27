from flask import request, jsonify
from config import app, db, jwt
from database import Submission, Review, User, Assignment, Course
from datetime import datetime
from helper import *
from sqlalchemy.sql import text
from http import HTTPStatus
from flask_jwt_extended import create_access_token, current_user, jwt_required, unset_jwt_cookies
import json
import os
from functools import wraps


with app.app_context():
    db.create_all()
    if (db.session.query(User).filter(User.email == "admin@admin.com").count() == 0):
        user = User(fname="admin",
                    lname="",
                    email="admin@admin.com",
                    password_hash=hash_password("admin"),
                    grade=0,
                    permission_level=1)

        # add admin to the database
        db.session.add(user)
        db.session.commit()


backend_dir = os.getcwd()
project_dir = os.path.dirname(backend_dir)

CODE_SUBMISSION_PATH = os.path.join(project_dir, "/data/code/")
LLM_RESPONSE_PATH = os.path.join(project_dir, "/data/llm_responses/")
REVIEW_PATH = os.path.join(project_dir, "/data/reviews/")
TEACHER_PRIORITY_LEVEL = 2
ADMIN_PERMISSION_LEVEL = 1
API_KEY = "sk-proj-F7FngqAjYkkNhEM9qSD6T3BlbkFJnK7W7vGUOJQa5V6SXKNg"

paths = [CODE_SUBMISSION_PATH, LLM_RESPONSE_PATH, REVIEW_PATH]
for path in paths:
    if not os.path.exists(path):
        os.makedirs(path)

# Mock data for testing
mock_users = [["John", "Doe", "John@gmail.com", "Password0"],
              ["Jane", "Doe", "Jane@gmail.com", "Password1"],
              ["Alice", "Doe", "Alice@gmail.com", "Password2"],
              ["Bob", "Doe", "Bob@gmail.com", "Password3"],
              ["Charlie", "Doe", "Charlie@gmail.com", "Password4"]]

mock_courses = [['Software Engineering'],
                ['Web Development'],
                ['Data Science'],
                ['Computer Science'],
                ['Computer Engineering']]

mock_assignments = [['Assignment 1', 1, 1, False],
                    ['Assignment 1', 2, 1, False],
                    ['Assignment 1', 3, 1, False],
                    ['Assignment 1', 4, 1, False],
                    ['Assignment 1', 5, 1, False],
                    ['Assignment 2', 1, 1, False],
                    ['Assignment 2', 2, 1, False],
                    ['Assignment 2', 3, 1, False],
                    ['Assignment 2', 4, 1, False],
                    ['Assignment 2', 5, 1, False]]

mock_submissions = [[1, 1, 2], [2, 1, 2], [4, 1, 2], [5, 1, 2],
                    [2, 2, 3], [3, 2, 3], [4, 2, 3], [5, 2, 3],
                    [1, 3, 4], [2, 3, 4], [3, 3, 4], [5, 3, 4],
                    [1, 4, 5], [2, 4, 5], [4, 4, 5], [5, 4, 5],
                    [1, 5, 6], [2, 5, 6], [3, 5, 6], [4, 5, 6]]


# Permission decorator
def permission(required):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if current_user.permission_level > required:
                return jsonify({'error': 'Insufficient permission'}), HTTPStatus.BAD_REQUEST.value
            return func(*args, **kwargs)
        return wrapper
    return decorator


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()


@app.route('/api/login', methods=['GET', 'POST'])
def login():
    # If the request is a POST request, then the user is trying to log in
    if request.method == "POST":
        user = User.query.filter_by(email=request.json.get("email")).first()

        # test if the user does not exists
        if user is None:
            return jsonify({'error': 'Email does not exist or have an account yet'}), HTTPStatus.BAD_REQUEST.value

        # check if the right password was entered
        if user.password_hash != hash_password(request.json.get("password")):
            return jsonify({'error': 'Wrong email or password'}), HTTPStatus.UNAUTHORIZED.value

        # login_user(user)
        access_token = create_access_token(identity=user.id)
        return jsonify({'access_token': access_token}), HTTPStatus.OK.value

    return jsonify({'error': 'Use POST request method'}), HTTPStatus.BAD_REQUEST.value


# API: logs out the current user
@app.route('/api/logout', methods=['POST'])
def logout():
    response = jsonify({'success': 'Logout successful'})
    unset_jwt_cookies(response)
    return response, HTTPStatus.OK.value


# API: registers a new user
@app.route('/api/register', methods=["GET", "POST"])
def register():
    # if the request is a POST request, then the user is trying to register
    if request.method == "POST":
        fname = request.json.get("fname")
        lname = request.json.get("lname")
        email = request.json.get("email")
        confirm_email = request.json.get("confirmEmail")
        password = request.json.get("password")
        confirm_password = request.json.get("confirmPassword")

        if email != confirm_email:
            return jsonify({'error_3': 'Emails must match'}), 400
        if password != confirm_password:
            return jsonify({'error_3': 'Passwords must match'}), 400

        allowed, message = check_user_info(fname, lname, email, password)
        if not allowed:
            return jsonify({'error_1': message}), HTTPStatus.BAD_REQUEST.value

        # add the new user to the database
        user = User(fname=request.json.get("fname"),
                    lname=request.json.get("lname"),
                    email=request.json.get("email"),
                    password_hash=hash_password(password),
                    grade=0,
                    permission_level=4
                    )

        # TODO these tests have to be updated to the new user model
        # some tests to make sure the username is valid
        if (db.session.query(User).filter(User.fname == user.fname).count() > 0 and
                db.session.query(User).filter(User.lname == user.lname).count() > 0):
            return jsonify({'error_2': 'User already exists'}), HTTPStatus.BAD_REQUEST.value

        try:
            # add use to the database
            db.session.add(user)
            db.session.commit()
            return jsonify({'success': 'User created'}), HTTPStatus.OK.value
        except Exception:
            # return "database failed"
            return jsonify({'error_3': 'Database failed'}), HTTPStatus.INTERNAL_SERVER_ERROR.value

    return jsonify({'error': 'Use POST request method'}), HTTPStatus.BAD_REQUEST.value


# Deletes the current user, example usage:
'''
<form action="/delete_current_user" method="post">
    <button type="submit">Delete Account</button>
</form>
'''


# API: returns the permission level of the current user
@app.route('/api/get_permission_level', methods=['GET'])
@jwt_required()
def get_permission_lvl():
    permission_dict = {
        1: 'Admin',
        2: 'Teacher',
        3: 'TA',
        4: 'Student'
    }
    user_lvl = permission_dict[current_user.permission_level]
    return jsonify({'permission_level': user_lvl}), HTTPStatus.OK.value


# API: deletes the current user
@app.route('/api/delete_current_user', methods=['POST'])
@jwt_required()
def delete():
    if request.method == 'POST':
        success, message = delete_user(current_user.id)
        if not success:
            return message, HTTPStatus.INTERNAL_SERVER_ERROR.value

        return message, HTTPStatus.OK.value

    return jsonify({'error': 'Use POST request method'}), HTTPStatus.BAD_REQUEST.value


# Changes the password of the current user
@app.route('/api/change_password', methods=['POST'])
@jwt_required()
def change_password():
    current_password = request.json['current_password']
    new_password = request.json['new_password']
    confirm_password = request.json['confirm_password']

    # Check if the current user knows their current password
    if current_user.password_hash != hash_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), HTTPStatus.BAD_REQUEST.value

    # Check if the new password is valid
    allowed, message = check_password(new_password)
    if not allowed:
        return jsonify({'error_1': message}), HTTPStatus.BAD_REQUEST.value

    # Check if the new password matches the confirmation
    if new_password != confirm_password:
        return jsonify({'error': 'New passwords do not match'}), HTTPStatus.BAD_REQUEST.value

    # Change the password
    try:
        current_user.password_hash = hash_password(new_password)
        db.session.commit()
    except Exception as e:
        return jsonify({'exception': str(e)}), 400

    return jsonify({'success': 'Password changed'}), HTTPStatus.OK.value


# API: returns all assignments belonging to a course
@app.route('/api/course/<int:course_id>')
@jwt_required()
def display_assignments(course_id):
    assignments = db.session.query(Assignment).filter(
        Assignment.course_id == course_id
    ).all()

    if assignments:
        return jsonify([assignment.to_json() for assignment in assignments]), HTTPStatus.OK.value

    return jsonify({'error': 'No assignments found'}), HTTPStatus.BAD_REQUEST.value


@app.route('/api/permissions')
@jwt_required()
@permission(TEACHER_PRIORITY_LEVEL)
def permissions():

    # get all users from the database
    users = User.query.order_by(User.id).all()
    # make sure the current user can only chnage the permissions of users with
    # lower permission level
    users = [user for user in users if user.permission_level >
             current_user.permission_level]

    return jsonify([user.to_dict() for user in users]), HTTPStatus.OK.value


# API: increases the permission level of a user
@app.route('/api/increase_permissions/<int:user_id>')
@jwt_required()
@permission(TEACHER_PRIORITY_LEVEL)
def increase_permissions(user_id):
    # Get user from the database
    user = User.query.get_or_404(user_id)

    try:
        # Check if user permission is highest if so do not up it
        if (user.permission_level == 4):
            return jsonify({'error': 'Cannot increase permissions any further'}), HTTPStatus.BAD_REQUEST.value

        user.permission_level += 1
        db.session.commit()
        return jsonify({'success': 'Permissions increased'}), HTTPStatus.OK.value
    except Exception:
        # return 'There was a problem performing that task'
        return jsonify({'error': 'There was a problem performing that task'}), HTTPStatus.BAD_REQUEST.value


# API: decreases the permission level of a user
@app.route('/api/decrease_permissions/<int:user_id>')
@jwt_required()
@permission(TEACHER_PRIORITY_LEVEL)
def decrease_permissions(user_id):
    user = User.query.get_or_404(user_id)

    try:
        if user.permission_level - 1 == current_user.permission_level:
            return jsonify({'error': 'Cannot decrease permissions any further'}), HTTPStatus.BAD_REQUEST.value

        user.permission_level -= 1
        db.session.commit()
        return jsonify({'success': 'Permissions decreased'}), HTTPStatus.OK.value
    except Exception:
        return jsonify({'error': 'There was a problem performing that task'}), HTTPStatus.BAD_REQUEST.value


# API: Submits an assignment
@app.route('/api/submit_assignment/<int:assignment_id>', methods=['GET', 'POST'])
@jwt_required()
def hand_in(assignment_id):
    if request.method == 'POST':
        # I propose adding the assignment id to the session and having the user
        # preselect the assignment they want to submit. Either that or giving
        # the teacher the id which they can hand out to students.
        DateTime = datetime.now()
        user = current_user.id

        # Check if the user has already submitted an assignment for this
        old_sub = db.session.query(Submission).filter(
            Submission.assignment_id == assignment_id,
            Submission.creator_id == user
        ).first()
        if old_sub is not None:
            old_sub = old_sub.id

        # Creating the database submission object
        sub = Submission(
            assignment_id=assignment_id,
            date=DateTime,
            creator_id=user
        )

        # Try to add the sumbission to the database and save the file
        try:
            db.session.add(sub)
            db.session.commit()
            success, fpath_or_error = file_save(
                'code', CODE_SUBMISSION_PATH, sub.id)
            assert success
        except AssertionError:
            db.session.delete(sub)
            db.session.commit()
            return jsonify({'error': fpath_or_error}), HTTPStatus.BAD_REQUEST.value
        except Exception as e:
            template = "An exception of type {0} occured, Arguments:\n{1!r}"
            message = template.format(type(e).__name__, e.args)
            return jsonify({'exception': message}), HTTPStatus.INTERNAL_SERVER_ERROR.value

        # Delete old submission if it exists
        success, maybe_exception = delete_old_submission(old_sub)
        if not success:
            return maybe_exception, HTTPStatus.INTERNAL_SERVER_ERROR.value

        # Generate LLM response and catch the error if it fails
        success, error = generate_llm_response(fpath_or_error, sub.id)
        if not success:
            return jsonify({'error': error}), HTTPStatus.BAD_REQUEST.value

        return jsonify({'success': 'Hand in successful'}), HTTPStatus.OK.value

    return jsonify({'error': 'Use POST request method'}), HTTPStatus.BAD_REQUEST.value


# API: returns the code and LLM response path of an assignment by id
@app.route('/api/code_and_llm_path/<int:submission_id>', methods=['GET'])
@jwt_required()
def code_and_llm_path(submission_id):
    code_path = search_file_path(CODE_SUBMISSION_PATH, submission_id)
    llm_path = search_file_path(LLM_RESPONSE_PATH, submission_id)

    if os.path.isfile(code_path) and os.path.isfile(llm_path):
        return jsonify({'code_path': code_path, 'llm_path': llm_path}), HTTPStatus.OK.value
    elif os.path.isfile(code_path):
        return jsonify({'code_path': code_path, 'error': 'No LLM response found'}), HTTPStatus.BAD_REQUEST.value
    elif os.path.isfile(llm_path):
        return jsonify({'error': 'No code found', 'llm_path': llm_path}), HTTPStatus.BAD_REQUEST.value

    return jsonify({'error': 'No code and LLM response found'}), HTTPStatus.BAD_REQUEST.value


# API: returns the LLM response of an assignment by id
@app.route('/api/llm_response/<int:submission_id>', methods=['GET'])
@jwt_required()
def get_llm_response(submission_id):
    path = search_file_path(LLM_RESPONSE_PATH, submission_id)

    # check if the path exists
    if not path:
        return jsonify({'error': 'No LLM response path found'}), HTTPStatus.BAD_REQUEST.value

    if (os.path.isfile(path)):
        with open(path, 'r') as file:
            content = file.read()
        return jsonify({'content': content}), HTTPStatus.OK.value

    return jsonify({'error': 'No LLM response found'}), HTTPStatus.BAD_REQUEST.value


# API: returns the path to the code of an assignment by id
@app.route('/api/code_path/<int:submission_id>', methods=['GET'])
@jwt_required()
def get_code_path(submission_id):
    path = search_file_path(CODE_SUBMISSION_PATH, submission_id)

    if not path:
        return jsonify({'error': 'No code path found'}), HTTPStatus.BAD_REQUEST.value

    if (os.path.isfile(path)):
        # return jsonify({'path': path}), HTTPStatus.OK.value
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        return jsonify({'content': content}), HTTPStatus.OK.value

    return jsonify({'error': 'No code found'}), HTTPStatus.BAD_REQUEST.value


# API: returns the comments that have been made for a review by id
@app.route('/api/comments_path/<int:review_id>', methods=['GET'])
@jwt_required()
def get_comments(review_id):
    path = search_file_path(REVIEW_PATH, review_id)

    if not path:
        return jsonify({'error': 'No comment path found'}), HTTPStatus.BAD_REQUEST.value

    if (os.path.isfile(path)):
        with open(path, 'r') as file:
            content = json.load(file)
        return jsonify({'content': content}), HTTPStatus.OK.value

    return jsonify({'error': 'No comments found'}), HTTPStatus.BAD_REQUEST.value


# API: returns all reviews about the current user for a single course + assignment name in JSON
@app.route('/api/reviews_about/<int:course_id>', methods=['GET'])
@jwt_required()
def get_reviews_about(course_id):
    assignments = db.session.query(Assignment).filter(
        Assignment.course_id == course_id
    ).all()

    assignment_ids = [assignment.id for assignment in assignments]
    submissions = db.session.query(Submission).filter(
        Submission.assignment_id.in_(assignment_ids),
        Submission.creator_id == current_user.id
    ).all()

    submission_ids = [submission.id for submission in submissions]
    reviews = db.session.query(Review).filter(
        Review.submission_id.in_(submission_ids)
    ).all()

    if not reviews:
        return jsonify([]), HTTPStatus.OK.value
    return_reviews = []

    for review in reviews:
        review_dict = review.to_json()
        review_dict['assignment_name'] = review.submission.assignment.name
        return_reviews.append(review_dict)

    return jsonify(return_reviews), HTTPStatus.OK.value


# API: return the submitted code belonging to a review by review id
@app.route('/api/review_code/<review_id>', methods=['GET'])
@jwt_required()
def get_code_from_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({'error': 'review not found'}), 400

    submission_id = review.submission_id
    if not submission_id:
        return jsonify({'error': 'review has no submission id'}), 400

    return get_code_path(submission_id)


# API: returns all reviews of the current user in JSON
@app.route('/api/reviews', methods=['GET'])
@jwt_required()
def get_reviews():
    reviews = db.session.query(Review).filter(
        Review.reviewer_id.contains(current_user.id)
    ).all()
    if reviews is None:
        return jsonify({'error': 'no reviews found'})
    return jsonify([review.to_json() for review in reviews]), HTTPStatus.OK.value


# API: returns all submissions of the current user
@app.route("/api/submissions", methods=['GET'])
@jwt_required()
def get_submissions():
    submissions = db.session.query(Submission).filter(
        Submission.creator_id.contains(current_user.id)
    ).all()
    if submissions is None:
        return jsonify({'error': 'no submissions found'})
    return jsonify([submission.to_json() for submission in submissions]), HTTPStatus.OK.value


# API: returns all assignments of a student
@app.route("/api/assignments", methods=['GET'])
@jwt_required()
def get_assignments():
    courses = current_user.courses

    course_ids = [course.id for course in courses]
    assignments = db.session.query(Assignment).filter(
        Assignment.course_id.in_(course_ids)
    ).all()
    if assignments is None:
        return jsonify({'error': 'no assignments found'})
    return jsonify([assignment.to_json() for assignment in assignments]), HTTPStatus.OK.value


# API: returns all courses of the current user
@app.route("/api/courses", methods=['GET'])
@jwt_required()  # added for testing
def get_courses():
    courses = current_user.courses
    if courses is None:
        return jsonify({'error': 'no courses found'})
    return jsonify([course.to_json() for course in courses]), HTTPStatus.OK.value


# API: returns a user by id
@app.route("/api/user/<int:id>", methods=['GET'])
@jwt_required()
def get_user(id):
    user = db.session.query(User).filter(
        User.id == id
    )
    if user is None:
        return jsonify({'error': 'That user does not exist'}), HTTPStatus.BAD_REQUEST.value
    return jsonify(user.to_json()), HTTPStatus.OK.value

# API: returs current user info


@app.route("/api/current_user", methods=['GET'])
@jwt_required()
def get_current_user():
    return jsonify(current_user.to_json()), HTTPStatus.OK.value


# API: returns a review by id
@app.route("/api/review/<int:id>", methods=['GET'])
@jwt_required()
def get_review(id):
    review = db.session.query(Review).filter(
        Review.id == id
    )
    if review is None:
        return jsonify({'error': 'That review does not exist'}), HTTPStatus.BAD_REQUEST.value
    return jsonify(review.to_json()), HTTPStatus.OK.value


# API: returns a submission by id
@app.route("/api/submission/<int:id>", methods=['GET'])
@jwt_required()
def get_submission(id):
    submission = db.session.query(Submission).filter(
        Submission.id == id
    )
    if submission is None:
        return jsonify({'error': 'That submission does not exist'}), HTTPStatus.BAD_REQUEST.value
    return jsonify(submission.to_json()), HTTPStatus.OK.value


# API: returns an assignment by id
@app.route("/api/assignment/<int:id>", methods=['GET'])
@jwt_required()
def get_assignment(id):
    assignment = db.session.query(Assignment).filter(
        Assignment.id == id
    )
    if assignment is None:
        return jsonify({'error': 'That assignment does not exist'}), HTTPStatus.BAD_REQUEST.value
    return jsonify(assignment.to_json()), HTTPStatus.OK.value


# API: returns a course by id
@app.route("/api/course_info/<int:course_id>", methods=['GET'])
@jwt_required()
def get_course(course_id):
    # Fetch the course with the given course_id or return an error if not found
    course = db.session.query(Course).filter(Course.id == course_id).one_or_none()

    if course is None:
        return jsonify({'error': 'That course does not exist'}), HTTPStatus.NOT_FOUND.value

    # Fetch all assignments related to the course
    assignments = db.session.query(Assignment).filter(Assignment.course_id == course_id).all()

    # Format the course information and the assignment data into JSON
    course_info = {
        'id': course.id,
        'name': course.name,
        'course_id': course.course_id,
        'students': [student.to_json() for student in course.students],
        'assignments': [assignment.to_json() for assignment in assignments] if assignments else []
    }

    return jsonify(course_info), HTTPStatus.OK.value


# API: returns all assignments that a student is assigned to that they do not
# yet have a submission for
@app.route("/api/unfinished-assignments", methods=['GET'])
@jwt_required()
def get_unfinished_assignments():
    # Getting all courses, this is necessary to get all assignments a user is
    # assigned to
    courses = current_user.courses

    course_ids = [course.id for course in courses]
    # Get all assignments with a foreign key to Course that is in the
    # course_ids list
    assignments = db.session.query(Assignment).filter(
        Assignment.course_id.in_(course_ids),
        Assignment.closed == False
    ).all()

    assignment_ids = [assignment.id for assignment in assignments]

    # Get all completed assignments by grabbing all submissions linked to the
    # user and assignments
    completed_assignments = db.session.query(Submission).filter(
        Submission.assignment_id.in_(assignment_ids),
        Submission.creator_id == current_user.id
    ).all()
    # Get all assignment ids from the submissions
    completed_assignments = [sub.assignment_id for sub in completed_assignments]

    # Use set difference to easily get all ids of assignments that do not have
    # a submission, time complexity should be O(n + m) where n is the length of
    # assignment_ids and m is the length of completed_assignments
    unfinished_ids = list(set(assignment_ids) - set(completed_assignments))
    # Finally get all assignments from the ids
    unfinished_assignments = db.session.query(Assignment).filter(
        Assignment.id.in_(unfinished_ids)
    ).all()

    # Return a json object
    if unfinished_assignments is None:
        return jsonify({'error': 'no assignments found'})
    return jsonify([a.to_json() for a in unfinished_assignments]), HTTPStatus.OK.value


# API: Returns all reviews that a student is assigned to and no review exists
# for it yet
@app.route("/api/unfinished-reviews", methods=['GET'])
@jwt_required()
def get_unfinished_review():
    # Get reviews that the user is assigned to
    assigned = current_user.assigned_reviews

    assigned = [a.id for a in assigned]

    # Filter out reviews that the user has already done
    done = db.session.query(Review).filter(
        Review.submission_id.in_(assigned),
        Review.reviewer_id == current_user.id
    ).all()

    done = [d.submission_id for d in done]

    # Get all reviews that the user is assigned to but has not done yet
    unfinished = list(set(assigned) - set(done))
    # Get submissions objects from the ids
    submissions = db.session.query(Submission).filter(
        Submission.id.in_(unfinished)
    ).all()

    if submissions is None:
        return jsonify({'error': 'no submissions found'})

    return jsonify([s.to_json() for s in submissions]), HTTPStatus.OK.value


# API: Returns a submission from its id
@app.route('/api/make_review/<int:submission_id>')
@jwt_required()
def make_review(submission_id):
    submission = Submission.query.get_or_404(submission_id)
    return jsonify(submission.to_dict()), HTTPStatus.OK.value


# API: creates a submission for an assignment
@app.route('/api/make_submission', methods=['POST'])
@jwt_required()
def make_submission():
    # create a new submission
    submission = Submission(
        date=datetime.now(),
        assignment_id=request.form.get('assignment_id'),
        creator_id=current_user.id)
    # Add the submission to the database
    try:
        db.session.add(submission)
        db.session.commit()
    except Exception as e:
        return jsonify({'message': str(e)}), 400

    # try to save the file
    try:
        if 'code' not in request.files:
            return jsonify({'message': 'No file part'}), 400
        file = request.files['code']
        path = CODE_SUBMISSION_PATH + str(submission.id) + '.txt'
        file.save(path)
        success, error = generate_llm_response(path, submission.id)
        if not success:
            return jsonify({'message': error}), 400
        return jsonify({'message': 'submission created'}), 200
    except Exception as e:
        db.session.delete(submission)
        db.session.commit()
        return jsonify({'message': str(e)}), 400


# Stores the review in the database, expects something like
''' <form action="{{ url_for('submit_review') }}" method="post">
        <input type="hidden" name="submission_id" value="{{ submission.id }}">
        <textarea name="content" rows="4" cols="50" placeholder="Enter your review"></textarea><br>
        <input type="submit" value="Submit Review">
    </form> '''


# API: submits a review for a submission
@app.route('/api/submit_review', methods=['POST'])
@jwt_required()
def submit_review():
    if request.method == 'POST':
        content = request.json.get('content')
        submission_id = request.json.get('submission_id')

        # Check fields
        if not all([content, submission_id]):
            return jsonify({'error': 'All fields are required'}), HTTPStatus.BAD_REQUEST.value

        # Create a new review
        submission = Submission.query.get_or_404(submission_id)
        review = Review(
            # content=content,
            submission=submission,
            reviewee=submission.creator,
            reviewer=current_user
        )

        # Add review to the database
        try:
            db.session.add(review)
            db.session.commit()

            path = REVIEW_PATH + str(review.id) + ".json"
            with open(path, 'w') as file:
                file.write(content)

            return jsonify({'success': 'Review submitted successfully'}), HTTPStatus.OK.value
        except Exception as e:
            return jsonify({"error": repr(e)}), HTTPStatus.INTERNAL_SERVER_ERROR.value

    return jsonify({'error': 'Use POST request method'}), HTTPStatus.BAD_REQUEST.value


# API: closes an assignments and assigns reviews to students
@app.route('/api/close_assignment/<int:assignment_id>', methods=['GET'])
@jwt_required()
def close_assignment(assignment_id):
    if request.method == 'GET':
        assignment = Assignment.query.get_or_404(assignment_id)
        if (assignment.closed):
            return jsonify({'success': 'Assignment already closed'}), HTTPStatus.OK.value

        assignment.closed = True
        db.session.commit()

        divide_reviews(assignment_id)
        return jsonify({'success': 'Assignment closed'}), HTTPStatus.OK.value

    return jsonify({'error': 'Use GET request method'}), HTTPStatus.BAD_REQUEST.value


# API: get all courses created by the current user (teacher)
@app.route('/api/teacher/created_courses')
@jwt_required()
@permission(TEACHER_PRIORITY_LEVEL)
def list_created_courses():
    courses = current_user.created_courses
    if not courses:
        return jsonify({'message': 'No active courses'}), 200

    return jsonify([course.to_json() for course in courses]), 200


# API: creates a course with multiple assignments
@app.route('/api/teacher/create_course', methods=['POST'])
@jwt_required()
@permission(TEACHER_PRIORITY_LEVEL)
def teacher_create_course():
    course = json.loads(request.form.get('course'))
    students = json.loads(request.form.get('students'))
    assignments = json.loads(request.form.get('assignments'))

    if not course or not course['courseName'] or not course['courseID']:
        return jsonify({'error': 'missing course name or ID'}), HTTPStatus.BAD_REQUEST.value
    if not students:
        return jsonify({'error': 'missing .txt file of student emails'}), HTTPStatus.BAD_REQUEST.value
    if not assignments:
        return jsonify({'error': 'course needs at least one assignment'}), HTTPStatus.BAD_REQUEST.value

    # Check if the given course name is allowed
    allowed, message = check_object_names(course['courseName'], 'course')
    if not allowed:
        return jsonify({'error': message}), 400

    course = Course(name=course['courseName'],
                    course_id=course['courseID'],
                    creator=current_user)

    # Check emails for validity and put them in the course object as a JSON-formatted string
    emails = students['emails']
    for email in emails:
        if not check_email(email):
            return jsonify({'error': 'email list contains invalid emails or has the wrong format'}), HTTPStatus.BAD_REQUEST.value

    # Set course.student_emails to a JSON-formatted string of emails
    course.student_emails = json.dumps(students['emails'])

    try:
        db.session.add(course)
        db.session.commit()
        # TODO possibly handle pdfs of the assignment
        assignment_names = set()
        for assignment_data in assignments:
            if not assignment_data['title'] or not assignment_data['dueDate']:
                db.session.rollback()
                db.session.delete(course)
                db.session.commit()
                return jsonify({'error': 'assignment missing name or due date'}), HTTPStatus.BAD_REQUEST.value

            name = assignment_data['title']
            due_date_str = assignment_data['dueDate']
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()

            # Check if the assignment name is allowed
            allowed, message = check_object_names(name, 'assignment')
            if not allowed:
                db.session.rollback()
                db.session.delete(course)
                db.session.commit()
                return jsonify({'error': message}), 400

            # Check if no two assignments with the same name were given
            if name in assignment_names:
                db.session.rollback()
                db.session.delete(course)
                db.session.commit()
                return jsonify({'error': f'multiple assignments with name {name}, each assignment should have a unique name'}), 400

            # Create and add assignment object to database
            assignment = Assignment(name=name,
                                    due_date=due_date,
                                    creator_id=current_user.id,
                                    course_id=course.id,
                                    closed=False)
            assignment_names.add(name)
            db.session.add(assignment)

        # Commit all assignments to database
        db.session.commit()
        return jsonify({'message': 'Course created'}), HTTPStatus.OK.value
    except Exception as e:
        db.session.rollback()
        db.session.delete(course)
        db.session.commit()
        return jsonify({'error': repr(e)}), HTTPStatus.INTERNAL_SERVER_ERROR.value


# Adds student emails to course after course has already been created
@app.route('/api/teacher/add_email_to_course', methods=['POST'])
@jwt_required()
@permission(TEACHER_PRIORITY_LEVEL)
def add_email():
    course_id = request.json.get('courseID')
    email = request.json.get('studentEmail')
    if not check_email(email):
        return jsonify({'error': 'email list contains invalid emails or has the wrong format'}), HTTPStatus.BAD_REQUEST.value

    course = db.session.get(Course, course_id)
    existing_emails = json.loads(course.student_emails)

    if email in existing_emails:
        return jsonify({'message': 'Email already on list'}), HTTPStatus.OK.value

    existing_emails.append(email)
    student_emails = json.dumps(existing_emails)
    course.student_emails = student_emails
    db.session.commit()

    return jsonify({'message': 'Email added to list'}), HTTPStatus.OK.value


@app.route('/api/teacher/assignment/update', methods=['POST'])
@jwt_required()
@permission(TEACHER_PRIORITY_LEVEL)
def teacher_update_assignment():
    assignment = db.session.get(Assignment, request.json.get('assignment_id'))
    if not assignment:
        return jsonify({'message': 'Assignment not found'}), 404

    name = request.json.get('name')
    allowed, message = check_object_names(name, "assignment")
    if not allowed:
        return jsonify({'message': message}), 400

    # assignment.name = data.get('name', assignment.name)
    assignment.name = name

    try:
        db.session.commit()
        return jsonify({'message': 'Assignment updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': repr(e)}), 400


""" COURSE API """


# API: Adds a user to a course
@app.route('/api/course/enroll_current', methods=['POST'])
@jwt_required()
def enroll_current_user():
    course_id = request.json.get('id')
    course = db.session.get(Course, course_id)
    # check if user is already in course
    if current_user in course.students:
        return jsonify({'message': 'You have already joined this course.'}), HTTPStatus.OK.value

    if course.student_emails:
        student_emails = json.loads(course.student_emails)
        # check if email is in email list
        if current_user.email in student_emails:
            # course.students.append(current_user)
            try:
                current_user.courses.append(course)
                db.session.commit()
            except Exception as e:
                return jsonify({'error': f'Failed to join course: {repr(e)}.'}), HTTPStatus.INTERNAL_SERVER_ERROR.value
            return jsonify({'message': 'Successfully joined course!'}), HTTPStatus.OK.value

    return jsonify({'error': 'You are not allowed to enter this course. Ask your teacher to authorize you.'}), HTTPStatus.UNAUTHORIZED.value


@app.route('/api/course/enroll', methods=['POST'])
@jwt_required()
def enroll_user():
    """ Enroll the given user in the given course."""
    user_id = request.json.get('user_id')
    course_id = request.json.get('course_id')

    user = User.query.get(user_id)
    course = Course.query.get(course_id)

    if not user or not course:
        return jsonify({'message': 'User or Course not found'}), 404

    user.courses.append(course)
    db.session.commit()

    return jsonify({'message': 'User enrolled successfully'}), 200


@app.route('/api/course/unenroll', methods=['POST'])
@jwt_required()
def unenroll_user():
    """ Unenroll the given user from the given course."""
    user_id = request.json.get('user_id')
    course_id = request.json.get('course_id')

    user = User.query.get(user_id)
    course = Course.query.get(course_id)

    if not user or not course:
        return jsonify({'message': 'User or Course not found'}), 404

    user.courses.remove(course)
    db.session.commit()

    return jsonify({'message': 'User unenrolled successfully'}), 200


@app.route('/api/course/unenroll_by_email', methods=['POST'])
@jwt_required()
def unenroll_user_by_email():
    """ Unenroll the user with the given email from the given course."""
    email = request.json.get('email')
    course_id = request.json.get('course_id')

    user = User.query.filter_by(email=email).first()
    course = Course.query.get(course_id)

    if not user or not course:
        return jsonify({'message': 'User or Course not found'}), 404

    user.courses.remove(course)
    db.session.commit()

    return jsonify({'message': 'User unenrolled successfully'}), 200


@app.route('/api/course/course_users/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_students(course_id):
    """ Return all students enrolled in the given course."""
    course = Course.query.get(course_id)

    if not course:
        return jsonify({'message': 'Course not found'}), 404

    students = [student.to_json() for student in course.students]

    return jsonify(students), 200


@app.route('/api/course/user_courses/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_courses(user_id):
    """ Return all courses the given user is enrolled in. """
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    courses = [course.to_json() for course in user.courses]

    return jsonify(courses), 200


# API: returns all courses in the database sorted in alphabetical order
@app.route('/api/course/all/sorted', methods=['GET'])
@jwt_required()
def get_all_courses_sorted():
    courses = db.session.query(Course).all()
    if not courses:
        return jsonify({'message': 'no courses to display'}), 200

    sorted_courses = sorted(courses, key=lambda course: course.name)
    return jsonify({'courses': [course.to_json() for course in sorted_courses]}), 200


@app.route('/api/course/all', methods=['GET'])
@jwt_required()
def get_all_student_courses():
    results = db.session.execute(text("SELECT * FROM student_courses"))
    records = [dict(row) for row in results]
    return jsonify(records), 200


""" ADMIN PAGE
Admin page to exceute CRUD operations on the database for every table. Main
function is admin where the user can modify all entities with helper functions
By: Adam
"""
method_entity_map = {
    'POST': {
        'user': 'admin_create_user',
        'course': 'admin_create_course',
        'assignment': 'admin_create_assignment',
        'submission': 'admin_create_submission',
    },
    'PATCH': {
        'user': 'admin_update_user',
        'course': 'admin_update_course',
        'assignment': 'admin_update_assignment'
    },
    'DELETE': {
        'user': 'admin_delete_user',
        'course': 'admin_delete_course',
        'assignment': 'admin_delete_assignment',
        'submission': 'admin_delete_submission',
    }
}


# Teacher priority here as some admin api functions are also used by teachers,
# all only admin functions are still individually permission protected.
@app.route('/api/admin', methods=['POST', 'GET', 'DELETE', 'PATCH'])
@jwt_required()
@permission(TEACHER_PRIORITY_LEVEL)
def admin():
    """ Main function for the admin page. Handles all CRUD operations by
    querying the method_entity_map for the correct function to call."""
    method = request.method
    entity = request.args.get('entity')
    if not entity:
        users = list(map(lambda x: x.to_json(), User.query.all()))
        courses = list(map(lambda x: x.to_json(), Course.query.all()))
        assignments = list(map(lambda x: x.to_json(), Assignment.query.all()))
        submissions = list(map(lambda x: x.to_json(), Submission.query.all()))
        # reviews = list(map(lambda x: x.to_json(), Review.query.all()))
        # user_course = [dict(row) for row in db.session.execute(text("SELECT * FROM student_courses"))]
        result = db.session.execute(text("SELECT * FROM student_courses"))

        # Fetch all rows
        rows = result.fetchall()

        # Extract column names from the result metadata
        keys = result.keys()

        # Convert rows to a list of dictionaries
        user_course = [dict(zip(keys, row)) for row in rows]
        return jsonify({"users": users,
                        "courses": courses,
                        "assignments": assignments,
                        "submissions": submissions,
                        # "reviews": reviews,
                        "user_course": user_course
                        })
    if entity in method_entity_map[method]:
        func_name = method_entity_map[method][entity]
        return globals()[func_name]()
    return jsonify({'message': 'Invalid request method or entity.'}), 400


@permission(ADMIN_PERMISSION_LEVEL)
@jwt_required()
def admin_create_user():
    """ Create a new user with the given information. """
    # Retrieve user information from the request JSON
    fname = request.json.get("fname")
    lname = request.json.get("lname")
    email = request.json.get("email")
    password = request.json.get("password")
    permission = request.json.get("permission")

    # Check if the user information is valid
    allowed, message = check_user_info(fname, lname, email, password)
    if not allowed:
        return jsonify({'message': str(message)}), 400

    # Create a new User object with the provided information
    user = User(fname=fname,
                lname=lname,
                email=email,
                password_hash=hash_password(password),
                grade=0,
                permission_level=permission
                )

    try:
        # Add the user to the database and commit the changes
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400


@permission(ADMIN_PERMISSION_LEVEL)
@jwt_required()
def admin_delete_user():
    """delete a user with the given id."""
    to_delete = User.query.get(request.args.get('id'))
    try:
        # Delete the user from the database
        db.session.delete(to_delete)
        db.session.commit()
        return jsonify({'message': 'user deleted'}), 200
    except Exception as e:
        # Return an error message if there is an exception
        return jsonify({'message': str(e)}), 400


@permission(ADMIN_PERMISSION_LEVEL)
@jwt_required()
def admin_update_user():
    """Update user information based on the provided JSON data """
    # Retrieve the user with the given ID from the database
    user = User.query.get(request.args.get('id'))

    # Check if the user exists
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Retrieve the data from the JSON request
    fname = request.json.get("fname")
    lname = request.json.get("lname")
    email = request.json.get("email")
    password = request.json.get("password")
    permission = request.json.get("permission")

    # Update user information based on the provided data
    if not password:
        # Validate and update first name
        allowed, message = check_first_name(fname)
        if not allowed:
            return jsonify({'message': str(message)}), 400

        # Validate and update last name
        allowed, message = check_last_name(lname)
        if not allowed:
            return jsonify({'message': str(message)}), 400

        # Validate and update email
        allowed, message = check_email(email)
        if not allowed:
            return jsonify({'message': str(message)}), 400

        # Update user information
        user.fname = fname
        user.lname = lname
        user.email = email
        user.permission_level = permission
    else:
        # Validate all user information, including the password
        allowed, message = check_user_info(fname, lname, email, password)
        if not allowed:
            return jsonify({'message': str(message)}), 400

        # Update user information
        user.fname = fname
        user.lname = lname
        user.email = email
        user.password_hash = hash_password(password)
        user.permission_level = request.json.get("permission")

    try:
        # Commit the changes to the database
        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400


@permission(ADMIN_PERMISSION_LEVEL)
@jwt_required()
def admin_create_course():
    """Create a new course in the database"""
    course = Course(name=request.json.get("name"),
                    course_id=request.json.get("course_id"))
    try:
        db.session.add(course)
        db.session.commit()
        return jsonify({'message': 'Course created successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'database commit failed'}), 400


@permission(ADMIN_PERMISSION_LEVEL)
@jwt_required()
def admin_delete_course():
    """Deletes a course from the database."""
    # Retrieve the course to delete based on the provided ID
    to_delete = Course.query.get(request.args.get('id'))

    try:
        # Delete the course from the database
        db.session.delete(to_delete)
        db.session.commit()

        # Return a success message
        return jsonify({'message': 'Course deleted successfully'}), 200
    except Exception as e:
        # Return an error message if an exception occurs
        return jsonify({'message': str(e)}), 400


# Important note: Also used by teachers
@permission(TEACHER_PRIORITY_LEVEL)
@jwt_required()
def admin_update_course():
    """Update a course with the provided data."""

    # Retrieve the course with the given ID
    course = Course.query.get(request.args.get('id'))

    # If the course does not exist, return a 404 error
    if not course:
        return jsonify({'message': 'Course not found'}), 404

    # Get the data from the request JSON
    data = request.json

    # Update the course attributes with the provided data
    course.name = data.get('name', course.name)
    course.course_id = data.get('course_id', course.course_id)

    try:
        # Commit the changes to the database
        db.session.commit()

        # Return a success message
        return jsonify({'message': 'Course updated successfully'}), 200
    except Exception as e:
        # Return an error message if there is an exception
        return jsonify({'message': repr(e)}), 400


@permission(ADMIN_PERMISSION_LEVEL)
@jwt_required()
def admin_create_assignment():
    """Create a new assignment"""

    # Create a new Assignment object with the extracted data
    assignment = Assignment(
        name=request.json.get("name"),
        course_id=request.json.get("course"),
        creator_id=request.json.get("creator"),
        closed=False
    )

    try:
        # Add the assignment to the database and commit the changes
        db.session.add(assignment)
        db.session.commit()
        return jsonify({'message': 'assignment created'}), 201
    except Exception as e:
        # Return an error message if an exception occurs
        return jsonify({'message': str(e)}), 400


# Important note: Also used by teachers
@permission(TEACHER_PRIORITY_LEVEL)
@jwt_required()
def admin_delete_assignment():
    """Deletes an assignment from the database."""
    # Get the assignment to delete based on the 'id' parameter in the request
    to_delete = Assignment.query.get(request.args.get('id'))

    try:
        # Delete the assignment from the database
        db.session.delete(to_delete)
        db.session.commit()
        return jsonify({'message': 'assignment deleted'}), 200
    except Exception as e:
        # Return an error message if there is an exception
        return jsonify({'message': str(e)}), 400


@permission(ADMIN_PERMISSION_LEVEL)
@jwt_required()
def admin_update_assignment():
    """Update an assignment with the provided data"""
    # Retrieve the assignment with the provided ID
    assignment = Assignment.query.get(request.args.get('id'))
    if not assignment:
        return jsonify({'message': 'Assignment not found'}), 404

    # Get the data from the request JSON
    data = request.json

    # Update the assignment name if provided
    assignment.name = data.get('name', assignment.name)

    # Update the course if provided
    course_id = data.get('course')
    if course_id:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'message': 'Course not found'}), HTTPStatus.BAD_REQUEST
        assignment.course = course

    # Update the creator if provided
    creator_id = data.get('creator')
    if creator_id:
        creator = User.query.get(creator_id)
        if not creator:
            return jsonify({'message': 'User not found'}), HTTPStatus.BAD_REQUEST
        assignment.creator = creator

    try:
        # Commit the changes to the database
        db.session.commit()
        return jsonify({'message': 'Assignment updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': repr(e)}), 400


@permission(ADMIN_PERMISSION_LEVEL)
@jwt_required()
def admin_create_submission():
    """Create a new submission for an assignment """

    # Create a new submission object with the current date and the assignment and creator IDs from the request form
    submission = Submission(
        date=datetime.now(),
        assignment_id=request.form.get('assignment'),
        creator_id=request.form.get('creator'),
    )

    try:
        # Add the submission to the database and commit the changes
        db.session.add(submission)
        db.session.commit()
    except Exception as e:
        # If an error occurs, return a JSON response with the error message and a status code of 400
        return jsonify({'message': str(e)}), 400

    try:
        # Check if the 'code' file is present in the request files
        if 'code' not in request.files:
            return jsonify({'message': 'No file part'}), 400

        # Save the code file to a specific path using the submission ID as the filename
        file = request.files['code']
        path = CODE_SUBMISSION_PATH + str(submission.id) + '.txt'
        file.save(path)

        # Generate the response using the saved code file and the submission ID
        success, error = generate_llm_response(path, submission.id)

        if not success:
            # If the response generation fails, return a JSON response with the error message and a status code of 400
            return jsonify({'message': error}), 400

        # If the submission creation is successful, return a JSON response with a success message and a status code of 200
        return jsonify({'message': 'submission created'}), 200
    except Exception as e:
        # If an error occurs during the process, delete the created submission and rollback the changes
        db.session.delete(submission)
        db.session.commit()
        return jsonify({'message': str(e)}), 400


@permission(ADMIN_PERMISSION_LEVEL)
@jwt_required()
def admin_delete_submission():
    """Deletes a submission from the database"""
    # Retrieve the submission to delete based on the provided ID
    to_delete = Submission.query.get(request.args.get('id'))

    try:
        # Delete the submission from the database
        db.session.delete(to_delete)
        db.session.commit()
        return jsonify({'message': 'submission deleted'}), 200
    except Exception as e:
        # Return an error message if an exception occurs during deletion
        return jsonify({'message': str(e)}), 400

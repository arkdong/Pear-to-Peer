import hashlib
from flask import request, jsonify
from config import db
from werkzeug.utils import secure_filename
from database import User, Submission, Course
import os
from LLMCodeReviewer import get_LLM_response
import copy
import random
import re

ALLOWED_EXTENSIONS = {'.txt', '.pdf', '.py'}
CODE_SUBMISSION_PATH = "/data/code/"
LLM_RESPONSE_PATH = "/data/llm_responses/"
REVIEW_PATH = "/data/reviews/"
API_KEY = 'sk-proj-F7FngqAjYkkNhEM9qSD6T3BlbkFJnK7W7vGUOJQa5V6SXKNg'
MAX_NAME_LENGTH = 50


# Hashes a given password using sha256 encryption
def hash_password(password):
    password_bytes = password.encode('utf-8')
    hash_object = hashlib.sha256(password_bytes)
    return hash_object.hexdigest()


# Returns true if file format in ALLOWED_EXTENSIONS
def allowed_file(fname):
    return os.path.splitext(fname)[1] in ALLOWED_EXTENSIONS


# Saves a file to the database at the given 'path', returns (True,
# path_to_file) if succesfull, otherwise return (False, error_message)
def file_save(label, path, id):
    # Request the file from the POST request and check if it is available
    if label not in request.files:
        error = 'No file part'
        return False, error
    file = request.files[label]
    if not file.filename:
        error = 'No file selected'
        return False, error

    # Secure the filename
    fname = secure_filename(file.filename)

    # Check if the file has an allowed format
    if not allowed_file(fname):
        error = 'File format not allowed'
        return False, error

    fname = str(id) + os.path.splitext(fname)[1]
    fpath = os.path.join(path, fname)
    file.save(fpath)
    return True, fpath


# Returns a code file as a string for the llm prompt.
def parse_for_llm(filepath):
    # quick check if the file exists and is of an allowed type
    if not os.path.isfile(filepath) or not allowed_file(filepath):
        return 0
    with open(filepath, 'r') as f:
        data = f.readlines()
    # Add line numbers
    numbered_data = ''.join(f'{i+1}: {line}' for i, line in enumerate(data))
    return numbered_data


# Deletes a user, their sumbissions and their written and received reviews
# returns (success_bool, jsonified_message)
def delete_user(user_id):
    user = db.session.get(User, user_id)

    try:
        user.submissions.delete()
        user.written_reviews.delete()
        user.received_reviews.delete()
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        return False, jsonify({'error': e.message})

    return True, jsonify({'success': f'user {user_id} deleted'})


# Generates and saves a llm response for a submission at 'fpath' under
# <submission_id>.json, returns (success_bool, message)
def generate_llm_response(fpath, submission_id):
    succes, response = get_LLM_response(fpath, API_KEY)
    if not succes:
        return False, response

    path = LLM_RESPONSE_PATH + str(submission_id) + ".json"
    try:
        with open(path, 'w') as file:
            file.write(response)
    except Exception as e:
        return False, repr(e)

    return True, None


# Searches 'path' for a file with name 'id',
# returns the file path if the file exists, else None
def search_file_path(path, id):
    for _, _, files in os.walk(path):
        for file in files:
            file_name, _ = os.path.splitext(file)
            if file_name == str(id):
                return path + file

    return None


# Check if user already had a submission for the assignment,
# if so, delete the assignment and the LLM response
def delete_old_submission(submission_id):
    submission = db.session.query(Submission).filter_by(id=submission_id).first()
    if submission is None:
        return True

    submission_path = search_file_path(CODE_SUBMISSION_PATH, str(submission.id))
    llm_response_path = search_file_path(LLM_RESPONSE_PATH, str(submission.id))
    if submission_path:
        os.remove(submission_path)
    if llm_response_path:
        os.remove(llm_response_path)

    try:
        db.session.delete(submission)
        db.session.commit()
        return True
    except Exception as e:
        return False, jsonify({"error": e.message})


# Makes sure every student gets appointed a submission to review
def divide_reviews(assignment_id):
    # get all submissions that have been handed in, assuming one final submission per student is saved
    submissions = db.session.query(Submission).filter(
        Submission.assignment_id == assignment_id
    ).all()
    # get all student ids from these submissions
    student_ids = [submission.creator_id for submission in submissions]

    # shuffle the student ids to make the distribution random and not itself
    shuffled_students = copy.deepcopy(student_ids)
    random.shuffle(shuffled_students)

    # check for all individual elements if they are not the same
    # if it is the same, swap with a random element, but itself
    for i in range(len(student_ids)):
        if student_ids[i] == shuffled_students[i]:
            # find a random element that is not itself
            random_index = random.randint(0, len(student_ids) - 1)
            if random_index == i:
                random_index = (random_index + 1) % len(student_ids)

            # swap the elements
            shuffled_students[i], shuffled_students[random_index] = shuffled_students[random_index], shuffled_students[i]

    for i, submission in enumerate(submissions):
        # add this student as a reviewer to the submission
        submission.reviewers.append(db.session.query(User).filter(User.id == shuffled_students[i]).first())
        db.session.commit()


# Checks if a first name is valid,
# returns (success_bool, message)
def check_first_name(first_name):
    allowed = True
    message = []

    if len(first_name) < 2:
        message.append("First name must be at least 2 characters long")
        allowed = False
    if len(first_name) > 50:
        message.append("First name must be less than 50 characters long")
        allowed = False
    if not first_name.isalpha():
        message.append("First name must contain only alphabetic characters")
        allowed = False

    return allowed, message


# Checks if a last name is valid,
# returns (success_bool, message)
def check_last_name(last_name):
    allowed = True
    message = []

    if len(last_name) < 2:
        message.append("Last name must be at least 2 characters long")
        allowed = False
    if len(last_name) > 50:
        message.append("Last name must be less than 50 characters long")
        allowed = False
    if not last_name.isalpha():
        message.append("Last name must contain only alphabetic characters")
        allowed = False

    return allowed, message


# Checks if an email is valid,
# returns (success_bool, message)
def check_email(email):
    allowed = True
    message = []

    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        message.append("Email must be a valid email address")
        allowed = False

    return allowed, message


# Checks if a password is valid,
# returns (success_bool, message)
def check_password(password):
    allowed = True
    message = []

    if len(password) < 8:
        message.append("Password must be at least 8 characters long")
        allowed = False
    if len(password) > 30:
        message.append("Password must be less than 30 characters long")
        allowed = False
    if not any(element.isupper() for element in password):
        message.append("Password must contain at least one uppercase letter")
        allowed = False
    if not any(element.isdigit() for element in password):
        message.append("Password must contain at least one digit")
        allowed = False

    return allowed, message


# Checks if all user info of a registering user is valid,
# returns (success_bool, message)
def check_user_info(first_name, last_name, email, password):
    allowed = True
    message = []

    first_name_allowed, first_name_message = check_first_name(first_name)
    last_name_allowed, last_name_message = check_last_name(last_name)
    email_allowed, email_message = check_email(email)
    password_allowed, password_message = check_password(password)

    if not first_name_allowed:
        allowed = False
        message.extend(first_name_message)
    if not last_name_allowed:
        allowed = False
        message.extend(last_name_message)
    if not email_allowed:
        allowed = False
        message.extend(email_message)
    if not password_allowed:
        allowed = False
        message.extend(password_message)

    return allowed, message


# Checks if the name of an object (course, assignment) is valid,
# returns (success_bool, message)
def check_object_names(name, object_type):
    allowed = True
    message = None
    pattern = r'^[a-zA-Z0-9\s]+$'
    if len(name) > MAX_NAME_LENGTH:
        message = f"{object_type} name must be less than {MAX_NAME_LENGTH} characters long"
        allowed = False
    elif not re.match(pattern, name):
        message = f"{object_type} name can only contain alphanumeric characters, numbers and spaces"
        allowed = False
    else:
        if object_type == 'course':
            other = Course.query.filter_by(name=name).first()
            if other:
                message = f"course '{name}' already exists"
                allowed = False

    return allowed, message

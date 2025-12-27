from config import db
from flask_login import UserMixin
import os


# Association table for many-to-many relationship between User and Course
student_courses = db.Table(
    'student_courses',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('course.id', ondelete='CASCADE'), primary_key=True)
)


student_reviews = db.Table(
    'student_reviews',
    db.Column('reviewer_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('review_id', db.Integer, db.ForeignKey('submission.id'), primary_key=True)
)


class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String(50), nullable=False)
    lname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(64), nullable=False)
    grade = db.Column(db.Float)

    """
    permissions:
    1: Admin
    2: Teacher
    3: TA (not used atm)
    4: Student
    """
    permission_level = db.Column(db.Integer)

    courses = db.relationship('Course', secondary=student_courses, back_populates='students')
    assigned_reviews = db.relationship('Submission', secondary=student_reviews, back_populates='reviewers')

    def to_json(self):
        return {
            'id': self.id,
            'fname': self.fname,
            'lname': self.lname,
            'email': self.email,
            # 'password_hash': self.password_hash,
            'grade': self.grade,
            'permission_level': self.permission_level
        }


class Course(db.Model):
    __tablename__ = 'course'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    course_id = db.Column(db.String(40), nullable=False)
    student_emails = db.Column(db.Text, nullable=True)
    students = db.relationship('User', secondary=student_courses, back_populates='courses')
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id',ondelete='CASCADE'))
    creator = db.relationship("User", backref=db.backref("created_courses",
                                                            cascade="all, delete-orphan",
                                                         lazy='dynamic'))

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'course_id': self.course_id,
            'student_ids': [student.id for student in self.students]
        }


class Assignment(db.Model):
    __tablename__ = 'assignment'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # TODO possibly make not nullable
    due_date = db.Column(db.Date, nullable=True)
    rubric = db.Column(db.String(40), nullable=True)
    description = db.Column(db.String(40), nullable=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id',ondelete='CASCADE'))
    creator = db.relationship("User", backref=db.backref("assignments",
                                                            cascade="all, delete-orphan",
                                                         lazy='dynamic'))
    course_id = db.Column(db.Integer, db.ForeignKey('course.id', ondelete='CASCADE'))
    course = db.relationship("Course",
                             backref=db.backref("course",
                                                cascade="all, delete-orphan",
                                                foreign_keys=[course_id],
                                                uselist=False))
    closed = db.Column(db.Boolean, nullable=False)

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'rubric': self.rubric,
            'description': self.description,
            'creator_id': self.creator_id,
            'course_id': self.course_id,
            'course_name': self.course.name if self.course else None,
            'closed': self.closed,
            'creator_name': f"{self.creator.fname} {self.creator.lname}" if self.creator else None
        }


class Submission(db.Model):
    __tablename__ = 'submission'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id', ondelete='CASCADE'))
    assignment = db.relationship("Assignment",
                                 backref=db.backref("assignment", uselist=False,
                                                    cascade="all, delete-orphan",
                                                    foreign_keys=[assignment_id]))
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    creator = db.relationship("User",
                              backref=db.backref("submissions",
                                                 cascade="all, delete-orphan",
                                                 foreign_keys=[creator_id],
                                                 lazy='dynamic'))
    reviewers = db.relationship('User', secondary=student_reviews, back_populates='assigned_reviews')

    def to_json(self):
        return {
            'id': self.id,
            'date': self.date,
            'assignment_id': self.assignment_id,
            'assignment_name': self.assignment.name if self.assignment else None,
            'creator_id': self.creator_id,
            'creator_name': f"{self.creator.fname} {self.creator.lname}" if self.creator else None,
        }

    def get_language(self):
        _, ext = os.path.splitext(self.code)
        return ext


class Review(db.Model):
    __tablename__ = 'review'
    id = db.Column(db.Integer, primary_key=True)
    # TODO delete this and change it in admin_make_review
    date = db.Column(db.DateTime, nullable=True)
    content = db.Column(db.String(300), nullable=True)
    grade = db.Column(db.Float, nullable=True)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    reviewer = db.relationship("User", foreign_keys=[reviewer_id],
                               backref=db.backref("written_reviews",
                                                  lazy='dynamic'))
    reviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    reviewee = db.relationship("User", foreign_keys=[reviewee_id],
                               backref=db.backref("received_reviews",
                                                  lazy='dynamic'))
    submission_id = db.Column(db.Integer, db.ForeignKey('submission.id'))
    submission = db.relationship("Submission",
                                 backref=db.backref("submission",
                                                    uselist=False))

    def to_json(self):
        return {
            'id': self.id,
            'date': self.date,
            'content': self.content,
            'grade': self.grade,
            'reviewer_id': self.reviewer_id,
            'reviewee_id': self.reviewee_id,
            'submission_id': self.submission_id
        }

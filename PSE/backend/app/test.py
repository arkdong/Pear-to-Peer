from unittest.mock import MagicMock, patch

# Import the function to test
from main import devide_reviews

# Mock the Submission class and db.session
class MockSubmission:
    def __init__(self, creator_id, assignment_id):
        self.creator_id = creator_id
        self.assignment_id = assignment_id
        self.reviewer_ids = None

# Mocking db.session
class MockSession:
    def commit(self):
        pass

# Test function
def test_devide_reviews():
    # Mock data
    assignment_id = 1
    submissions = [
        MockSubmission(creator_id=1, assignment_id=assignment_id),
        MockSubmission(creator_id=2, assignment_id=assignment_id),
        MockSubmission(creator_id=3, assignment_id=assignment_id),
    ]

    # Mock the query and commit methods
    with patch('your_module.Submission.query.filter_by') as mock_filter_by:
        with patch('your_module.db.session', new=MockSession()):
            mock_filter_by.return_value.all.return_value = submissions

            # Execute the function
            devide_reviews(assignment_id)

            # Verify the results
            assigned_reviewers = [submission.reviewer_ids for submission in submissions]
            assert len(assigned_reviewers) == len(set(assigned_reviewers)), "All students should be assigned as reviewers"
            assert all(submission.creator_id != submission.reviewer_ids for submission in submissions), "No student should review their own submission"
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "@remix-run/react";
import styles from '../style/add_course.module.css';


export const meta = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Add a course", content: "Add a course" },
  ];
};

const apiBaseUrl = import.meta.env.VITE_BASE_URL  || 'http://localhost';

function CreateCourse() {
  // State to store course details
  const [course, setCourse] = useState({
    courseName: '',
    courseID: ''
  });

  // State to store the list of students
  const [students, setStudents] = useState({ emails: [] });

  // State to store the list of assignments
  const [assignments, setAssignments] = useState([]);

  // State to store details of a new assignment being added
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    dueDate: '',
  });

  // Check if all required fields are filled
  const isCourseFilled = course.courseName && course.courseID;
  const isStudentsFilled = students.emails.length > 0;
  const isAssignmentFilled = assignments.length > 0;
  const isAllFilled = isCourseFilled && isStudentsFilled && isAssignmentFilled;

  // State to manage the current page view
  const [currentPage, setCurrentPage] = useState('course');

  // State to store JWT token
    const [token, setToken] = useState('');

  // Fetch JWT token from localStorage
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    setToken(authToken);
  }, []);

  // Navigate function from react-router to programmatically navigate to different routes
  const navigate = useNavigate();

  // Handler for reading student emails from a TXT file
  const handleStudentFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "text/plain") {
        alert("Please select a .txt file.");
        return;
      }

      const text = await file.text();
      const studentEmails = text.trim().split(/\s+/);
      setStudents({ emails: studentEmails });
    }
  };

  // Handler for adding a new assignment to the list
  const handleAddAssignment = () => {
    setAssignments([...assignments, newAssignment]);
    setNewAssignment({
      title: '',
      dueDate: '',
    });
  };

  // Handler for removing an assignment from the list
  const handleRemoveAssignment = (index) => {
    const newAssignments = assignments.filter((_, i) => i !== index);
    setAssignments(newAssignments);
  };

  // Handler for creating the course and sending the data to the backend
  const handleCreateCourse = async () => {
    if (!isAllFilled) {
      alert('Fill in all sections!');
      return;
    }

    const formData = new FormData();
    formData.append('course', JSON.stringify(course));
    formData.append('students', JSON.stringify(students));
    formData.append('assignments', JSON.stringify(assignments));

    try {
        // TO DO: add correct route to backend function
      const response = await fetch(`${apiBaseUrl}/api/teacher/create_course`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        body: formData
      });

      if (response.ok) {
        alert('Course created successfully!');
        navigate('/teacher-page')
      } else {
        const errorData = await response.json();
        alert(`Failed to create course: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating course.');
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <button
          className={isCourseFilled ? styles.filled : ''}
          onClick={() => setCurrentPage('course')}
        >
          Add Course
        </button>
        <button
          className={isStudentsFilled ? styles.filled : ''}
          onClick={() => setCurrentPage('students')}
        >
          Add Students
        </button>
        <button
          className={isAssignmentFilled ? styles.filled : ''}
          onClick={() => setCurrentPage('assignments')}
        >
          Add Assignments
        </button>
        <button
          className={isAllFilled ? styles.filled : ''}
          onClick={handleCreateCourse}
        >
          Create course
        </button>
      </nav>

      {currentPage === 'course' && (
        <div>
          <h1>Add new course</h1>
          <form>
            <label>
              Course name:
              <input
                type="text"
                value={course.courseName}
                onChange={(event) => setCourse({ ...course, courseName: event.target.value })}
              />
            </label>
            <label>
              Course ID:
              <input
                type="text"
                value={course.courseID}
                onChange={(event) => setCourse({ ...course, courseID: event.target.value })}
              />
            </label>
          </form>
        </div>
      )}

      {currentPage === 'students' && (
        <div>
          <h2>Add Students</h2>
          <label>
            Upload a .txt file containing student emails seperated by whitespace.
            This will authorize these students to join the course, given their
            accounts are registered with these emails.
            <input type="file" accept=".txt" onChange={handleStudentFileChange} />
          </label>
          <ul>
            {students.emails.map((email, index) => (
              <li key={index}>{email}</li>
            ))}
          </ul>
        </div>
      )}

      {currentPage === 'assignments' && (
        <div>
          <h2>Add Assignments</h2>
          <form>
            <label>
              Assignment title:
              <input
                type="text"
                value={newAssignment.title}
                onChange={(event) => setNewAssignment({ ...newAssignment, title: event.target.value })}
              />
            </label>
            <label>
              Due Date:
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(event) => setNewAssignment({ ...newAssignment, dueDate: event.target.value })}
              />
            </label>
            <div className={styles.buttonContainer}>
              <button className={styles.assigmentButton} type="button" onClick={handleAddAssignment}>
                Add Assignment
              </button>
            </div>
          </form>
          <ul>
            {assignments.map((assignment, index) => (
              <li key={index}>
                {assignment.title}
                <button className={styles.removeButton} onClick={() => handleRemoveAssignment(index)}>✖</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CreateCourse;

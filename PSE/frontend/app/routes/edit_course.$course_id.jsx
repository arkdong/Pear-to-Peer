import React, { useState, useEffect } from 'react';
import '../style/edit_course.css';
import { useParams } from 'react-router-dom';

// Meta data for web browser
export const meta = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Edit a course", content: "Edit a course" },
  ];
};

// Get the base URL from the environment variable
const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost'

// Main component for editing a course
function App() {
  const { course_id } = useParams();
  const [courseName, setCourseName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courseLoaded, setCourseLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // Function to display a message
  const displayMessage = (text) => {
    setMessage(text);
    setShowMessage(true);
    setTimeout(() => {
        setShowMessage(false);
    }, 2000); // Message will disappear after 5 seconds
  };

  // Fetch the updated course details again
  const updateCallback = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/course_info/${course_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setCourseName(data.name);
        setCourseId(data.course_id);
        setStudents(data.students || []);
        setAssignments(data.assignments || []);
    } catch (error) {
        console.error('Failed to refresh course data:', error);
    }
  };

  // Fetch the course details when the component mounts or course_id changes
  useEffect(() => {
    updateCallback();
    setCourseLoaded(true);

  }, [course_id]);

  // Event handlers for input changes
  const handleCourseNameChange = (e) => {
    setCourseName(e.target.value);
  };

  const handleCourseIdChange = (e) => {
    setCourseId(e.target.value);
  };

  const handleStudentEmailChange = (e) => {
    setStudentEmail(e.target.value);
  };

  // Function to add a student to the course
  const addStudent = async (student_email) => {
    try {
      const options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': 'Bearer ' + localStorage.getItem('auth_token') // Correct spelling and add content-type
          },
          body: JSON.stringify({ // Properly include user_id and course_id in the payload
              studentEmail: student_email,
              courseID: course_id
          })
      };

      const url = `${apiBaseUrl}/api/teacher/add_email_to_course`; // modified to correct endpoint

      const response = await fetch(url, options);

      const data = await response.json();

      if (response.ok) {
        updateCallback();
        displayMessage(data.message || "Student added successfully!");
        setStudentEmail('');
    } else {
        displayMessage(data.message || "Failed to add student.");
    }
    } catch (error) {
      alert('Failed to unenroll student: ' + error); // Enhanced error message for clarity
    }
  };

  // Prototype for removing a student from the course
  const removeStudent = async (student_id) => {
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Specify content type
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token') // Correct spelling and add content-type
            },
            body: JSON.stringify({ // Properly include user_id and course_id in the payload
                user_id: student_id,
                course_id: course_id
            })
        };

        const url = `${apiBaseUrl}/api/course/unenroll`; // modified to correct endpoint

        const response = await fetch(url, options);

        if (response.ok) {
            updateCallback(); // Ensure that this function is declared somewhere and updates the GUI accordingly
        } else {
            const data = await response.json();
            alert(data.message); // appropriately display error messages from the server
        }
    } catch (error) {
        alert('Failed to unenroll student: ' + error); // Enhanced error message for clarity
    }
  };

  // Function to modify an assignment name
  const modifyAssignment = async (assignmentID) => {
    const newName = prompt('Enter new name for the assignment:');
    if (newName) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/teacher/assignment/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
          },
          body: JSON.stringify({ name: newName, assignment_id: assignmentID })
        });

        if (response.ok) {
          setAssignments(assignments.map((assignment) => assignment.id === assignmentID ? { ...assignment, name: newName } : assignment));
          alert('Assignment updated successfully');
        }
        else {
          const data = await response.json();
          alert(data.message);
        }
      } catch (error) {
        alert('Failed to update assignment: ' + error); // Enhanced error message for clarity
      }
    }
  };

  // Function to delete an assignment
  const deleteAssignment = async (assignment_id) => {
    try {
      const options = {
          method: 'DELETE',
          headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
          }
      };

      const url = `${apiBaseUrl}/api/admin?entity=assignment&id=${assignment_id}`;

      const response = await fetch(url, options);

      if (response.ok) {
          updateCallback();
      } else {
          const data = await response.json();
          alert(data.message);
      }
    } catch (error) {
      alert(error);
  }
  };

  // Function to update course details
  const updateCourse = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin?entity=course&id=${course_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
        },
        body: JSON.stringify({ name: courseName, course_id: courseId })
      });

      if (response.ok) {
        alert('Course updated successfully');
      }
      else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to update course: ' + error); // Enhanced error message for clarity
    }
  };

  // Function to close an assignment
  const closeAssignment = (assignmentId) => {
    fetch(`${apiBaseUrl}/api/close_assignment/${assignmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
      }
    })
      .then(response => response.json())
      .then(data => {
        alert('Assignment closed successfully');
        setAssignments(assignments.map((assignment) => assignment.id === assignmentId ? { ...assignment, closed: true } : assignment));
      })
      .catch(error => {
        alert('Error closing assignment:', error.message);
      });
  };

  // Display a loading message while the course data is being loaded
  if (!courseLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <div className="flexContainerHeader">
        <h1>Edit Course</h1>
        <div className="course-name">
          <label>
            Course Name:&nbsp;
            <input type="text" value={courseName} onChange={handleCourseNameChange} />
          </label>
          <label>
            Course ID:&nbsp;
            <input type="text" value={courseId} onChange={handleCourseIdChange} />
          </label>
          <button onClick={updateCourse}>Save</button>
        </div>
      </div>
      <div className="flexContainerMain">
        <div className="flexContainerAssignment">
          <h2>Students</h2>
          <div>
            <input
              type="email"
              value={studentEmail}
              onChange={handleStudentEmailChange}
              placeholder="Enter student email"
            />
            <button onClick={() => addStudent(studentEmail)}>Add Student</button>
            {showMessage && <div className="message">{message}</div>}
          </div>
        </div>
        <div className="flexContainerAssignment">
          <h2>Assignments</h2>
          {assignments.length === 0 ? (
            <p>No assignments</p>
          ) : (
            <ul>
              {assignments.map((assignment) => (
                <li key={assignment.id} className="flexContainerAssignmentItem">
                  <p>{assignment.name}</p>
                  <div>
                    <button onClick={() => modifyAssignment(assignment.id)}>Modify</button>
                    <button onClick={() => deleteAssignment(assignment.id)}>Delete</button>
                    {!assignment.closed && (
                      <button onClick={() => closeAssignment(assignment.id)}>Close</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../style/display_courses.module.css';

// Show meta data to the web browser
export const meta = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Display courses", content: "Display courses" },
  ];
};

// Get the base URL from the environment variable
const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost'

// Display the list of courses
export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch the list of courses from the API on mount and when the state changes
  useEffect(() => {

    const fetchCourses = async () => {
      try {
        let currentToken = localStorage.getItem('auth_token')
        const response = await fetch(`${apiBaseUrl}/api/teacher/created_courses`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + currentToken
          }
        });



        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch courses');
          return;
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          if (data.length > 0) {
            setCourses(data);
          }
          else {
            setError('No courses yet!');
          }
        } else {
          setError('Invalid data format from API');
        }
      } catch (err) {
        setError('Failed to fetch courses');
      }
    };

    const newToken = localStorage.getItem('auth_token');
    if (newToken === undefined || newToken === null) {

      navigate('/login');
    } else {

      setToken(newToken);
      fetchCourses();
    }

  }, []);

  // Redirect to the course page
  const goToCoursePage = (courseID) => {
    navigate(`/edit_course/${courseID}`);
  };

  return (
    <main>
      <div className={styles.flexContainerHeader}>
        <h1>Manage courses:</h1>
      </div>
      <div className={styles.flexContainerMain}>
        {error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.flexContainerAssignment}>
            {courses.map((course, index) => (
              <CourseItem
                key={index}
                courseName={course.name}
                onClick={() => goToCoursePage(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Display the course item (for mapping purposes)
function CourseItem({ courseName, onClick }) {
  return (
    <div className={styles.flexContainerAssignmentItem} onClick={onClick}>
      <h1>{courseName}</h1>
    </div>
  );
}

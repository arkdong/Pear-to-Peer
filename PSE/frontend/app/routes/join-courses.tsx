import { useEffect, useState } from 'react';
import styles from "../style/courses.list.module.css";
import { useNavigate } from 'react-router-dom';
import type { MetaFunction } from "@remix-run/node";

// Meta function to set the title of the page and meta data
export const meta: MetaFunction = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Join a course", content: "Allows a user to join a course" },
  ];
};

// Base URL for API calls depending on environment
const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost'

// Join Courses functional component definition
export default function Show() {
  const [courses, setCourses] = useState([]);
  const [stateToken, setToken] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  // useEffect to fetch all courses
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token === undefined || token === null) {

      navigate('/login');
    } else {

      setToken(token);
      fetchAllCourses(token);
    }
  }, []);

  async function fetchAllCourses(token) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/course/all/sorted`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });

      const data = await response.json();


      if (data.message) {
        return (
          <main>
            <div className={styles.flexContainerHeader}>
              <h3>No active courses</h3>
            </div>
          </main>
        );
      }

      setCourses(data.courses);
    } catch (error) {
      console.error('Error:', error);
      alert('Error displaying courses.');
    }
  }

  const handleCourseClick = (course) => {

    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleJoinCourse = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/course/enroll_current`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + stateToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedCourse.id })
      });

      const data = await response.json();
      if (response.ok) {
        setShowModal(false);
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error joining course.');
    }
  };

  const handleCloseModal = (e) => {
    if (e.target.classList.contains(styles.modal)) {
      setShowModal(false);
    }
  };

  const courseItems = courses.map((item) => (
    <ListCourseItem key={item.id} course={item} onClick={() => handleCourseClick(item)} />
  ));

  // Course item component for mapping purposes
  function ListCourseItem({ course, onClick }) {
    return (
      <div className={styles.flexContainerCourseItem} onClick={onClick}>
        <div>
          <h2>{course.name}</h2>
          <p>ID: {course.course_id}</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className={styles.flexContainerHeader}>
        <h1>Courses</h1>
      </div>
      <div className={styles.flexContainerMain}>
        <div className={styles.flexContainerCourse}>
          {courseItems}
        </div>
      </div>
      {showModal && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent}>
            {/* <h2>Join Course</h2> */}
            <h2>Do you want to join {selectedCourse.name}?</h2>
            <button className={styles.button} onClick={handleJoinCourse}>Join</button>
            <button className={styles.button} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}

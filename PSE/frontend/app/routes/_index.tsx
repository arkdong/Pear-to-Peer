import { useEffect } from 'react';
import styles from '../style/home.module.css';
import styles2 from '../style/admin.module.css'
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import randomFourDigit from '../components/random_id';
import type { MetaFunction } from "@remix-run/node";

// Meta function for SEO purposes
export const meta: MetaFunction = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Home", content: "Home page for Pear to Peer" },
  ];
}

// Base URL for API calls with a fallback to localhost if not specified in environment variables
const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost';

// Main Home component
export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [to_hand_in, setHandIn] = useState<any[]>([]);
  const [to_review, setReview] = useState<any[]>([]);
  const [permissions, setPermissions] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useNavigate();

  // Initial function to start fetching data if the user is authenticated
  function start() {
    const token = localStorage.getItem('auth_token');
    if (token === undefined || token === null) {

      navigate('/login');
    } else {

      fetchPermissions(token);
    }
  };

  // Effect hook to start fetching data on component mount
  useEffect(() => {
    start();
  }, [navigate]);

  // Effect hook to handle permissions state change
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (permissions === 'Student') {

      setIsNavigating(true);
      fetchAllHome(token);
    } else if (permissions === 'Teacher') {

      navigate('/teacher-page');
    } else if (permissions === 'Admin') {

      navigate('/admin');
    } else {

    }
  }, [permissions]);

  // Function to fetch user permissions form the API
  async function fetchPermissions(token: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/get_permission_level`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      setPermissions(data.permission_level);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  }

  // Function to fetch all necessary home data for the student
  async function fetchAllHome(token: string) {
    try {
      const urls =[`${apiBaseUrl}/api/courses`,
                   `${apiBaseUrl}/api/unfinished-assignments`,
                   `${apiBaseUrl}/api/unfinished-reviews`]

      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };
      const requests = urls.map(url => fetch(url, options));
      const responses = await Promise.all(requests);
      for (const res of responses) {
        if (!res.ok) {

          throw new Error(res.statusText + ' ' + res.status);
        }
      }

      const data = await Promise.all(responses.map(res => res.json()));
      setCourses(data[0]);
      setHandIn(data[1]);
      setReview(data[2]);
    } catch (error) {
      console.error('Error fetching mult. responses:', error);
    }
  }

  const courseItems = courses.map(course => (
    <div className={styles.clickable} onClick={() => goTo(`/course/${course.id}`)}>
      <h3 key={course.id}>{course.name}</h3>
    </div>
  ));

  const toHandInItems = to_hand_in.map(hand_in => (
    <ListHandInItem key={hand_in.id} assignment={hand_in} />
  ));

  const toReviewItems = to_review.map(review => (
    <ListReviewItem key={review.id} submission={review} />
  ));

  // Utility function to navigate to a specific path
  function goTo(path: string) {
    navigate(path);
  }

  // List item component for handling assignments
  function ListHandInItem({ assignment }) {
    const { id, course_name, name, creator_name, course_id } = assignment;
    const [submissionModalOpen, setSubmissionModalOpen] = useState(false)

    const closeModal = () => {
      setSubmissionModalOpen(false)
    }

    const submissionCreateModal = () => {
      if (!submissionModalOpen) setSubmissionModalOpen(true)
    }

    const onUpdate = () => {
      closeModal()
      navigate(0) // Refresh page
    }
    const SubmissionForm = ({ assignment_id, updateCallback }) => {
      const [isLoading, setIsLoading] = useState(false);

      const onSubmit = async (e) => {
          e.preventDefault()
          setIsLoading(true);

          const formData = new FormData();
          formData.append('assignment_id', assignment_id);

          const codeFile = document.getElementById('code').files[0];
          if (codeFile) formData.append('code', codeFile);

          let url = `${apiBaseUrl}/api/make_submission`
          // let url = 'http://127.0.0.1:5000/api/admin?entity=submission'

          const options = {
              method: "POST",
              body: formData,
              headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
              }
          }
          try {
            const response = await fetch(url, options);
            if (response.status !== 200 && response.status !== 201) {
              const data = await response.json();
              alert(data.message);
            } else {
              updateCallback();
            }
          } catch (error) {
            console.error('Error during submission:', error);
          } finally {
            setIsLoading(false);
          }
      }

      return (
        <div>
        {isLoading ? (
          <div className={styles.spinner}></div>
        ) : (
          <form onSubmit={onSubmit}>
            <div>
              <label htmlFor='code'>Code: </label>
              <input type='file' id='code' />
            </div>
            <button className={styles.button1} type='submit'>Make Submission</button>
          </form>
        )}
      </div>
      )
    }
    return (
      <div className={styles.flexContainerDoubleItemBase}>
        <div>
          <h3>{course_name}</h3>
          <p>{name}</p>
        </div>
        <div>
          <button className={styles.button18} onClick={submissionCreateModal}>Make Submission</button>
          { submissionModalOpen &&
                <div className={styles2.modal}>
                    <div className={styles2['modal-content']}>
                        <span className='close' onClick={closeModal}>
                            &times;
                        </span>
                        <SubmissionForm assignment_id={assignment.id} updateCallback={onUpdate}/>
                    </div>
                </div>
            }
        </div>
      </div>
    );
  }

  // List item component for handling reviews
  function ListReviewItem({ submission }) {
    const { id, date, assignment_id, assignment_name, creator_id } = submission;
    let forDate = '';
    if (date) { // Format date
      const dateObj = new Date(date);
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
      forDate = dateObj.toLocaleDateString(undefined, options);
    }

    return (
      <div className={styles.flexContainerDoubleItem} onClick={() => goTo(`/create-review/${id}`)}>
        <div>
          <h3>{assignment_name}</h3>
          <p>Submitted by Anon{randomFourDigit(creator_id)}</p>
        </div>
        {date !== null ? <h1>{forDate}</h1> : <h1>N/A</h1>}
      </div>
    );
  }

  // If the user is not authenticated, display a loading indicator or nothing
  if (!isNavigating) {
    return null;
  }

  // Main render method for the Home component
  return (
    <main>
      <div className={styles.flexContainerHeader}>
        <h1>To Hand In</h1>
        <h1>To Review</h1>
      </div>
      <div className={styles.flexContainerMain}>
        <div className={styles.flexContainerDouble}>
          {toHandInItems && toHandInItems.length > 0 ?
          toHandInItems :
          <div className={styles.flexContainerReplacementItem}>
            <h3>You're all caught up!</h3>
            <h3>Ask your teacher to hand out more work</h3>
          </div>}
        </div>
        <div className={styles.flexContainerDouble}>
          {toReviewItems && toReviewItems.length > 0 ?
          toReviewItems :
          <div className={styles.flexContainerReplacementItem}>
            <h3>All reviews completed</h3>
            <h3>Check back later for more!</h3>
          </div>}
        </div>
      </div>
      <div className={styles.flexContainerHeader}>
        <h1>Courses</h1>
      </div>
      <div className={styles.flexContainerFooter}>
        {courseItems && courseItems.length > 0 ? courseItems :
        <div className={styles.flexContainerReplacement}>
          <h3>You're not enrolled in any courses.</h3>
          <Link className={styles.a} to='/join-courses'>Browse courses to join here!</Link>
        </div>}
      </div>
    </main>
  );
}

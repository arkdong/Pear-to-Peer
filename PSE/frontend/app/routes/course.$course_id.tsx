import styles from "../style/review.list.module.css";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import type { MetaFunction } from "@remix-run/node";
import randomFourDigit from "../components/random_id";
import styles2 from "../style/home.module.css";


// Meta function to set the title of the page and meta data
export const meta: MetaFunction = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Reviewed Assignments", content: "Reviewed assignments for a certain course" },
  ];
};

// Base URL for API calls depending on environment
const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost'

// Review List functional component definition
export default function ReviewList() {
  const [reviews, setReviews] = useState<any[]>([]);
  const { course_id } = useParams();

  useEffect(() => {
    if (course_id !== undefined) {
      fetchAssignments(course_id)
    }
  }, []);

  // Function to fetch assignments from the API for the course selected
  async function fetchAssignments(id: string) {
    try {
      const url = `${apiBaseUrl}/api/reviews_about/` + id;
      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
        }
      };
      const response = await fetch(url, options);
      if (!response.ok) {
          throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setReviews(data);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Mapping the reviews to the ReviewItem component
  const reviewItems = reviews.map(item => (
    <ReviewItem key={item.id} review={item} />
  ));

  return (
    <main>
      <div className={styles.flexContainerHeader}>
        <h3>Total of {reviewItems.length} reviews by peers</h3>
      </div>
      <div className={styles.flexContainerMain}>
        <div className={styles.flexContainerAssignment}>
          {reviewItems && reviewItems.length > 0 ?
          reviewItems :
          <div className={styles2.flexContainerReplacementItem}>
            <h3>Reviews still pending? Patience is key!</h3>
          </div>}
        </div>
      </div>
    </main>
  );
}

// Review Item component that displays the assignment name and the reviewer
function ReviewItem({ review }) {
  const { id, date, content, grade, reviewer_id, reviewee_id, submission_id, assignment_name } = review;
  const navigate = useNavigate();

  const goToReviewedPage = (id: number) => {
    navigate(`/reviewed/${id}`);
  }

  return (
    <div className={styles.flexContainerAssignmentItem} onClick={() => goToReviewedPage(id)}>
      <div>
        <h1>{assignment_name}</h1>
        <p>Reviewed by Anon{randomFourDigit(reviewer_id)}</p>
      </div>
      {date !== null ? <h1>{date}</h1> : <h1>N/A</h1>}
    </div>
  );
}

import type { MetaFunction } from "@remix-run/node";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css'
import styles from 'app/style/review.module.css';

// Meta function to set the title of the page and meta data
export const meta: MetaFunction = () => {
  return [
    { title: "Pear to Peer" },
    { name: "description", content: "content" },
  ];
};

// Base URL for API calls depending on environment
const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost'

// Reviewed functional component definition
export default function Reviewed() {
  const [code, setCode] = useState('');
  const [comments, setComments] = useState<{[lineNumber: string]: string }>({});
  const [feedback, setFeedback] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const { review_id } = useParams<{ review_id: string }>();

  const navigate = useNavigate();

  // Reference to the code block for syntax highlighting
  const codeRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (codeRef.current) {
        // Reset highlighting if already applied
        if (codeRef.current.dataset.highlighted) {
            delete codeRef.current.dataset.highlighted;
        }
        // Apply syntax highlighting
        hljs.highlightElement(codeRef.current);
    }
}, [code]);  // Dependency on 'code' triggers re-highlighting when 'code' updates

  // Effect to handle feedback message display and potential redirection
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (feedback) {
      setShowMessage(true);
      timer = setTimeout(() => {
        setShowMessage(false);

        // Check if the feedback message is the success message
        if (feedback === 'Review submitted successfully!') {
          // Redirection after an additional 1000ms to allow the message to fade out
          setTimeout(() => {
            navigate('/');  // Update this path to where you want the user to go
          }, 1000);
        } else {
          // Just hide the feedback message if not successful
          setTimeout(() => setFeedback(''), 1000);
        }

        setTimeout(() => setFeedback(''), 1000);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [feedback]);


  // Fetch data needed for viewing the page
  useEffect(() => {

    const fetchCode = async () => {
        // Get code path and fetch code

        try {
            let url = `${apiBaseUrl}/api/review_code/` + review_id;
            let token = localStorage.getItem('auth_token');
            let options = {method: 'GET',
                           headers: {'Authorization': 'Bearer ' + token}};

            if (token == undefined) {
              throw new Error(`Token undefined ERROR!`);
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.content) {
              setCode(data.content);
            } else {
                setFeedback(data.error || 'Failed to fetch code');
            }
        } catch (error) {
            console.error('Network error:', error);
            setFeedback('Failed to interact with API');
        }
    };


    // Function to fetch comments
    const fetchComments = async () => {
      try {
          let url = `${apiBaseUrl}/api/comments_path/${review_id}`;
          let token = localStorage.getItem('auth_token');
          let options = {method: 'GET',
                        headers: {'Authorization': 'Bearer ' + token}};

          if (token == undefined) {
            throw new Error(`Token undefined ERROR!`);
          }

          const response = await fetch(url, options);

          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          if (data && data.content) {
            setComments(data.content);
          } else {
              setFeedback(data.error || 'Failed to fetch code');
          }


      } catch (error) {
          console.error('Network error:', error);
          setFeedback('Failed to interact with API');
      }
    };

    // Fetch code and comments if review_id is available
    if (review_id) {
        fetchCode();
        fetchComments();
    }

}, [review_id]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className={styles.titles}>
        <div className={styles.leftTitle}>
          Code
        </div>
        <div className={styles.rightTitle}>
          Comments
        </div>
      </div>
      <div className={styles.container} style={{ display: 'flex' }}>
        <div className={styles.leftContainer}>

          <div className={styles.lineNumbers}>
            <pre style={{ backgroundColor: '#22304C'}}>
              {code.split('\n').map((line, index) => (
                <div key={index}>
                  {index + 1}
                </div>
              ))}
            </pre>
          </div>

          <div className={styles.code}>
            <pre>
              <code ref={codeRef} className="language-python" style={{ backgroundColor: '#22304C', margin: '0', padding: '0' }}>
                {code}
              </code>
            </pre>
          </div>

        </div>
        <div className={styles.rightContainer}>
          <pre>
            {Object.entries(comments).map(([line, comment], index) => (
              <div key={index}>Line {line}: {comment}</div>
            ))}
          </pre>
        </div>
      </div>
    </div>

  );
}

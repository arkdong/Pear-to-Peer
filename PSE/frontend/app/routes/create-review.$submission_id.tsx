// Import necessary libraries and components
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';
import styles from 'app/style/create_review.module.css';

// Base URL for API calls depending on environment
const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost'

// Meta function to set the title of the page and meta data
export const meta: MetaFunction = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Create a review", content: "Creating a review" },
  ];
};

// CreateReview component definition
export default function CreateReview() {
  // State variables
  const [comments, setComments] = useState<{[lineNumber: string]: string }>({});
  const [feedback, setFeedback] = useState('');
  const [code, setCode] = useState('');
  const [llmSummary, setLlmSummary] = useState('');
  const [llmCritical, setLlmCritical] = useState('');
  const [llmStructure, setLlmStructure] = useState('');
  const [llmStyling, setLlmStyling] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // Get submission_id from URL parameters
  const { submission_id } = useParams<{ submission_id: string }>();

  // Hook for navigation
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
            navigate('/');
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

    // Function to fetch the code content
    const fetchCode = async () => {
        // Get code path and fetch code
        try {
            let url = `${apiBaseUrl}/api/code_path/${submission_id}`;
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

  // Function to fetch LLM responses
  const fetchLLM = async () => {
      try {
        let url = `${apiBaseUrl}/api/llm_response/${submission_id}`;

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

        data.content = JSON.parse(data.content);

        if (!data || !data.content) setFeedback(data.error || 'Failed to fetch LLM response');

        setLlmSummary(data.content.summary + '\n\n');

        // Function to format hints
        const formatHints = (hints: { lines: number[]; hint: string }[]): string => {
          return hints.map(hint => {
              const lines = hint.lines.join(", ");
              return `Line(s): ${lines}\n${hint.hint}\n`;
          }).join("\n");
        };

        // Format and set the LLM responses
        if (data.content.hints.critical.length > 0) {
          const formattedCritical = formatHints(data.content.hints.critical);
          setLlmCritical(formattedCritical + '\n');
        }

        if (data.content.hints.structure.length > 0) {
          const formattedStructure = formatHints(data.content.hints.structure);
          setLlmStructure(formattedStructure + '\n');
        }

        if (data.content.hints.styling.length > 0) {
          const formattedStyling = formatHints(data.content.hints.styling);
          setLlmStyling(formattedStyling + '\n');
        }

    } catch (error) {
        console.error('Network error:', error);
        setFeedback('Failed to interact with API');
    }
  };

    // Fetch code and LLM responses if submission_id is available
    if (submission_id) {
        fetchCode();
        fetchLLM();
    }

}, [submission_id]);


  // Handle the addition of a comment
  const handleAddComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const line = formData.get('line') as string;
    const comment = formData.get('comment') as string;
    if (line && comment) {
      setComments(prevComments => ({
        ...prevComments,
        [line]: comment
      }));
    }
    e.currentTarget.reset();
  };


  // Handle submission of a review
  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.keys(comments).length === 0) {
      setFeedback('Please add at least one comment before submitting the review.');
      setShowMessage(true);
      return; // Prevent the form from submitting
    }

    try {
      let url = `${apiBaseUrl}/api/submit_review`;
        let token = localStorage.getItem('auth_token');
        let options = {method: 'POST',
                   headers: {'Authorization': 'Bearer ' + token,
                             'Content-Type': 'application/json'},
                   body: JSON.stringify({ content: JSON.stringify(comments),
                                          submission_id: submission_id})};

        const response = await fetch(url, options);

        if (response.ok) {
            const responseData = await response.json();
            setFeedback('Review submitted successfully!');
            setComments({});
        } else {
            // If the response has client-side or server-side errors:
            const errorResponse = await response.json();
            setFeedback(errorResponse.error || 'Failed to submit review.');
        }
    } catch (error) {
        console.error('Network error:', error);
        setFeedback('Failed to submit review due to network error');
    }
};


  return (
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>

      {feedback && (
        <div className={styles.feedbackMessage} style={{ opacity: showMessage ? 1 : 0 }}>
          {feedback}
        </div>
      )}

      {/* Display the titles of the page */}
      <div className={styles.titles}>
        <div className={styles.leftTitle}>
          Code
        </div>
        <div className={styles.middleTitle}>
          Hints
        </div>
        <div className={styles.rightTitle}>
          Comments
        </div>
      </div>

      {/* Display the code in the left container */}
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
                {code || "Loading code..."}
              </code>
            </pre>
          </div>
        </div>

        {/* Display the hints in the middle container */}
        <div className={styles.middleContainer}>
          <pre style={{ overflow: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
            <div style={{ fontWeight: 'bold' }}>Summary:</div>
            {llmSummary || "No summary\n\n"}
            <div style={{ fontWeight: 'bold' }}>Critical:</div>
            {llmCritical || "No critical hints\n\n"}
            <div style={{ fontWeight: 'bold' }}>Structure</div>
            {llmStructure || "No structure hints\n\n"}
            <div style={{ fontWeight: 'bold' }}>Styling</div>
            {llmStyling || "No styling hints\n\n"}
          </pre>
        </div>

        {/* Display the comments in the right container */}
        <div className={styles.rightContainer}>
          <form onSubmit={handleAddComment} className={styles.formStyle}>
            <label className={styles.formLabel}>
              <span className={styles.labelText}>
                Line:
              </span>
              <div className={styles.labelField}>
                <input type="number" name="line" min="1" max={code.split('\n').length} required className={styles.lineField} />
              </div>
            </label>
            <label className={styles.formLabel}>
              <span className={styles.labelText}>
                Comment:
              </span>
              <div className={styles.labelField}>
                <textarea name="comment" required className={styles.commentField} rows={3}></textarea>
              </div>
            </label>
            <div className={styles.addButtonContainer}>
              <button type="submit" className={styles.addButton}>Add</button>
            </div>
          </form>
          <span style={{ fontSize: '20px' }}>Comments:</span>
          {Object.entries(comments).map(([line, comment]) => (
            <div key={line}>
              Line {line}: {comment}
            </div>
          ))}
          <form onSubmit={handleSubmitReview}>
            <div className={styles.submitButtonContainer}>
              <button type="submit" className={styles.submitButton}>Submit review</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

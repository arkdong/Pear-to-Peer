import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/teacher-page.css';

// Meta data for the teacher page
export const meta = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Teacher", content: "Teacher controls" },
  ];
};

// Main component for the teacher page
function MyComponent() {
    const navigate = useNavigate();
    return (
        <div className="container">
            <header className="flexContainerHeader">
                <button className="back-button" onClick={() => navigate(-1)}>
                    &#x2190; Back
                </button>
                <div className="header-title">
                  <h1 className="page-title">Teacher Home Page</h1>
                </div>
            </header>
            <main className="flexContainerMain">
                <div className="square-container">
                    <div className="top-row">
                        <div className="square blue" onClick={() => navigate('/display-courses')}>
                            Active courses
                        </div>
                        <div className="square blue" onClick={() => navigate('/add_course')}>
                            Add new course
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MyComponent;

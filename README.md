<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<div align="center">

[![Contributors](https://img.shields.io/badge/Contributors-8-green.svg?style=for-the-badge)](https://github.com/finn-prins/PSE/graphs/contributors)
[![Pull Requests](https://img.shields.io/badge/Pull%20Requests--green.svg?style=for-the-badge)](https://github.com/finn-prins/PSE/pulls)
[![Branches](https://img.shields.io/badge/Branches--green.svg?style=for-the-badge)](https://github.com/finn-prins/PSE/pulls)
[![Issues](https://img.shields.io/badge/Issues--green.svg?style=for-the-badge)](https://github.com/finn-prins/PSE/issues)
[![Insight](https://img.shields.io/badge/Insight--green.svg?style=for-the-badge)](https://github.com/finn-prins/PSE/pulse/monthly)

</div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/finn-prins/PSE">
    <img src="PSE/frontend/app/icons/pear_to_peer_icon.png" alt="Logo" width="200" height="200">
  </a>

<h3 align="center">Pear-to-Peer</h3>

  <p align="center">
    Pear-to-Peer is an innovative web application designed to enhance the educational experience for both teachers and students. Our platform allows teachers to easily manage assignments and facilitates a robust peer review process among students, supported by advanced AI technologies.
    <br />
    <br />
    <a href="https://github.com/finn-prins/PSE"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/finn-prins/PSE">View Demo</a>
    ·
    <a href="https://github.com/finn-prins/PSE/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/finn-prins/PSE/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#techstack">TechStack</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Pear-to-Peer is an innovative web application designed to enhance the educational experience for both teachers and students. Our platform allows teachers to seamlessly manage assignments and facilitates a robust peer review process among students, supported by advanced AI technologies.

Our project is a web application that empowers teachers to elevate the quality of education they provide. Teachers can effortlessly submit assignments for their courses, and students can conveniently submit their work through the platform. Once a student submits their assignment, it is then assigned to another student for review. This peer review process is central to our platform, fostering a collaborative learning environment.

What sets our product apart is our commitment to enhancing the quality of peer reviews. Before a reviewer receives an assignment, it is processed through a Large Language Model (LLM). This advanced AI technology thoroughly examines the submitted code, identifying areas for potential improvement. It then provides the reviewer with insightful hints and guidance on what to look for during their review. This not only helps reviewers provide more constructive feedback but also aids in their own learning and understanding of the subject matter.

By leveraging cutting-edge AI, Pear-to-Peer not only streamlines assignment management but also enriches the educational experience by ensuring that peer reviews are thorough, insightful, and beneficial for all students involved. Our goal is to create a supportive educational ecosystem where both teachers and students can thrive.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

### For Teachers

- **Assignment Management**: Teachers can easily create, manage, and assign coursework to students.
- **Submission Tracking**: Monitor student submissions and track the review process efficiently.

### For Students

- **Submission Portal**: Students can submit their assignments through an intuitive interface.
- **Peer Reviews**: After submission, assignments are randomly assigned to other students for review.

### AI-Powered Review Assistance

What sets Pear-to-Peer apart is our integration of a Large Language Model (LLM) to assist in the peer review process:

- **Automated Code Analysis**: Before a student reviewer receives an assignment, our LLM analyzes the submitted code to identify potential areas of improvement.
- **Review Guidance**: The LLM provides hints and suggestions to the reviewer, helping them focus on critical aspects of the code and enhancing the quality of feedback.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## How It Works

1. **Assignment Submission**: A student submits their assignment through the platform.
2. **AI Analysis**: The submission is processed by our LLM, which examines the code for potential improvements.
3. **Review Assignment**: The analyzed submission is then assigned to another student for review.
4. **Guided Review**: The reviewing student receives the LLM's suggestions, aiding them in providing constructive feedback.
5. **Feedback Delivery**: The review is sent back to the original student, helping them learn and improve their work based on peer and AI-assisted feedback.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Benefits

- **For Teachers**: Streamlined assignment management and enhanced student engagement.
- **For Students**: Improved learning outcomes through constructive peer feedback and AI-guided review processes.
- **Quality Feedback**: Higher quality and more insightful reviews lead to better learning experiences.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## TechStack

These are all the frameworks that were used to make this project.

<div align="left">

### Frontend

[![React][React.js]][React-url] [![Remix][Remix]][Remix-url] [![Figma][Figma]][Figma-url]

### Backend

[![Flask][Flask]][Flask-url] [![SQLalchemy][SQLalchemy]][SQLalchemy-url]

### Other

[![Github][Github]][Github-url] [![OpenAI][OpenAI]][OpenAI-url] [![Docker][Docker]][Docker-url]

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

This section provides instructions on setting up your project locally using Docker. Follow these simple steps to get a local copy up and running. All the necessary requirements have been installed in the docker environment.

### Prerequisites

Make sure you have Docker installed on your machine. You can download and install Docker from [here](https://www.docker.com/products/docker-desktop).

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/Janourid/PSE.git
   ```
2. Navigate to the project directory
   ```sh
   cd PSE
   ```
3. Build and start the Docker containers
   ```sh
   docker compose up --build
   ```

And that's it! The webapp should now be up and running in your Docker environment. You can access it by navigating to `http://localhost` in your web browser.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Server
Note: On the server, the nginx.conf and docker setup are slightly different to allow for SSL certification and HTTPS connection. The details of what is different can be found on the ['server' branch](https://github.com/finn-prins/PSE/tree/server)
<!-- USAGE EXAMPLES -->

## Usage

This section provides an overview of how to use the website, including screenshots of key pages and instructions on navigating and utilizing various features.

### Homepage

The homepage is the central hub of the website, where you can manage assignments and submissions.

<!-- ![Homepage](PSE/assets/Homepage.png) -->
<img src="PSE/assets/Homepage.png" alt="Homepage" width="80%">

<br />

- **Assignments**: On the left side, you will find the list of assignments you need to complete. Click on any assignment to start working on it or submit your work.
- **Submissions for Review**: On the right side, you will see the submissions that require your review. Click on any submission to provide your feedback.
- **Courses**: At the bottom of the page, there is a list of courses you have joined.
- **Navigation Bar**: Use the navbar at the top of the page to navigate to different sections of the website.

<br />

### Review Page

When you click on an open assignment, you will be taken to the review page. This page is designed to facilitate the review process.

<!-- ![Review Page](PSE/assets/Reviewpage.png) -->
<img src="PSE/assets/Reviewpage.png" alt="Reviewpage" width="80%">

<br />

- **Submitted Code**: On the left side, you can view the code that has been submitted and needs to be reviewed.
- **LLM Hints**: In the middle, you will find hints generated by the LLM to help you write a better review.
- **Comment Section**: On the right, there is a section where you can write comments for specific lines of code.

<br />

### Teacher Page

The teacher page allows instructors to create new courses and assignments.

<!-- ![Teacher Page](PSE/assets/Teacherpage.png) -->
<img src="PSE/assets/Teacherpage.png" alt="Teacherpage" width="80%">

<br />

- **Creating a New Course**: Teachers can create new courses by filling in the necessary details and submitting the form.
- **Creating Assignments**: While a course is created, assignments can be added by providing the assignment details and clicking the submit button.
- **Adding Students to the Course**: The teacher can provide a .txt file with emails of students that are allowed in the course. This does **not** automatically enroll the students to the course, they have to do this themselves.

<br />

### Edit Course Page

The edit course page allows teachers to modify course details and manage assignments.

<img src="PSE/assets/Editpage.png" alt="Edit Course Page" width="80%">

<br />

- **Edit Course Details**: Teachers can change the name of the course and update assignment details.
- **Close Assignments**: The most important feature on this page is the ability to close an assignment. When an assignment is closed, no more submissions can be made, and the existing submissions will be divided among students for review.

<br />

### Admin Page

The admin page is where administrators can manage all the data on the platform.

<img src="PSE/assets/Adminpage.png" alt="Admin Page" width="80%">

- **Data Management**: Admins can add or remove all types of data, such as users, courses, and assignments.
- **User Permissions**: Admins can change the permissions of users, allowing them to promote a user to a teacher.

<br />

By following these instructions and using the provided screenshots, you should be able to navigate and utilize the main features of the website effectively.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

We would like to express our gratitude to the following individuals and organizations for their support and contributions to this project:

- The [template](https://github.com/othneildrew/Best-README-Template) for this README
- We used the [OpenAI API](https://openai.com/index/openai-api/) to generate the feedback hints.
- Ana, Jeniffer and the other TA's for their guidance and insightful feedback throughout the development process.
- The UVA for their valuable resources.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TechStack links -->

[Flask]: https://img.shields.io/badge/flask-000000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/en/3.0.x/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Remix]: https://img.shields.io/badge/Remix-35495E?style=for-the-badge&logo=remix&logoColor=4FC08D
[Remix-url]: https://remix.run/
[SQLalchemy]: https://img.shields.io/badge/SQLalchemy-DD0031?style=for-the-badge&logo=sqlalchemy&logoColor=white
[SQLalchemy-url]: https://www.sqlalchemy.org/
[Docker]: https://img.shields.io/badge/Docker-4A4A55?style=for-the-badge&logo=docker&logoColor=blue
[Docker-url]: https://www.docker.com/
[Github]: https://img.shields.io/badge/Github-FF2D20?style=for-the-badge&logo=github&logoColor=white
[Github-url]: https://github.com/
[Figma]: https://img.shields.io/badge/Figma-563D7C?style=for-the-badge&logo=figma&logoColor=white
[Figma-url]: https://www.figma.com/
[OpenAI]: https://img.shields.io/badge/OpenAI-0769AD?style=for-the-badge&logo=openai&logoColor=white
[OpenAI-url]: https://openai.com/

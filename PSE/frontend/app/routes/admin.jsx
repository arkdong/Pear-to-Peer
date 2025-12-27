import { useState, useEffect } from 'react'

// styles import
import styles from "../style/admin.module.css";

// Meta function setup to provide page-specific metadata
export const meta = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Admin", content: "Admin controls" },
  ];
};

// API base URL handling to manage the environment-specific base paths
const apiBaseUrl = import.meta.env.VITE_BASE_URL  || 'http://localhost'

// UserList component handles display and management of user data
const UserList = ({ users, updateCallback, updateUser }) => {
    const [userCourses, setUserCourses] = useState({});

    // useEffect hook to fetch user courses when user data changes
    useEffect(() => {
        const fetchUserCourses = async () => {
            const courseData = {};
            for (const user of users) {
                try {
                    const options = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
                        }
                    }
                    const response = await fetch(`${apiBaseUrl}/api/course/user_courses/${user.id}`, options);

                    if (response.status === 200) {
                        const courses = await response.json();
                        courseData[user.id] = courses;
                    } else {
                        courseData[user.id] = [];
                    }
                } catch (error) {
                    console.error('Error fetching courses for user', user.id, error);
                    courseData[user.id] = [];
                }
            }
            setUserCourses(courseData);
        };

        if (users.length > 0) {
            fetchUserCourses();
        }
    }, [users]);

    // onDelete function to handle user deletion
    const onDelete = async (id) => {
        try {
            const options = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
                }
            };
            const url = `${apiBaseUrl}/api/admin?entity=user&id=` + id;
            const response = await fetch(url, options);

            if (response.status === 200) {
                updateCallback();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    // UserList component return statement
    return (
        <div>
            <h2>Users</h2>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Grade</th>
                        <th>Permission</th>
                        <th>Courses</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.fname}</td>
                            <td>{user.lname}</td>
                            <td>{user.email}</td>
                            <td>{user.grade}</td>
                            <td>{user.permission_level}</td>
                            <td>
                                {userCourses[user.id] ? (
                                    <ul>
                                        {userCourses[user.id].map((course) => (
                                            <li key={course.id}>{course.name} ({course.course_id})</li>
                                        ))}
                                    </ul>
                                ) : (
                                    'Loading...'
                                )}
                            </td>
                            <td>
                                <button className={styles.button} onClick={() => updateUser(user)}>Edit</button>
                                <button className={styles.button} onClick={() => onDelete(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const UserForm = ({ updateCallback, existingUser = {} }) => {
    const [fname, setFname] = useState(existingUser.fname || "")
    const [lname, setLname] = useState(existingUser.lname || "")
    const [email, setEmail] = useState(existingUser.email || "")
    const [password, setPassword] = useState("")
    const [permission, setPermission] = useState(existingUser.permission_level || 0)

    const updating = Object.entries(existingUser).length !== 0

    // onSubmit function to handle form submission
    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            fname,
            lname,
            email,
            password,
            permission
        }
        let url = `${apiBaseUrl}/api/admin?entity=user`

        if (updating) {
            url += '&id=' + existingUser.id
        }
        const options = {
            method: updating ? "PATCH" : "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(url, options)
        if (response.status !== 200 && response.status !== 201) {
            const data = await response.json()
            alert(data.message)
        } else {
            updateCallback()
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor='fname'>First Name: </label>
                <input type='text' id='fname' value={fname}
                    onChange={(e) => setFname(e.target.value)} />
            </div>
            <div>
                <label htmlFor='lname'>Last Name: </label>
                <input type='text' id='lname' value={lname}
                    onChange={(e) => setLname(e.target.value)} />
            </div>
            <div>
                <label htmlFor='email'>Email: </label>
                <input type='text' id='email' value={email}
                    onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                <label htmlFor='password'>Password: </label>
                <input type='text' id='password' value={password}
                    onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
                <label>Permission: </label>
                <div>
                    <label>
                        <input type="radio" value={1} checked={permission === 1}
                            onChange={() => setPermission(1)} />
                        Admin
                    </label>
                    <label>
                        <input type="radio" value={2} checked={permission === 2}
                            onChange={() => setPermission(2)} />
                        Teacher
                    </label>
                    <label>
                        <input type="radio" value={3} checked={permission === 3}
                            onChange={() => setPermission(3)} />
                        TA
                    </label>
                    <label>
                        <input type="radio" value={4} checked={permission === 4}
                            onChange={() => setPermission(4)} />
                        Student
                    </label>
                </div>
            </div>
            <button className={styles.button} type='submit'>{updating ? "Update" : "Create"}</button>
        </form>
    )
}

// CourseList component handles display and management of course data
const CourseList = ({ courses , updateCallback, updateCourse}) => {
    const [courseStudents, setCourseStudents] = useState({});

    // useEffect hook to fetch courses when course data changes
    useEffect(() => {
        const fetchCourseStudents = async () => {
            const studentData = {};
            for (const course of courses) {
                try {
                    const options = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
                        }
                    }
                    const response = await fetch(`${apiBaseUrl}/api/course/course_users/${course.id}`, options);
                    if (response.status === 200) {
                        const students = await response.json();
                        studentData[course.id] = students;
                    } else {
                        studentData[course.id] = [];
                    }
                } catch (error) {
                    console.error('Error fetching students for course', course.id, error);
                    studentData[course.id] = [];
                }
            }
            setCourseStudents(studentData);
        };

        if (courses.length > 0) {
            fetchCourseStudents();
        }
    }, [courses]);

    // onDelete function to handle course deletion
    const onDelete = async (id) => {
        try {
            const options = {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
                }
            }
            const url = `${apiBaseUrl}/api/admin?entity=course&id=` + id

            const response = await fetch(url, options)

            if (response.status == 200) {
                updateCallback()
            } else {
                const data = await response.json()
                alert(data.message)
            }
        } catch (error) {
            alert(error)
        }
    }

    return (
        <div>
        <h2>Courses</h2>
        <table>
            <thead>
            <tr>
                <th>id</th>
                <th>Name</th>
                <th>Course id</th>
                <th>Students</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {courses.map((course) => (
                <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>{course.name}</td>
                    <td>{course.course_id}</td>
                    <td>
                    {courseStudents[course.id] ? (
                                    <ul>
                                        {courseStudents[course.id].map((student) => (
                                            <li key={student.id}>{student.fname} {student.lname} ({student.email})</li>
                                        ))}
                                    </ul>
                                ) : (
                                    'Loading...'
                                )}

                    </td>
                    <td>
                        <button className={styles.button} onClick={() => updateCourse(course)}>Edit</button>
                        <button className={styles.button} onClick={() => onDelete(course.id)}>
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};

// CourseForm component handles course creation and editing
const CourseForm = ({ updateCallback, existingCourse = {} }) => {
    const [name, setName] = useState(existingCourse.name || "")
    const [course_id, setCourseId] = useState(existingCourse.course_id || "")
    const updating = Object.entries(existingCourse).length !== 0
    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            name,
            course_id,
        }

        let url = `${apiBaseUrl}/api/admin?entity=course`

        if (updating) {
            url += '&id=' + existingCourse.id
        }
        const options = {
            method: updating ? "PATCH" : "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(url, options)
        if (response.status !== 200 && response.status !== 201) {
            const data = await response.json()
            alert(data.message)
        } else {
            updateCallback()
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor='name'>Name: </label>
                <input type='text' id='name' value={name}
                    onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
                <label htmlFor='course_id'>Course Id: </label>
                <input type='text' id='course_id' value={course_id}
                    onChange={(e) => setCourseId(e.target.value)} />
            </div>
            <button className={styles.button} type='submit'>{updating ? "Update" : "Create"}</button>
        </form>
    )
}

// UserCourseList component handles user course data display and management
const UserCourseList = ({ userCourse, updateCallback }) => {
    const onUnenroll = async (user_id, course_id) => {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
                },
                body: JSON.stringify({ user_id, course_id }),
            };
            const url = `${apiBaseUrl}/api/course/unenroll`;

            const response = await fetch(url, options);

            if (response.status === 200) {
                updateCallback();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    return (
        <div>
            <h2>User Course</h2>
            <table>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Course ID</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {userCourse.map((elem) => (
                        <tr key={`${elem.user_id}-${elem.course_id}`}>
                            <td>{elem.user_id}</td>
                            <td>{elem.course_id}</td>
                            <td>
                                <button className={styles.button} onClick={() => onUnenroll(elem.user_id, elem.course_id)}>Unenroll</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// UserCourseForm component handles user into course enrollment
const UserCourseForm = ({ updateCallback, users, courses}) => {
    const [user_id, setUser_id] = useState("")
    const [course_id, setCourse_id] = useState("")

    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            user_id,
            course_id
        }

        let url = `${apiBaseUrl}/api/course/enroll`

        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(url, options)
        if (response.status !== 200 && response.status !== 201) {
            const data = await response.json()
            alert(data.message)
        } else {
            updateCallback()
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor='user_id'>User: </label>
                <select id='user_id' value={user_id} onChange={(e) => setUser_id(e.target.value)}>
                    <option value="">Select a user</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.fname} {user.lname}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor='course_id'>Course: </label>
                <select id='course_id' value={course_id} onChange={(e) => setCourse_id(e.target.value)}>
                    <option value="">Select a course</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
            </div>

            <button className={styles.button} type='submit'>Enroll</button>
        </form>
    )
}

// AssignmentList component handles display and management of assignment data
const AssignmentList = ({ assignments , updateCallback, updateAssignment}) => {
    // onDelete function to handle assignment deletion
    const onDelete = async (id) => {
        try {
            const options = {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
                }
            }
            const url = `${apiBaseUrl}/api/admin?entity=assignment&id=` + id

            const response = await fetch(url, options)

            if (response.status == 200) {
                updateCallback()
            } else {
                const data = await response.json()
                alert(data.message)
            }
        } catch (error) {
            alert(error)
        }
    }
    // closeAssignment function to handle assignment closure
    const closeAssignment = async (id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/close_assignment/` + id, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            }
        });
            if (response.status == 200) {
                updateCallback()
            }
        } catch (error) {
            alert(error)
        }
    }
    return (
        <div>
        <h2>Assignment</h2>
        <table>
            <thead>
            <tr>
                <th>id</th>
                <th>Name</th>
                <th>Course id</th>
                <th>Course</th>
                <th>Creator id</th>
                <th>Creator</th>
                <th>Closed</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {assignments.map((assignment) => (
                <tr key={assignment.id}>
                    <td>{assignment.id}</td>
                    <td>{assignment.name}</td>
                    <td>{assignment.course_id}</td>
                    <td>{assignment.course_name}</td>
                    <td>{assignment.creator_id}</td>
                    <td>{assignment.creator_name}</td>
                    <td>{assignment.closed ? "Yes" : "No"}</td>
                    <td>
                        <button className={styles.button} onClick={() => updateAssignment(assignment)}>Edit</button>
                        <button className={styles.button} onClick={() => onDelete(assignment.id)}>
                            Delete
                        </button>
                        <button className={styles.button} onClick={() => closeAssignment(assignment.id)}>Close</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};

// AssignmentForm component handles assignment creation and editing
const AssignmentForm = ({ courses, users, updateCallback, existingAssignment = {} }) => {
    const [name, setName] = useState(existingAssignment.name || "")
    const [course, setCourse] = useState(existingAssignment.course || "");
    const [creator, setCreator] = useState(existingAssignment.creator || "");

    const updating = Object.entries(existingAssignment).length !== 0
    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            name,
            course,
            creator
        }

        let url = `${apiBaseUrl}/api/admin?entity=assignment`

        if (updating) {
            url += '&id=' + existingAssignment.id
        }
        const options = {
            method: updating ? "PATCH" : "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(url, options)
        if (response.status !== 200 && response.status !== 201) {
            const data = await response.json()
            alert(data.message)
        } else {
            updateCallback()
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor='name'>Name: </label>
                <input type='text' id='name' value={name}
                    onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
                <label htmlFor='course'>Course: </label>
                <select id='course' value={course} onChange={(e) => setCourse(e.target.value)}>
                    <option value="">Select a course</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor='creator'>Creator: </label>
                <select id='creator' value={creator} onChange={(e) => setCreator(e.target.value)}>
                    <option value="">Select a creator</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.fname} {user.lname}
                        </option>
                    ))}
                </select>
            </div>
            <button className={styles.button} type='submit'>{updating ? "Update" : "Create"}</button>
        </form>
    )
}

// SubmissionList component handles display and management of submission data
const SubmissionList = ({ submissions , updateCallback}) => {
    // onDelete function to handle submission deletion
    const onDelete = async (id) => {
        try {
            const options = {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
                }
            }
            const url = `${apiBaseUrl}/api/admin?entity=submission&id=` + id

            const response = await fetch(url, options)

            if (response.status == 200) {
                updateCallback()
            } else {
                const data = await response.json()
                alert(data.message)
            }
        } catch (error) {
            alert(error)
        }
    }
    return (
        <div>
        <h2>Submission</h2>
        <table>
            <thead>
            <tr>
                <th>id</th>
                <th>Date</th>
                <th>Assignment id</th>
                <th>Assignment</th>
                <th>Creator id</th>
                <th>Creator</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {submissions.map((submission) => (
                <tr key={submission.id}>
                    <td>{submission.id}</td>
                    <td>{submission.date}</td>
                    <td>{submission.assignment_id}</td>
                    <td>{submission.assignment_name}</td>
                    <td>{submission.creator_id}</td>
                    <td>{submission.creator_name}</td>
                    <td>
                        <button className={styles.button} onClick={() => onDelete(submission.id)}>
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};

// SubmissionForm component handles submission creation and editing
const SubmissionForm = ({ assignments, users, updateCallback, existingSubmission = {} }) => {
    const [assignment, setAssignment] = useState(existingSubmission.assignment || "");
    const [creator, setCreator] = useState(existingSubmission.creator || "");

    const updating = Object.entries(existingSubmission).length !== 0
    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            assignment,
            creator
        }
        const formData = new FormData();
        formData.append('assignment', assignment);
        formData.append('creator', creator);

        const codeFile = document.getElementById('code').files[0];
        if (codeFile) formData.append('code', codeFile);

        let url = `${apiBaseUrl}/api/admin?entity=submission`

        if (updating) {
            url += '&id=' + existingSubmission.id
        }
        const options = {
            method: updating ? "PATCH" : "POST",
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            }
        }
        const response = await fetch(url, options)
        if (response.status !== 200 && response.status !== 201) {
            const data = await response.json()
            alert(data.message)
        } else {
            updateCallback()
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor='assignment'>Assignment: </label>
                <select id='assignment' value={assignment} onChange={(e) => setAssignment(e.target.value)}>
                    <option value="">Select a assignment</option>
                    {assignments.map(assignment => (
                        <option key={assignment.id} value={assignment.id}>
                            {assignment.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor='creator'>Creator: </label>
                <select id='creator' value={creator} onChange={(e) => setCreator(e.target.value)}>
                    <option value="">Select a creator</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.fname} {user.lname}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor='code'>Code: </label>
                <input type='file' id='code' />
            </div>
            <button className={styles.button} type='submit'>{updating ? "Update" : "Create"}</button>
        </form>
    )
}

// Admin component combines the admin page layout and data management
function Admin() {
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState({})
    const [courses, setCourses] = useState([])
    const [currentCourse, setCurrentCourse] = useState({})
    const [assignments, setAssignments] = useState([])
    const [currentAssignment, setCurrentAssignment] = useState({})
    const [submissions, setSubmissions] = useState([])
    const [currentSubmission, setCurrentSubmission] = useState({})
    const [userCourse, setUserCourse] = useState([])

    const [userModalOpen, setUserModalOpen] = useState(false)
    const [courseModalOpen, setCourseModalOpen] = useState(false)
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
    const [submissionModalOpen, setSubmissionModalOpen] = useState(false)
    const [userCourseModalOpen, setUserCourseModalOpen] = useState(false)


    const [token, setToken] = useState('');

    useEffect(() => {
        const authToken = localStorage.getItem('auth_token')
        setToken(authToken)
        fetchData()
    }, [])

    const fetchData = async () => {
        const options = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            }
        }
        const response = await fetch(`${apiBaseUrl}/api/admin`, options)

        const data = await response.json()
        setUsers(data.users)
        setCourses(data.courses)
        setAssignments(data.assignments)
        setSubmissions(data.submissions)
        setUserCourse(data.user_course)
    }

    // multiple modal functions to handle modal opening and closing
    const closeModal = () => {
        setCurrentUser({})
        setCurrentCourse({})
        setCurrentAssignment({})
        setCurrentSubmission({})
        setUserModalOpen(false)
        setCourseModalOpen(false)
        setAssignmentModalOpen(false)
        setSubmissionModalOpen(false)
        setUserCourseModalOpen(false)
    }

    const userCreateModal = () => {
        if (!userModalOpen) setUserModalOpen(true)
    }

    const userEditModal = (user) => {
        if (userModalOpen) return
        setCurrentUser(user)
        setUserModalOpen(true)
    }

    const courseCreateModal = () => {
        if (!courseModalOpen) setCourseModalOpen(true)
    }

    const courseEditModal = (course) => {
        if (courseModalOpen) return
        setCurrentCourse(course)
        setCourseModalOpen(true)
    }

    const assignmentCreateModal = () => {
        if (!assignmentModalOpen) setAssignmentModalOpen(true)
    }

    const assignmentEditModal = (assignment) => {
        if (assignmentModalOpen) return
        setCurrentAssignment(assignment)
        setAssignmentModalOpen(true)
    }

    const submissionCreateModal = () => {
        if (!submissionModalOpen) setSubmissionModalOpen(true)
    }

    const submissionEditModal = (submission) => {
        if (submissionModalOpen) return
        setCurrentSubmission(submission)
        setSubmissionModalOpen(true)
    }

    const userCourseEnrollModal = () => {
        if (!userCourseModalOpen) setUserCourseModalOpen(true)
    }

    const onUpdate = () => {
        closeModal()
        fetchData()
        setCurrentUser({})
        setCurrentCourse({})
        setCurrentAssignment({})
        setCurrentSubmission({})
    }

    return (
    <div>
        <h1>Admin</h1>
        <div>
            <UserList users={users} updateCallback={onUpdate}
                updateUser={userEditModal}/>
            <button className={styles.button} onClick={userCreateModal}>Create User</button>
            { userModalOpen &&
                <div className='modal'>
                    <div className='modal-content'>
                        <span className='close' onClick={closeModal}>
                            &times;
                        </span>
                        <UserForm existingUser={currentUser}
                            updateCallback={onUpdate}/>
                    </div>
                </div>
            }
        </div>
        <hr></hr>
        <div>
            <CourseList courses={courses} updateCallback={onUpdate}
                updateCourse={courseEditModal}/>
            <button className={styles.button} onClick={courseCreateModal}>Create Course</button>
            { courseModalOpen &&
                <div className='modal'>
                    <div className='modal-content'>
                        <span className='close' onClick={closeModal}>
                            &times;
                        </span>
                        <CourseForm existingCourse={currentCourse}
                            updateCallback={onUpdate}/>
                    </div>
                </div>
            }
        </div>
        <hr></hr>
        <div>
            <UserCourseList userCourse={userCourse} updateCallback={onUpdate}/>
            <button className={styles.button} onClick={userCourseEnrollModal}>Enroll User</button>
            { userCourseModalOpen &&
                <div className='modal'>
                    <div className='modal-content'>
                        <span className='close' onClick={closeModal}>
                            &times;
                        </span>
                        <UserCourseForm users={users} courses={courses}
                            updateCallback={onUpdate}/>
                    </div>
                </div>
            }
        </div>
        <hr></hr>
        <div>
            <AssignmentList assignments={assignments} updateCallback={onUpdate}
                updateAssignment={assignmentEditModal}/>
            <button className={styles.button} onClick={assignmentCreateModal}>Create Assignment</button>
            { assignmentModalOpen &&
                <div className='modal'>
                    <div className='modal-content'>
                        <span className='close' onClick={closeModal}>
                            &times;
                        </span>
                        <AssignmentForm courses={courses} users={users}
                            existingAssignment={currentAssignment}
                            updateCallback={onUpdate}/>
                    </div>
                </div>
            }
        </div>
        <hr></hr>
        <div>
            <SubmissionList submissions={submissions} updateCallback={onUpdate}/>
            <button className={styles.button} onClick={submissionCreateModal}>Create Submission</button>
            { submissionModalOpen &&
                <div className='modal'>
                    <div className='modal-content'>
                        <span className='close' onClick={closeModal}>
                            &times;
                        </span>
                        <SubmissionForm assignments={assignments} users={users}
                            existingSubmission={currentSubmission}
                            updateCallback={onUpdate}/>
                    </div>
                </div>
            }
        </div>
    </div>
    )
}

export default Admin

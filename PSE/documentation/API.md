# API Documentation

All URIs are relative to *http://localhost:8080/* or to the equivalent production host.

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**login**](API.md#login) | **POST** /api/login | Authenticates a user and returns a JWT token on success |
| [**logout**](API.md#logout) | **POST** /api/logout | Logs out the current user by unsetting the JWT cookies |
| [**register**](API.md#register) | **POST** /api/register | Registers a new user |
| [**delete_current_user**](API.md#delete_current_user) | **POST** /api/delete_current_user | Deletes the currently authenticated user |
| [**change_password**](API.md#change_password) | **POST** /api/change_password | Changes the password of the currently authenticated user |
| [**permissions**](API.md#permissions) | **GET** /api/permissions | Fetches a list of users with lower permission levels for permission management |
| [**increase_permissions**](API.md#increase_permissions) | **GET** /api/increase_permissions/<int:user_id> | Increases the permission level of the specified user |
| [**decrease_permissions**](API.md#decrease_permissions) | **GET** /api/decrease_permissions/<int:user_id> | Decreases the permission level of the specified user |
| [**create_assignment**](API.md#create_assignment) | **POST** /api/create_assignment | Creates a new assignment |
| [**close_assignment**](API.md#close_assignment) | **GET** /api/close_assignment/<int:assignment_id> | Closes an assignment and divides reviews |
| [**hand_in**](API.md#hand_in) | **POST** /api/hand_in | Submits an assignment |
| [**submit_review**](API.md#submit_review) | **POST** /api/submit_review | Submits a review for an assignment |
| [**code_and_llm_path**](API.md#code_and_llm_path) | **GET** /api/code_and_llm_path/<int:submission_id> | Returns the code and LLM response path of an assignment by ID |
| [**llm_response_path**](API.md#llm_response_path) | **GET** /api/llm_response_path/<int:submission_id> | Returns the LLM response of an assignment by ID |
| [**code_path**](API.md#code_path) | **GET** /api/code_path/<int:submission_id> | Returns the path to the code of an assignment by ID |
| [**comments_path**](API.md#comments_path) | **GET** /api/comments_path/<int:review_id> | Returns the comments that have been made for a review by ID |
| [**api_reviews**](API.md#api_reviews) | **GET** /api/reviews | Fetches all reviews of the current user |
| [**api_submissions**](API.md#api_submissions) | **GET** /api/submissions | Fetches all submissions of the current user |
| [**api_assignments**](API.md#api_assignments) | **GET** /api/assignments | Fetches all assignments of the current user |
| [**api_courses**](API.md#api_courses) | **GET** /api/courses | Fetches all courses of the current user |
| [**api_user**](API.md#api_user) | **GET** /api/user/<int:id> | Fetches a user by ID |
| [**api_review**](API.md#api_review) | **GET** /api/review/<int:id> | Fetches a review by ID |
| [**api_submission**](API.md#api_submission) | **GET** /api/submission/<int:id> | Fetches a submission by ID |
| [**api_assignment**](API.md#api_assignment) | **GET** /api/assignment/<int:id> | Fetches an assignment by ID |
| [**api_course**](API.md#api_course) | **GET** /api/course/<int:id> | Fetches a course by ID |
| [**api_unfinished_assignments**](API.md#api_unfinished_assignments) | **GET** /api/unfinished-assignments | Fetches all unfinished assignments of the current user |
| [**api_unfinished_reviews**](API.md#api_unfinished_reviews) | **GET** /api/unfinished-reviews | Fetches all unfinished reviews of the current user |
| [**admin**](API.md#admin) | **GET** /api/admin | Admin dashboard for managing users and courses |
| [**admin_create_user**](API.md#admin_create_user) | **POST** /api/admin/create_user | Creates a new user |
| [**admin_delete_user**](API.md#admin_delete_user) | **DELETE** /api/admin/delete_user | Deletes a user by ID |
| [**admin_update_user**](API.md#admin_update_user) | **PATCH** /api/admin/update_user | Updates user information |
| [**admin_create_course**](API.md#admin_create_course) | **POST** /api/admin/create_course | Creates a new course |
| [**admin_delete_course**](API.md#admin_delete_course) | **DELETE** /api/admin/delete_course | Deletes a course by ID |
| [**admin_update_course**](API.md#admin_update_course) | **PATCH** /api/admin/update_course | Updates course information |
| [**admin_create_assignment**](API.md#admin_create_assignment) | **POST** /api/admin/create_assignment | Creates a new assignment |
| [**admin_delete_assignment**](API.md#admin_delete_assignment) | **DELETE** /api/admin/delete_assignment | Deletes an assignment by ID |
| [**admin_update_assignment**](API.md#admin_update_assignment) | **PATCH** /api/admin/update_assignment | Updates assignment information |
| [**admin_create_submission**](API.md#admin_create_submission) | **POST** /api/admin/create_submission | Creates a new submission |
| [**admin_delete_submission**](API.md#admin_delete_submission) | **DELETE** /api/admin/delete_submission | Deletes a submission by ID |
---

## **login**

> login(email, password)

### Description

Authenticates a user and returns a JWT token on success.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **email** | **string** | User's email      | [mandatory] |
| **password** | **string** | User's password | [mandatory] |

### Return type

JSON object containing the access token.

### Authorization

None

### HTTP request headers

**Content-Type**: application/json

---

## **logout**

> logout()

### Description

Logs out the current user by unsetting the JWT cookies.

### Parameters

None

### Return type

None

### Authorization

JWT token required in cookies

### HTTP request headers

**Content-Type**: application/json

---

## **register**

> register(fname, lname, email, password)

### Description

Registers a new user.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **fname** | **string** | User's first name | [mandatory] |
| **lname** | **string** | User's last name  | [mandatory] |
| **email** | **string** | User's email      | [mandatory] |
| **password** | **string** | User's password | [mandatory] |

### Return type

None

### Authorization

None

### HTTP request headers

**Content-Type**: application/json

---

## **delete_current_user**

> delete_current_user()

### Description

Deletes the currently authenticated user.

### Parameters

None

### Return type

None

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **change_password**

> change_password(current_password, new_password, confirm_password)

### Description

Changes the password of the currently authenticated user.

### Parameters

| Name               | Type     | Description                  | Notes       |
|--------------------|----------|------------------------------|-------------|
| **current_password** | **string** | Current password           | [mandatory] |
| **new_password**     | **string** | New password               | [mandatory] |
| **confirm_password** | **string** | Confirmation of the new password | [mandatory] |

### Return type

None

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **permissions**

> permissions()

### Description

Fetches a list of users with lower permission levels for permission management.

### Parameters

None

### Return type

JSON array of user objects.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **increase_permissions**

> increase_permissions(user_id)

### Description

Increases the permission level of the specified user.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **user_id** | **int** | ID of the user to increase permissions for | [mandatory] |

### Return type

None

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **decrease_permissions**

> decrease_permissions(user_id)

### Description

Decreases the permission level of the specified user.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **user_id** | **int** | ID of the user to decrease permissions for | [mandatory] |

### Return type

None

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **create_assignment**

> create_assignment(name, course)

### Description

Creates a new assignment.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **name**   | **string** | Name of the assignment | [mandatory] |
| **course** | **string** | Course name           | [mandatory] |

### Return type

None

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **close_assignment**

> close_assignment(assignment_id)

### Description

Closes an assignment and divides reviews.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **assignment_id** | **int** | ID of the assignment to close | [mandatory] |

### Return type

None

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **hand_in**

> hand_in(assignment_id)

### Description

Submits an assignment.

### Parameters

| Name             | Type     | Description                   | Notes       |
|------------------|----------|-------------------------------|-------------|
| **assignment_id** | **int**  | ID of the assignment being submitted | [mandatory] |

### Return type

None

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **submit_review**

> submit_review(content, submission_id)

### Description

Submits a review for an assignment.

### Parameters

| Name             | Type     | Description                   | Notes       |
|------------------|----------|-------------------------------|-------------|
| **content**      | **string** | Content of the review         | [mandatory] |
| **submission_id** | **int**   | ID of the submission being reviewed | [mandatory] |

### Return type

None

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **code_and_llm_path**

> code_and_llm_path(submission_id)

### Description

Returns the code and LLM response path of an assignment by ID.

### Parameters

| Name              | Type    | Description           | Notes       |
|-------------------|---------|-----------------------|-------------|
| **submission_id** | **int** | Submission ID         | [mandatory] |

### Return type

JSON object with paths to code and LLM response, or an error message.

### Authorization

JWT token required.

### HTTP request headers

**Content-Type**: application/json

---

## **llm_response_path**

> llm_response_path(submission_id)

### Description

Returns the LLM response of an assignment by ID.

### Parameters

| Name              | Type    | Description           | Notes       |
|-------------------|---------|-----------------------|-------------|
| **submission_id** | **int** | Submission ID         | [mandatory] |

### Return type

Content of the LLM response file, or an error message.

### Authorization

JWT token required.

### HTTP request headers

**Content-Type**: application/json

---

## **code_path**

> code_path(submission_id)

### Description

Returns the path to the code of an assignment by ID.

### Parameters

| Name              | Type    | Description           | Notes       |
|-------------------|---------|-----------------------|-------------|
| **submission_id** | **int** | Submission ID         | [mandatory] |

### Return type

JSON object with path to code, or an error message.

### Authorization

JWT token required.

### HTTP request headers

**Content-Type**: application/json

---

## **comments_path**

> comments_path(review_id)

### Description

Returns the comments that have been made for a review by ID.

### Parameters

| Name          | Type    | Description           | Notes       |
|---------------|---------|-----------------------|-------------|
| **review_id** | **int** | Review ID             | [mandatory] |

### Return type

Content of the comments file, or an error message.

### Authorization

JWT token required.

### HTTP request headers

**Content-Type**: application/json

---

## **api_reviews**

> api_reviews()

### Description

Fetches all reviews of the current user.

### Parameters

None

### Return type

JSON array of review objects.

### Authorization

JWT token required

### HTTP request headers

**Content-Type

**: application/json

---

## **api_submissions**

> api_submissions()

### Description

Fetches all submissions of the current user.

### Parameters

None

### Return type

JSON array of submission objects.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **api_assignments**

> api_assignments()

### Description

Fetches all assignments of the current user.

### Parameters

None

### Return type

JSON array of assignment objects.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **api_courses**

> api_courses()

### Description

Fetches all courses of the current user.

### Parameters

None

### Return type

JSON array of course objects.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **api_user**

> api_user(id)

### Description

Fetches a user by ID.

### Parameters

| Name | Type  | Description     | Notes       |
|------|-------|-----------------|-------------|
| **id** | **int** | ID of the user | [mandatory] |

### Return type

JSON object representing the user.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **api_review**

> api_review(id)

### Description

Fetches a review by ID.

### Parameters

| Name | Type  | Description     | Notes       |
|------|-------|-----------------|-------------|
| **id** | **int** | ID of the review | [mandatory] |

### Return type

JSON object representing the review.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **api_submission**

> api_submission(id)

### Description

Fetches a submission by ID.

### Parameters

| Name | Type  | Description     | Notes       |
|------|-------|-----------------|-------------|
| **id** | **int** | ID of the submission | [mandatory] |

### Return type

JSON object representing the submission.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **api_assignment**

> api_assignment(id)

### Description

Fetches an assignment by ID.

### Parameters

| Name | Type  | Description     | Notes       |
|------|-------|-----------------|-------------|
| **id** | **int** | ID of the assignment | [mandatory] |

### Return type

JSON object representing the assignment.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **api_course**

> api_course(id)

### Description

Fetches a course by ID.

### Parameters

| Name | Type  | Description     | Notes       |
|------|-------|-----------------|-------------|
| **id** | **int** | ID of the course | [mandatory] |

### Return type

JSON object representing the course.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **api_unfinished_assignments**

> api_unfinished_assignments()

### Description

Fetches all unfinished assignments of the current user.

### Parameters

None

### Return type

JSON array of unfinished assignment objects.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **api_unfinished_reviews**

> api_unfinished_reviews()

### Description

Fetches all unfinished reviews of the current user.

### Parameters

None

### Return type

JSON array of unfinished review objects.

### Authorization

JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin**

> admin()

### Description

Admin dashboard for managing users and courses.

### Parameters

None

### Return type

Admin dashboard page.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_create_user**

> admin_create_user(fname, lname, email, password, permission)

### Description

Creates a new user.

### Parameters

| Name          | Type     | Description       | Notes       |
|---------------|----------|-------------------|-------------|
| **fname**     | **string** | User's first name | [mandatory] |
| **lname**     | **string** | User's last name  | [mandatory] |
| **email**     | **string** | User's email      | [mandatory] |
| **password**  | **string** | User's password   | [mandatory] |
| **permission**| **int**    | User's permission level | [mandatory] |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_delete_user**

> admin_delete_user(id)

### Description

Deletes a user by ID.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **id**    | **int**  | User ID           | [mandatory] |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_update_user**

> admin_update_user(id, fname, lname, email, password, permission)

### Description

Updates user information.

### Parameters

| Name          | Type     | Description                  | Notes       |
|---------------|----------|------------------------------|-------------|
| **id**        | **int**  | User ID                      | [mandatory] |
| **fname**     | **string** | User's first name             | [optional]  |
| **lname**     | **string** | User's last name              | [optional]  |
| **email**     | **string** | User's email                  | [optional]  |
| **password**  | **string** | User's password               | [optional]  |
| **permission**| **int**    | User's permission level       | [optional]  |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_create_course**

> admin_create_course(name, course_id)

### Description

Creates a new course.

### Parameters

| Name          | Type     | Description       | Notes       |
|---------------|----------|-------------------|-------------|
| **name**      | **string** | Course name       | [mandatory] |
| **course_id** | **string** | Course ID         | [mandatory] |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_delete_course**

> admin_delete_course(id)

### Description

Deletes a course by ID.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **id**    | **int**  | Course ID         | [mandatory] |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_update_course**

> admin_update_course(id, name, course_id)

### Description

Updates course information.

### Parameters

| Name          | Type     | Description       | Notes       |
|---------------|----------|-------------------|-------------|
| **id**        | **int**  | Course ID         | [mandatory] |
| **name**      | **string** | Course name       | [optional]  |
| **course_id** | **string** | Course ID         | [optional]  |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_create_assignment**

> admin_create_assignment(name, course_id, creator_id)

### Description

Creates a new assignment.

### Parameters

| Name          | Type     | Description       | Notes       |
|---------------|----------|-------------------|-------------|
| **name**      | **string** | Assignment name  | [mandatory] |
| **course_id** | **int**    | Course ID        | [mandatory] |
| **creator_id**| **int**    | Creator ID       | [mandatory] |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_delete_assignment**

> admin_delete_assignment(id)

### Description

Deletes an assignment by ID.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **id**    | **int**  | Assignment ID     | [mandatory] |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_update_assignment**

> admin_update_assignment(id, name, course_id, creator_id)

### Description

Updates assignment information.

### Parameters

| Name          | Type     | Description       | Notes       |
|---------------|----------|-------------------|-------------|
| **id**        | **int**  | Assignment ID     | [mandatory] |
| **name**      | **string** | Assignment name  | [optional]  |
| **course_id** | **int**    | Course ID        | [optional]  |
| **creator_id**| **int**    | Creator ID       | [optional]  |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json

---

## **admin_create_submission**

> admin_create_submission(assignment_id, creator_id, code_file)

### Description

Creates a new submission for an assignment.

### Parameters

| Name          | Type     | Description       | Notes       |
|---------------|----------|-------------------|-------------|
| **assignment_id** | **int** | Assignment ID  | [mandatory] |
| **creator_id**| **int**    | Creator ID       | [mandatory] |
| **code_file** | **file**   | Code file        | [mandatory] |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: multipart/form-data

---

## **admin_delete_submission**

> admin_delete_submission(id)

### Description

Deletes a submission by ID.

### Parameters

| Name      | Type     | Description       | Notes       |
|-----------|----------|-------------------|-------------|
| **id**    | **int**  | Submission ID     | [mandatory] |

### Return type

JSON object with success message.

### Authorization

Admin-level JWT token required

### HTTP request headers

**Content-Type**: application/json
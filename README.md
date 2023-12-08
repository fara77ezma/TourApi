# Tour API Project

Welcome to the Tour API, a robust backend solution designed to manage tours and user profiles efficiently. This API offers a comprehensive set of endpoints, allowing you to perform actions such as creating and updating tours, managing user accounts, and retrieving valuable statistical insights about your tours.

## Introduction

The Tour API is built with a focus on simplicity, security, and extensibility. It serves as the backbone for applications that involve tour management, providing developers with a powerful toolset to integrate tour-related functionalities seamlessly.

## Key Features

- User Authentication: Securely manage user accounts, handle authentication, and control access based on user roles.
- User Management: Update user profiles, deactivate or delete accounts, and retrieve a list of all users (admin-only).
- Tour Management: Create, update, and delete tours, retrieve details about specific tours, and access statistics about tours.


## Technologies Used:
- Backend: Node Js & Express Js
- Database: MongoDB
## Getting Started:
You can find it live [here](https://story-book-0prn.onrender.com/) or you can run it locally:
1. Clone this repository to your local machine:
```
git clone -b master (https://github.com/fara77ezma/TourApi.git)
```
2. Set up the necessary dependencies:
```
cd TourApi
npm install
```   
3. Run the application locally :
```
npm run start:prod
```
- The blog runs on localhost://3000




## API Endpoints

### 1. **Signup**

- **Description**: Register a new user.
- **Method**: POST
- **Endpoint**: `/api/signup`
- **Parameters**: { name, email, password, passwordConfirm }
- **Response**: { status, token, data: { user } }

### 2. **Login**

- **Description**: Log in with existing credentials.
- **Method**: POST
- **Endpoint**: `/api/login`
- **Parameters**: { email, password }
- **Response**: { status, token, data: { user } }

### 3. **Forget Password**

- **Description**: Initiate the password reset process.
- **Method**: POST
- **Endpoint**: `/api/forgetPassword`
- **Parameters**: { email }
- **Response**: { status, message }

### 4. **Reset Password**

- **Description**: Reset user password using a token.
- **Method**: PATCH
- **Endpoint**: `/api/resetPassword/:token`
- **Parameters**: { password, passwordConfirm }
- **Response**: { status, token, data: { user } }

### 5. **Update Password**

- **Description**: Update user password.
- **Method**: PATCH
- **Endpoint**: `/api/updateMyPassword`
- **Parameters**: { passwordCurrent, password, passwordConfirm }
- **Response**: { status, token, data: { user } }

### 6. **Update User Profile**

- **Description**: Update user information.
- **Method**: PATCH
- **Endpoint**: `/api/updateMe`
- **Parameters**: { name, email, photo }
- **Response**: { status, data: { user } }

### 7. **Delete User Account**

- **Description**: Deactivate and delete user account.
- **Method**: DELETE
- **Endpoint**: `/api/deleteMe`
- **Response**: { status, message: "Account deleted successfully" }

### 8. **Get All Users**

- **Description**: Get a list of all users (admin only).
- **Method**: GET
- **Endpoint**: `/api/`
- **Response**: { status, data: { users } }

### 9. **Create Tour**

- **Description**: Create a new tour.
- **Method**: POST
- **Endpoint**: `/api/tours`
- **Parameters**: { name, duration, maxGroupSize, difficulty, price, summary, description, imageCover, startDates, locations }
- **Response**: { status, data: { tour } }

### 10. **Get All Tours**

- **Description**: Get a list of all tours.
- **Method**: GET
- **Endpoint**: `/api/tours`
- **Response**: { status, results, data: { tours } }

 ### 11. **Get Tour by ID**

- **Description**: Get details of a specific tour by ID.
- **Method**: GET
- **Endpoint**: `/api/tours/:id`
- **Parameters**: { id }
- **Response**: { status, data: { tour } }

### 12. **Update Tour**

- **Description**: Update details of a specific tour.
- **Method**: PATCH
- **Endpoint**: `/api/tours/:id`
- **Parameters**: { name, duration, maxGroupSize, difficulty, price, summary, description, imageCover, startDates, locations }
- **Response**: { status, data: { tour } }

### 13. **Delete Tour**

- **Description**: Delete a specific tour (admin and lead-guide only).
- **Method**: DELETE
- **Endpoint**: `/api/tours/:id`
- **Parameters**: { id }
- **Response**: { status, message: "Tour deleted successfully" }

### 14. **Get Tour Statistics**

- **Description**: Get statistics about tours.
- **Method**: GET
- **Endpoint**: `/api/tours/tour-stats`
- **Response**: { status, data: { stats } }

### 15. **Get Monthly Tour Plan**

- **Description**: Get a monthly plan of tour starts.
- **Method**: GET
- **Endpoint**: `/api/tours/montly-plan/:year`
- **Parameters**: { year }
- **Response**: { status, results, data: { plan } }

  ### User Authentication

1. **Signup**: Create a new user account.
2. **Login**: Authenticate and receive a JWT token.
3. **Protect**: Middleware to protect routes requiring authentication.
4. **Restrict To**: Middleware to restrict access based on user roles.
5. **Forgot Password**: Send a reset token to the user's email.
6. **Reset Password**: Reset the user's password using a valid token.
7. **Update Password**: Update the user's password.

### User Management

8. **Update User Profile**: Update user information.
9. **Delete User Account**: Deactivate and delete the user account.
10. **Get All Users**: Get a list of all users (admin only).

### Tour Management

11. **Create Tour**: Create a new tour.
12. **Get All Tours**: Get a list of all tours.
13. **Get Tour by ID**: Get details of a specific tour by ID.
14. **Update Tour**: Update details of a specific tour.
15. **Delete Tour**: Delete a specific tour (admin and lead-guide only).
16. **Get Tour Statistics**: Get statistics about tours.
17. **Get Monthly Tour Plan**: Get a monthly plan of tour starts.

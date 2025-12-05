📘 CourseMaster – Learning Management System (LMS)

CourseMaster is a full-stack Learning Management System (LMS) built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).
It enables students to browse courses, enroll, track progress, and submit assignments, while admins can manage courses, view stats, and maintain the platform through a secure role-based system.

🔐 Authentication

JWT-based authentication

Secure HTTP-only cookie storage

Role-based access control (student, admin)

Admin roles are assigned automatically if the user's email matches ADMIN_EMAILS from .env

🗂 Project Structure
/backend
   /controllers
   /routes
   /models
   /middleware
   index.js

/frontend
   /src
      /components
      /pages
      /context
      App.js

⚙️ Installation & Running the Project
📌 Prerequisites

Node.js (v16+)

MongoDB Atlas account

npm or yarn

1️⃣ Clone the Repository
git clone https://github.com/your-username/CourseMaster.git
cd CourseMaster

2️⃣ Backend Setup
cd backend
npm install

Run the backend
npm start
# or
npm run dev

3️⃣ Frontend Setup
cd ../frontend
npm install
npm run dev

🔑 Environment Variables (.env)

Create a .env file inside the backend folder:

PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000

ADMIN_EMAILS=ruhana.atiq@gmail.com

Variable	Description
PORT	Port for backend server
MONGODB_URI	MongoDB Atlas connection string
JWT_SECRET	Secret used to sign JWT tokens
JWT_EXPIRES_IN	Token validity duration
CLIENT_URL	Frontend URL for CORS & cookies
ADMIN_EMAILS	Comma-separated list of admin emails
📚 API Documentation

All backend routes are prefixed with:

/api

🔐 Authentication Routes (/api/auth)
POST /api/auth/register

Registers a new user.

Body Example:

{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "123456"
}

POST /api/auth/login

Logs in a user and returns a JWT token via cookies.

Body Example:

{
  "email": "john@gmail.com",
  "password": "123456"
}

🎓 Course Routes (/api/courses)
GET /api/courses

Fetch all available courses.

POST /api/courses (Admin Only)

Create a new course.

Body Example:

{
  "title": "JavaScript Basics",
  "description": "Learn JS from scratch",
  "instructor": "Jane Smith"
}

PUT /api/courses/:id (Admin Only)

Update an existing course.

DELETE /api/courses/:id (Admin Only)

Delete a course.

📝 Enrollment Routes (/api/enrollments)
POST /api/enrollments

Enroll a student in a course.

Body Example:

{
  "courseId": "65abcf12345",
  "userId": "89acdf67890"
}

GET /api/enrollments/my-courses

Fetch all courses the logged-in student is enrolled in.

🛠 Admin Routes (/api/admin)
GET /api/admin/stats

Returns dashboard analytics.

Example Response:

{
  "totalUsers": 120,
  "totalCourses": 10,
  "totalEnrollments": 80,
  "assignmentSubmissions": 45
}

🧪 Technologies Used
Frontend

React.js

React Router

Tailwind CSS

Backend

Node.js

Express.js

Database

MongoDB Atlas

Authentication

JWT + HTTP-only cookies

Deployment

Vercel (Frontend & Backend)

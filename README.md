# Behmand Co. Server

The official **backend service** for **Behmand Co.**, built with **Node.js (Express)** and **MongoDB**.  
This server powers the company’s website and admin dashboard, providing secure authentication, content management, file handling, and reliable API endpoints.

---

## ✨ Key Features
- Clean, modular, and maintainable architecture
- Secure **JWT authentication** for admin access
- Protected routes for sensitive operations
- Full **CRUD APIs** for blogs, resumes, and contact messages
- File upload support (images, resumes, attachments)
- Health check endpoint (`/api/health`) for monitoring
- **CORS** support for multiple domains

---

## 📂 Project Structure
behmand-co-server/ │── src/ │ ├── routes/ # API route definitions │ ├── controllers/ # Request handlers & business logic │ ├── models/ # Mongoose schemas & models │ ├── middlewares/ # Authentication, error handling, etc. │ └── utils/ # Helper utilities │── uploads/ # Uploaded files │── server.js # Application entry point │── package.json # Dependencies & scripts │── .env.example # Example environment variables

Code

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/mehdiarz/behmand-co-server.git
cd behmand-co-server
2. Install dependencies
bash
npm install
3. Configure environment variables
Create a .env file in the root directory (see .env.example for reference):


PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CORS_ORIGIN=https://your-frontend-domain.com
4. Run the server
bash
npm run dev   # Development mode (with nodemon)
npm start     # Production mode
The server runs at http://localhost:5000 by default.

📡 API Endpoints
Method	Endpoint	Description
GET	/api/health	Server health check
POST	/api/auth/login	Admin login
GET	/api/blogs	Fetch all blogs
POST	/api/blogs	Create a new blog (admin only)
GET	/api/messages	Retrieve contact messages (admin only)
...	...	Additional routes for resumes, uploads, etc.
🛡️ Security
JWT-based authentication for admin routes

CORS restrictions to allow only trusted domains

Input validation at the API level

📦 Available Scripts
bash
npm start       # Run in production
npm run dev     # Run in development mode
🚀 Roadmap
Add unit tests with Jest

Implement advanced logging with Winston

Integrate monitoring & alerting tools

👨‍💻 Author
Developed and maintained by Mehdi Arz.
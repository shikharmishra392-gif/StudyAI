# StudyAI — AI-Powered Video Learning Assistant

StudyAI is a web-based learning application that helps students turn YouTube lecture videos into structured study material. It extracts available video captions, processes the transcript, and uses an AI API to generate summaries, notes, and quiz questions.

The goal is to make video-based learning more organized and revision more convenient.

##  Features

- **User Authentication:** Register and log in to your account.
- **YouTube URL Processing:** Submit a video URL for analysis.
- **Transcript Extraction:** Retrieve available captions using yt-dlp and process the transcript text.
- **AI-Generated Summaries:** Get concise summaries of lecture content.
- **Structured Study Notes:** Convert transcript content into organized notes.
- **Quiz Generation:** Generate quiz questions to support revision.
- **Study History:** Save video records and revisit previously processed content.
- **Database Persistence:** Store user information, video records, transcripts, and generated study material in MySQL.
- **Responsive Frontend:** A React-based interface for interacting with the application.

##  Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML5 and CSS3

### Backend
- Java
- Spring Boot
- Spring Web / REST APIs
- Spring Data JPA
- Hibernate
- Maven

### Database
- MySQL
- MySQL Connector/J

### Other Tools and Services
- yt-dlp — caption extraction
- OpenRouter / configured AI API — AI content generation
- Postman — REST API testing
- IntelliJ IDEA / VS Code — development

##  System Architecture

```text
User
  |
  v
React + Vite Frontend
  |
  | HTTP / REST API
  v
Spring Boot Backend
  |
  +---- Authentication Module
  |
  +---- Video Management Module
  |
  +---- Transcript Extraction (yt-dlp)
  |
  +---- AI Content Generation (AI API)
  |
  +---- Spring Data JPA / Hibernate
                 |
                 v
              MySQL
```

##  How It Works

1. The user registers or logs in.
2. The user submits a YouTube video URL.
3. The backend creates and manages the video record.
4. The caption extraction process retrieves available subtitles.
5. The transcript is cleaned and prepared for AI processing.
6. The AI service generates a summary, study notes, and quiz content.
7. The generated content is saved in the MySQL database.
8. The user can view the results and revisit saved videos through the study history.

**Note:** Caption extraction depends on subtitle availability and access to the video. AI generation also depends on API availability and configured usage limits.

## 🧩 Project Modules

### 1. Frontend Module
Provides the login screen, dashboard, video URL form, result tabs, and sidebar history.

### 2. Authentication Module
Handles user registration, login, credential validation, and password hashing with BCrypt.

### 3. Video Management Module
Creates video records and manages video details, processing status, and saved content.

### 4. Transcript Extraction Module
Uses yt-dlp to retrieve available captions and prepares the transcript for further processing.

### 5. AI Content Generation Module
Sends transcript content to the configured AI service to generate summaries, notes, and quizzes.

### 6. Database Persistence Module
Uses Spring Data JPA and Hibernate to store and retrieve user and video information from MySQL.

## 🗄️ Database Design

StudyAI uses MySQL with two main entities:

### Users
- `id` — Primary key
- `name` — User name
- `email` — Unique email address
- `password` — BCrypt-hashed password

### Videos
- `id` — Primary key
- `video_url` — Submitted video URL
- `status` — Processing status
- `created_at` — Creation timestamp
- `user_id` — Foreign key referencing the user
- `transcript` — Extracted transcript
- `summary` — Generated summary
- `notes` — Generated study notes
- `quiz` — Generated quiz content

**Relationship:** One user can have multiple video records (one-to-many).

##  Getting Started

### Prerequisites

Install the following before running the project:

- JDK version compatible with your Spring Boot configuration
- Node.js and npm
- MySQL Server
- Maven, or use the Maven Wrapper if included
- yt-dlp
- An API key for your configured AI provider

### 1. Clone the Repository

```bash
git clone https://github.com/shikharmishra392-gif/studyai.git
cd studyai
```

If your repository has a different name or directory structure, adjust the URL and paths accordingly.

### 2. Configure MySQL

Create the database in MySQL:

```sql
CREATE DATABASE studyai;
```

Configure the datasource in your Spring Boot `application.properties` file:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/studyai
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
```

Use the correct MySQL port for your local installation. Configure the corresponding environment variables before starting the backend.

### 3. Configure AI Credentials

Set the API key required by your configured AI service using an environment variable. The exact variable name must match the one used in your backend code.

**Never commit API keys, database passwords, or other secrets to GitHub.**

### 4. Run the Backend

Open a terminal in the Spring Boot backend directory and run:

```bash
mvn spring-boot:run
```

The backend typically runs at:

```text
http://localhost:8080
```

### 5. Run the Frontend

Open another terminal in the React frontend directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal, commonly:

```text
http://localhost:5173
```

Ensure that the frontend API base URL matches the backend address and that CORS is configured correctly.

## 🔌 Main REST API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/videos/analyze` | Create a video record |
| GET | `/api/videos/user/{email}` | Retrieve a user's video history |
| GET | `/api/videos/{id}` | Retrieve a video record |
| PUT | `/api/videos/{id}/content` | Update generated content |
| POST | `/api/videos/{id}/generate` | Generate content from a transcript |

The available endpoints depend on the current backend implementation.

##  Security

- Passwords are hashed using BCrypt before being stored.
- Email uniqueness is enforced at the database level.
- Database access is handled through backend repositories.
- API credentials should be supplied through environment variables.
- Input validation and authorization should be enforced on the backend.

**Security note:** BCrypt password hashing is implemented, but it is distinct from full Spring Security authorization. Do not assume that every endpoint is protected against unauthorized access unless those checks are implemented.

##  Learning Outcomes

Through StudyAI, I have worked with:

- Core Java and object-oriented programming
- REST API development with Spring Boot
- Database integration using MySQL
- Spring Data JPA and Hibernate
- React frontend development with Vite
- API integration and transcript processing
- Debugging and integration across application layers

##  Future Enhancements

- Audio transcription for videos without available captions
- Stronger authentication and backend authorization
- Improved transcript handling for long videos
- Enhanced quiz evaluation and scoring
- Better error handling and API usage management
- Deployment of the frontend and backend to cloud platforms

##  Developer

**Shikhar Mishra**  
B.Tech — Computer Science and Engineering

- GitHub: [shikharmishra392-gif](https://github.com/shikharmishra392-gif)
- LinkedIn: [Shikhar Mishra](https://www.linkedin.com/in/shikhar-mishra-82b744327/)



---

*StudyAI — Turning video lectures into structured learning material.*

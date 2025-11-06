# Activity 2: Notes Application with Authentication

A full-stack notes application built with React (Vite) and NestJS, featuring user authentication, private notes management with CRUD operations, soft delete functionality, and organized note categorization.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Key Features](#key-features)
- [Development](#development)

## 🎯 Overview

This is a modern notes management application that allows users to:
- Create, read, update, and delete personal notes
- Organize notes with categories and folders
- Search and filter notes by multiple criteria
- Soft delete notes with trash/restore functionality
- Manage user account and password
- Secure authentication with JWT tokens

The application consists of two main components:
- **Frontend**: React application built with Vite, TypeScript, and custom CSS
- **Backend**: RESTful API built with NestJS, TypeORM, and SQLite

## Tech Stack

### Frontend
- **React 19.1.1** - UI library
- **Vite 7.1.7** - Build tool and dev server
- **TypeScript 5.8.3** - Type safety
- **Axios 1.12.2** - HTTP client
- **Custom CSS** - Responsive styling with animations

### Backend
- **NestJS 11.0.1** - Progressive Node.js framework
- **TypeORM 0.3.27** - Object-Relational Mapping
- **SQLite 5.1.7** - Database
- **JWT 11.0.0** - Authentication
- **bcrypt 6.0.0** - Password hashing
- **Passport JWT 4.0.1** - Authentication middleware
- **Swagger 11.2.0** - API documentation
- **Class Validator 0.14.2** - Input validation

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected routes and API endpoints
- Password hashing with bcrypt
- Password change functionality

### Notes Management
- Create notes with title, content, category, and folder
- Edit and update notes
- Soft delete with trash functionality
- Restore notes from trash
- Permanent delete from trash
- User-specific notes isolation

### Organization & Search
- Categorize notes for better organization
- Organize notes into folders
- Search notes by title, content, category, or folder
- Filter by category or folder
- View active notes or trash separately

### User Profile
- User account management
- Change password
- Account information display
- Profile settings in modal

### UI/UX Features
- Responsive design for mobile and desktop
- Animated transitions and hover effects
- Card-based note layout
- Modal dialogs for account and confirmations
- Toast notifications
- Accessible form elements with ARIA labels
- Touch-friendly interface for mobile devices

## Project Structure

```
Activity2/
├── backend/
│   └── notes-api/
│       ├── src/
│       │   ├── auth/              # Authentication module
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   └── auth.module.ts
│       │   ├── users/             # User management
│       │   │   ├── users.controller.ts
│       │   │   ├── users.service.ts
│       │   │   └── users.module.ts
│       │   ├── notes/             # Notes CRUD operations
│       │   │   ├── notes.controller.ts
│       │   │   ├── notes.service.ts
│       │   │   └── notes.module.ts
│       │   ├── entities/          # TypeORM entities
│       │   │   ├── user.entity.ts
│       │   │   └── note.entity.ts
│       │   ├── dto/               # Data Transfer Objects
│       │   │   ├── auth-login.dto.ts
│       │   │   ├── auth-register.dto.ts
│       │   │   ├── create-note.dto.ts
│       │   │   ├── update-note.dto.ts
│       │   │   └── change-password.dto.ts
│       │   ├── jwt.strategy.ts    # JWT authentication strategy
│       │   ├── app.module.ts      # Main application module
│       │   └── main.ts            # Application entry point
│       ├── notes.sqlite           # SQLite database
│       └── package.json
│
└── frontend/
    └── notes-ui/
        ├── src/
        │   ├── Auth.tsx           # Authentication page
        │   ├── Dashboard.tsx      # Main notes dashboard
        │   ├── Account.tsx        # User account management
        │   ├── api.ts             # API client functions
        │   ├── main.tsx           # Application entry point
        │   ├── notes.css          # Styles with responsive design
        │   └── auth.css           # Authentication page styles
        └── package.json
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **Git** (for cloning the repository)

## Installation

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <repository-url>
   cd Activity2
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend/notes-api
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../../frontend/notes-ui
   npm install
   ```

## Running the Application

### Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend/notes-api
   ```

2. Start the development server:
   ```bash
   npm run start:dev
   ```

   The backend server will start on **http://localhost:3002**

3. Access the API documentation:
   - Swagger UI: **http://localhost:3002/api**

### Start the Frontend Application

1. Navigate to the frontend directory:
   ```bash
   cd frontend/notes-ui
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend application will start on **http://localhost:5173**

3. Open your browser and navigate to **http://localhost:5173**

### Build for Production

**Frontend:**
```bash
cd frontend/notes-ui
npm run build
npm run preview  # Preview the production build
```

**Backend:**
```bash
cd backend/notes-api
npm run build
npm run start:prod
```

## 📚 API Documentation

The API documentation is available via Swagger UI when the backend server is running:

**http://localhost:3002/api**

### Main API Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
  - Body: `{ email: string, password: string }`
  - Returns: `{ accessToken: string }`
- `POST /auth/login` - Login and get JWT token
  - Body: `{ email: string, password: string }`
  - Returns: `{ accessToken: string }`

#### Notes
- `GET /notes` - Get all user's notes (requires authentication)
  - Query: `?trashed=1` (optional, to get trashed notes)
  - Returns: `Note[]`
- `GET /notes/:id` - Get a specific note (requires authentication)
  - Returns: `Note`
- `POST /notes` - Create a new note (requires authentication)
  - Body: `{ title: string, content?: string, category?: string, folder?: string }`
  - Returns: `Note`
- `PATCH /notes/:id` - Update a note (requires authentication)
  - Body: `{ title?: string, content?: string, category?: string, folder?: string }`
  - Returns: `Note`
- `DELETE /notes/:id` - Soft delete a note (requires authentication)
  - Returns: `void`
- `POST /notes/:id/restore` - Restore a note from trash (requires authentication)
  - Returns: `Note`
- `DELETE /notes/:id/permanent` - Permanently delete a note (requires authentication)
  - Returns: `void`

#### Users
- `GET /users/me` - Get current user information (requires authentication)
  - Returns: `User`
- `PATCH /users/change-password` - Change user password (requires authentication)
  - Body: `{ oldPassword: string, newPassword: string }`
  - Returns: `void`

### Authentication

All note endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄 Database Schema

The application uses SQLite with TypeORM. Key entities include:

### User
- `id` - Primary key (auto-generated)
- `email` - Unique email address (string, required)
- `passwordHash` - Hashed password (string, required)
- `createdAt` - Account creation timestamp (auto-generated)

### Note
- `id` - Primary key (auto-generated)
- `title` - Note title (string, required, max 255 characters)
- `content` - Note content (text, optional)
- `category` - Category label (string, optional)
- `folder` - Folder name (string, optional)
- `user` - Reference to User (many-to-one relationship)
- `deletedAt` - Soft delete timestamp (nullable)
- `createdAt` - Note creation timestamp (auto-generated)
- `updatedAt` - Last update timestamp (auto-updated)

### Relationships
- **User → Notes**: One-to-Many (one user can have many notes)
- **Note → User**: Many-to-One (each note belongs to one user)

## ✨ Key Features

### 1. Authentication System
- Secure user registration with email validation
- Login with JWT token generation
- Token-based authentication for all protected routes
- Password hashing with bcrypt (salt rounds: 10)
- Token stored in localStorage

### 2. Notes Management
- **Create**: Add new notes with optional category and folder
- **Read**: View all notes in a card-based layout
- **Update**: Edit note title, content, category, and folder
- **Delete**: Soft delete moves notes to trash
- Full CRUD operations with user authorization

### 3. Soft Delete & Trash
- Notes are soft-deleted (not permanently removed)
- View trashed notes separately
- Restore notes from trash
- Permanently delete notes from trash
- Toggle between active and trash views

### 4. Organization Features
- **Categories**: Organize notes by category
- **Folders**: Group notes into folders
- **Search**: Search across title, content, category, and folder
- **Filter**: Filter by specific category or folder
- Multiple filter options can be combined

### 5. User Account Management
- View account information (email, join date)
- Change password with old password verification
- Account modal with smooth animations
- Logout confirmation dialog

### 6. Responsive Design
- Mobile-first responsive layout
- Single-column layout on mobile devices
- Optimized touch targets (44px minimum)
- Disabled hover effects on touch devices
- Smooth scrolling and transitions
- Landscape orientation support

### 7. UI/UX Enhancements
- Card-based note layout with animations
- Modal dialogs with backdrop blur
- Gradient accents and modern styling
- Loading states and error handling
- Form validation feedback
- Accessible ARIA labels
- Keyboard navigation support

## 💻 Development

### Frontend Development

The frontend uses:
- **Vite** for fast HMR (Hot Module Replacement)
- **TypeScript** for type safety
- **React Hooks** for state management
- **Custom CSS** with CSS variables and animations
- **Axios** for API communication

### Backend Development

The backend uses:
- **NestJS** modular architecture
- **TypeORM** for database operations
- **SQLite** for development database
- **Swagger** for API documentation
- **JWT & Passport** for authentication
- **Class Validator** for DTO validation

### Environment Configuration

**Backend:**
- Port: `3002`
- Database: SQLite (`notes.sqlite`)
- JWT Secret: Configured in auth module
- CORS: Enabled for frontend origin

**Frontend:**
- Port: `5173` (default Vite port)
- API Base URL: `http://localhost:3002`
- Token storage: `localStorage` (key: `notes_token`)

### Code Structure

**Frontend:**
- **Components**: Functional components with hooks
- **State Management**: React useState and useEffect
- **API Client**: Centralized API functions in `api.ts`
- **Styling**: Modular CSS with responsive breakpoints

**Backend:**
- **Modules**: Auth, Users, Notes (separate modules)
- **Entities**: TypeORM entities for User and Note
- **DTOs**: Validation with class-validator
- **Guards**: JWT guard for protected routes
- **Services**: Business logic separation

### CSS Features

The application includes:
- CSS custom properties for theming
- Responsive breakpoints (720px, 520px, 420px)
- Smooth animations and transitions
- Card hover effects (disabled on touch)
- Modal animations with backdrop blur
- Grid layout for notes
- Flexbox for responsive components

## 📝 Notes

- The SQLite database (`notes.sqlite`) is created automatically on first run
- JWT tokens are stored in browser localStorage
- Soft-deleted notes have a `deletedAt` timestamp
- The application uses CORS for cross-origin requests
- All API endpoints include validation via class-validator
- Notes are user-specific and isolated by authentication

## 🔧 Troubleshooting

### Backend Issues
- **Port in use**: Ensure port 3002 is not being used
- **Database errors**: Delete `notes.sqlite` to reset the database
- **Dependencies**: Run `npm install` in backend directory
- **TypeORM sync**: Ensure `synchronize: true` in development

### Frontend Issues
- **Port in use**: Ensure port 5173 is available
- **API connection**: Verify backend is running on port 3002
- **Authentication**: Clear localStorage if auth issues occur
  ```javascript
  localStorage.removeItem('notes_token')
  ```
- **Dependencies**: Run `npm install` in frontend directory

### Common Issues
- **CORS errors**: Ensure backend CORS is enabled
- **Token expiration**: Re-login if token expires
- **Form validation**: Check console for validation errors
- **Search not working**: Ensure notes have been created

## 🚀 Future Enhancements

Potential features for future versions:
- Rich text editor for note content
- File attachments support
- Note sharing between users
- Tags system in addition to categories
- Note templates
- Export notes (PDF, Markdown)
- Dark mode theme
- Keyboard shortcuts
- Note pinning/starring
- Note archive feature
- Bulk operations

---

**Activity 2** - Notes Application with Authentication | Built with ❤️ using NestJS and React

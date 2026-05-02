# Messenger App

![React](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![WebSockets](https://img.shields.io/badge/Realtime-WebSockets-orange)
![License](https://img.shields.io/badge/License-Custom-red)

---

A full-stack real-time messaging platform with AI integration and Google authentication.

Live Demo: https://messengerapp-o1e8.onrender.com  
Repository: https://github.com/Ce3Pi0/MessengerApp

---

## Table of contents
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installing](#installing)
- [Environment Variables](#environment-variables)
- [System Architecture](#system-architecture)
- [API Architecture](#api-architecture)
- [Real-Time WebSocket Events](#real-time-websocket-events)
- [Database Design](#database-design)
- [AI System Integration](#ai-system-integration)
- [Deployment Architecture](#deployment-architecture)
- [Testing Strategy](#testing-strategy)
- [Coding Style](#coding-style)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Built With](#built-with)
- [License](#license)
- [Acknowledgments](#acknowledgments)

<a id="getting-started"></a>
## Getting Started

This project is a full-stack application built with **React (Vite)**, **Express (TypeScript)**, and **MongoDB**, featuring real-time messaging and AI integration.

---

<a id="prerequisites"></a>
## Prerequisites

- Node.js (v18+)
- npm
- MongoDB account and instance
- Cloudinary account
- Google Cloud Console Project & Google OAuth credentials

---

<a id="installing"></a>
## Installing

Clone the repository:

```bash
git clone https://github.com/Ce3Pi0/MessengerApp.git
cd MessengerApp
```

Install dependencies:

```bash
cd frontend && npm install
cd ../backend && npm install
```

<a id="environment-variables"></a>
## Environment Variables

Create .env files in both frontend and backend:

- Frontend:

  ```bash
  VITE_API_URL
  VITE_SYSTEM_USER_ID
  ```

- Backend:
  ```bash
  API_URL
  API_VERSION
  CALLBACK_URL
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET
  CLOUDINARY_CLOUD_NAME
  FRONTEND_URL
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GOOGLE_GENERATIVE_AI_API_KEY
  GOOGLE_URL
  JWT_ACCESS_EXPIRES_IN
  JWT_ACCESS_SECRET
  JWT_FORGOT_PASSWORD_SECRET
  JWT_MFA_SECRET
  JWT_REFRESH_EXPIRES_IN
  JWT_REFRESH_SECRET
  JWT_VERIFY_SECRET
  MONGO_URI
  NODE_ENV
  PORT
  SALT
  SENDER_EMAIL
  SYSTEM_USER_ID
  BREVO_API_KEY
  ```

<a id="running-the-project"></a>
## Running the Project

- Backend:

  ```bash
  cd backend
  npm run dev
  ```

- Frontend:
  ```bash
  cd frontend
  npm run dev
  ```

#### Development URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

<a id="system-architecture"></a>
## System Architecture

### High Level Architecture

<img width="558" height="493" alt="MessengerAppSystemArchitecture" src="https://github.com/user-attachments/assets/472dd420-1019-4d08-b47f-9a7e91a6efe0" />

### Architecture Principles

1. #### Client-Server Separation
   - React handles UI and rendering
   - Express handles API and backend logic
1. #### Event-Driven Realtime System
   - WebSockets Manage:
     - Real-Time Messaging
     - Typing Indication
     - Read-Receipts
     - Online Presence
     - System Updates
1. #### Stateless Authentication
   - JWT-Based Authentication
   - Access + Refresh Token System
   - OAuth Integration via Google
1. #### Cloud-Backed Media Layer
   - Cloudinary Handles:
     - Profile Images
     - Chat Avatars
     - Group Chat Backgrounds
     - Chat Media
1. #### Email API
     - Email Delivery Through Brevo

<a id="api-architecture"></a>
## API Architecture

### Base URL

```
<hostname>/api/v<version number>
```

- ### Authentication

  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | POST | /api/v1/auth/register | Register a new user |
  | POST | /api/v1/auth/login | Login user |
  | POST | /api/v1/auth/logout | Logout user |
  | GET | /api/v1/auth/status | Check authentication status |
  | GET | /api/v1/auth/google | Google OAuth login |
  | PUT | /api/v1/auth/refresh | Refresh authentication tokens |
  | PUT | /api/v1/auth/change-password | Change user password |
  | POST | /api/v1/auth/set-password | Set password for account |
  | GET | /api/v1/auth/link-account | Link external account |
  | GET | /api/v1/auth/verify/:token | Verify user account |
  | POST | /api/v1/auth/resend-verification | Resend verification email |
  | POST | /api/v1/auth/send-forgot-password | Send forgot password email |
  | GET | /api/v1/auth/forgot-password/:token | Validate forgot password token |
  | POST | /api/v1/auth/update-forgotten-password/:token | Update forgotten password |
  | GET | /api/v1/auth/enable2fa | Enable two-factor authentication |
  | POST | /api/v1/auth/verify2fa | Verify 2FA code |
  | PUT | /api/v1/auth/disable2fa | Disable two-factor authentication |

- ### Server Info

  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | GET | /api/v1/server/status | Get server status |

- ### User Management

  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | GET | /api/v1/users/all | Get all users |
  | GET | /api/v1/users/:id | Get single user |
  | PUT | /api/v1/users/update | Update user |
  | PUT | /api/v1/users/add-favorite | Add favorite chat |
  | PUT | /api/v1/users/remove-favorite | Remove favorite chat |
  | PUT | /api/v1/users/block-user | Block a user |
  | DELETE | /api/v1/users/delete | Delete current user |
  | PUT | /api/v1/users/unblock-user | Unblock a user |
  | GET | /api/v1/users/ai | Get AI user |

- ### Chat System

  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | POST | /api/v1/chat/create | Create chat or group |
  | GET | /api/v1/chat/all | Get all chats |
  | GET | /api/v1/chat/:id | Get single chat |
  | PUT | /api/v1/chat/update/:id | Update chat |
  | PUT | /api/v1/chat/add-admin/:id | Promote user to admin |
  | DELETE | /api/v1/chat/delete/:id | Delete chat |
  | POST | /api/v1/chat/add-user | Add user to chat |
  | DELETE | /api/v1/chat/remove-user | Remove user from chat |

- ### Messages

  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | POST | /api/v1/message/send | Send message |
  | PUT | /api/v1/message/edit | Edit message |
  | DELETE | /api/v1/message/delete | Delete message |
  | PUT | /api/v1/message/read | Mark message as read |

- ### Reactions
  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | POST | /api/v1/reaction/send | Send reaction |
  | DELETE | /api/v1/reaction/delete | Remove reaction |

<a id="real-time-websocket-events"></a>
## Real-Time WebSocket Events

- ### Connection Flow
  ```
  Client -> Socket Server -> Auth Validation -> Join Room
  ```
- ### Events
  | Event           | Description                  |
  |-----------------|------------------------------|
  | online:users    | Broadcast online users       |
  | user:<id>       | Personal room                |
  | chat:join       | Join a chat room             |
  | chat:<id>       | Chat room                    |
  | typing          | User is typing               |
  | stopped-typing  | User stopped typing          |
  | chat:leave      | User left chat room          |
  | disconnect      | Socket disconnected          |
  | disconnect      | Socket disconnected          |
  | chat:new        | Emit new chat                |
  | message:new     | Emit new message             |
  | message:update  | Emit updated message         |
  | message:delete  | Emit deleted message         |
  | reaction:update | Emit message reaction update |
  | reaction:delete | Emit message reaction delete |
  | chat:update     | Emit last chat update        |
  | chat:change     | Emit chat changes            |
  | chat:delete     | Emit chat deletion           |
  | user:remove     | Emit user removal            |
  | user:add        | Emit user added              |
  | message:seen    | Emit read receipts           |
  | messages:seen   | Emit multiple read receipts  |
  | user:blocked    | Emit user blocked            |
  | user:unblocked  | Emit user unblocked          |
  | chat:ai         | Emit chat AI                 |

- ### Data Flow Example
  ![SendingMessageDataFlow](https://github.com/user-attachments/assets/05f5525a-d25c-4fbf-8925-634c18d8e8b0)

 
<a id="database-design"></a>
## Database Design



- ### User Model
  | Field         | Type           | Required | Description |
  |--------------|---------------|----------|-------------|
  | name         | string        | Yes      | User name |
  | email        | string        | Conditional | Unique email |
  | password     | string        | Conditional | Hashed password |
  | googleId     | string        | No       | Google OAuth ID |
  | refreshToken | string        | No       | Refresh token |
  | provider     | string        | Yes      | Auth provider |
  | isVerified   | boolean       | Yes      | Verification status |
  | forgotPassword | boolean     | Yes      | Forgot password state |
  | isAI         | boolean       | Yes      | AI user flag |
  | avatar       | string \| null| No       | Profile image |
  | enabled2fa   | boolean       | Yes      | 2FA enabled |
  | secret2fa    | string        | No       | 2FA secret |
  | favorites    | ObjectId[]    | Yes      | References Chat collection |
  | blocked      | ObjectId[]    | Yes      | References User collection |
  | createdAt    | Date          | Yes      | Timestamp |
  | updatedAt    | Date          | Yes      | Timestamp |
- ### Chat Model
  | Field           | Type           | Required | Description |
  |----------------|---------------|----------|-------------|
  | participants   | ObjectId[]     | Yes      | References User collection |
  | administrators | ObjectId[]     | Yes      | References User collection |
  | avatar         | string \| null | No       | Chat avatar |
  | background     | string \| null | No       | Chat background |
  | lastMessage    | ObjectId       | No       | References Message collection |
  | lastReaction   | ObjectId       | No       | References Reaction collection |
  | isGroup        | boolean        | Yes      | Indicates group chat |
  | groupName      | string         | No       | Name of group |
  | isAiChat       | boolean        | Yes      | Indicates AI chat |
  | createdBy      | ObjectId       | Yes      | References User collection |
  | createdAt      | Date           | Yes      | Timestamp |
  | updatedAt      | Date           | Yes      | Timestamp |
- ### Message Model
  | Field     | Type        | Required | Description |
  |----------|------------|----------|-------------|
  | chatId   | ObjectId    | Yes      | References Chat collection |
  | sender   | ObjectId    | Yes      | References User collection |
  | content  | string      | No       | Message text |
  | image    | string      | No       | Image URL |
  | replyTo  | ObjectId    | No       | References Message collection |
  | reactions| ObjectId[]  | No       | References Reaction collection |
  | readBy   | ObjectId[]  | Yes      | References User collection |
  | createdAt| Date        | Yes      | Timestamp |
  | updatedAt| Date        | Yes      | Timestamp |
- ### Reaction Model
  | Field     | Type     | Required | Description |
  |----------|---------|----------|-------------|
  | chatId   | ObjectId | Yes      | References Chat collection |
  | reactor  | ObjectId | Yes      | References User collection |
  | emoji    | string   | No       | Reaction emoji |
  | createdAt| Date     | Yes      | Timestamp |
  | updatedAt| Date     | Yes      | Timestamp |
---
- ### Relationships
  - Chat.participants -> User (1 -> N)
  - Chat.administrators -> User (1 -> N/0)
  - Chat.createdBy -> User (1 -> 1)
  - Chat.lastMessage -> Message (1 -> 1/0)
  - Chat.lastReaction -> Reaction (1 -> 1/0)
  
  - Message.chatId -> Chat (1 -> 1)
  - Message.sender -> User (1 -> 1)
  - Message.replyTo -> Message (1 -> 1/0)
  - Message.reactions -> Reaction (1 -> N/0)
  - Message.readBy -> User (1 -> N/0)
  
  - Reaction.chatId -> Chat (1 -> 1)
  - Reaction.reactor -> User (1 -> 1)
  
  - User.favorites -> Chat (1 -> N/0)
  - User.blocked -> User (1 -> N/0)


<a id="ai-system-integration"></a>
## AI System Integration

- ### Flow
  ```
  User Message -> Backend API -> Gemini API -> AI Response -> Chat Stream
  ```
- ### Usage
  Context-based AI responses/replies

<a id="deployment-architecture"></a>
## Deployment Architecture

```
Frontend (Vite) -> Render Static Hosting
Backend (Express) -> Render Web Service
Database -> MongoDB Atlas
Media -> Cloudinary
AI -> Google Gemini API
```

<a id="testing-strategy"></a>
## Testing Strategy

This project does not include automated unit tests.

### Manual Testing (Postman)

- Import Postman collection from:
  ```bash
  /postman/MessengerApp.postman_collection.json
  ```
- Test the following endpoint groups:
  - Authentication
  - Server Info
  - Users
  - Chats
  - Messages
  - Reactions

<a id="coding-style"></a>
## Coding Style

- ESLint
- Prettier

<a id="deployment"></a>
## Deployment

Deployed on Render.

Build command:

```bash
cd frontend && npm install --include=dev && npm run build && cd ../backend && npm install --include=dev && npm run build
```

<a id="screenshots"></a>
## Screenshots:

- ### Login Page

<img width="1257" height="715" alt="image" src="https://github.com/user-attachments/assets/12ed720d-367e-461e-96ba-f917d1946393" />

- ### Register Page

<img width="1257" height="710" alt="image" src="https://github.com/user-attachments/assets/4a6b6d0d-f0c4-422b-ab0c-a5a42c136575" />

- ### Home Page

<img width="1264" height="724" alt="image" src="https://github.com/user-attachments/assets/f32375c2-b704-4f02-bc78-2b7fb814bbbf" />

- ### Chat Page

<img width="1265" height="722" alt="image" src="https://github.com/user-attachments/assets/82567179-c9e0-4f68-8f44-bd442a768e20" />

- ### Update Profile Page

<img width="1252" height="717" alt="image" src="https://github.com/user-attachments/assets/06529b1c-ba75-448b-84bd-0dba7eae3e0c" />

<a id="built-with"></a>
## Built With

- React (Vite)
- Express.js (TypeScript)
- MongoDB
- WebSockets
- Cloudinary
- Gemini AI

<a id="license"></a>
## License

This project is based on:
https://github.com/TechWithEmmaYT/MERN-RealTime-Messagers-Platform

License terms:

- Allowed for learning and portfolio use
- Not allowed for commercial use or redistribution without permission

<a id="acknowledgments"></a>
## Acknowledgments

- TechWithEmmaYT (base project inspiration)
- Google OAuth 2.0
- Cloudinary
- MongoDB
- Render
- Icons8: <a target="_blank" href="https://icons8.com/icon/60984/google">Google icon</a> by <a target="_blank" href="https://icons8.com">Icons8</a>

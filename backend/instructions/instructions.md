# Collaborative Whiteboard Backend Documentation

## Project Overview

The backend for the Collaborative Whiteboard will serve as the real-time collaboration hub, managing WebSocket communication, whiteboard state synchronization, and session handling. By leveraging Prisma as the database ORM, the backend will provide a robust, type-safe, and scalable solution for storing and retrieving data efficiently.

## Core Functionalities

### 1. Real-Time Collaboration via WebSocket

#### WebSocket Communication

-   Establish WebSocket connections for handling real-time updates from connected clients
-   Broadcast whiteboard actions (e.g., drawing, erasing, undo/redo) to all other participants in the same session

#### Event Handling

-   `draw`: Broadcast drawing data (coordinates, color, thickness) to other clients
-   `erase`: Notify clients about erasing actions to update their canvas
-   `undo/redo`: Reverse or reapply the last user action across all clients
-   `clear`: Clear the entire whiteboard for all connected users

#### Concurrency Management

-   Use timestamps or sequence numbers to ensure updates are applied in the correct order
-   Implement throttling for frequent actions like continuous drawing to optimize bandwidth

### 2. Whiteboard State Persistence

#### State Snapshots

-   Periodically save the current whiteboard state to the database using Prisma
-   The snapshot includes canvas elements (lines, shapes, text) and user action history for undo/redo functionality

#### Session State Retrieval

-   Provide an API endpoint to fetch the latest state of the whiteboard when a user reconnects or joins mid-session

#### Version Control

-   Maintain historical changes for whiteboard state to support undo/redo across sessions

### 3. Session and User Management

#### Session Management

-   Support creating and managing collaborative sessions
-   Allow users to join existing sessions and synchronize their state with other participants
-   Provide role-based access control for session hosts and participants

#### User Authentication

-   Authenticate users via tokens using a secure session mechanism
-   Maintain user details, such as role (host/participant), for access control

#### Reconnection Handling

-   Re-sync disconnected users by fetching the current state of the whiteboard and re-establishing WebSocket connections

### 4. Security and Data Integrity

#### Secure WebSocket Communication

-   Encrypt all WebSocket traffic using SSL/TLS

#### Access Control

-   Verify user authorization before allowing access to session resources or WebSocket connections

#### Input Validation

-   Validate incoming WebSocket events and REST API requests to prevent malicious or malformed data from affecting the system

## Technology Stack

-   **Node.js**: Backend runtime for handling WebSocket communication and REST APIs
-   **TypeScript**: Ensures type safety and maintainable code
-   **Prisma ORM**: For database schema management and querying
-   **sqlite3**: A relational database for storing whiteboard states, sessions, and user data
-   **Redis**: For caching real-time data, like active WebSocket connections and session states
-   **WebSocket Library**: (e.g., ws) for managing real-time communication
-   **SSL/TLS**: For encrypting WebSocket and REST API traffic

## API Endpoints

### Session Management

#### POST /session

-   Create a new collaborative session
-   Input: Host user ID, optional session name
-   Output: Session ID, connection details

#### GET /session/:id

-   Retrieve session details, including the current whiteboard state
-   Input: Session ID
-   Output: JSON containing session metadata and whiteboard state

### Whiteboard State Management

#### POST /whiteboard/save

-   Save the current whiteboard state
-   Input: JSON containing whiteboard data
-   Output: Success message

#### GET /whiteboard/:id

-   Fetch the latest whiteboard state for a session
-   Input: Session ID
-   Output: JSON containing the whiteboard state

### User Management

#### POST /login

-   Authenticate a user and issue a token
-   Input: Email, password
-   Output: Authentication token

#### GET /user

-   Retrieve the authenticated user's details
-   Input: Token
-   Output: User profile JSON

#### POST /logout

-   Log out the authenticated user
-   Input: Token
-   Output: Success message

#### POST /register

-   Register a new user
-   Input: Email, password, role
-   Output: User ID

### Class Management

#### POST /class

-   Create a new class
-   Input: Class name, description, teacher ID
-   Output: Class ID

#### GET /class/:id

-   Retrieve class details, including enrolled students
-   Input: Class ID
-   Output: JSON containing class metadata and enrolled students

#### DELETE /class/:id

-   Delete a class
-   Input: Class ID
-   Output: Success message

### Class Enrollment Management

#### POST /class/:id/enroll

-   Enroll a student in a class
-   Input: Class ID, student ID
-   Output: Success message

#### GET /class/:id/students

-   Retrieve a list of students enrolled in a class
-   Input: Class ID
-   Output: JSON array of student IDs

## WebSocket Events

-   `draw`: Broadcast drawing data (coordinates, color, thickness)
-   `erase`: Notify clients about erasing actions
-   `undo/redo`: Reverse or reapply the last action
-   `clear`: Clear the whiteboard for all users

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  role      String    // "host" or "participant"
  sessions  Session[]
}

model Session {
  id            String      @id @default(cuid())
  name          String
  hostId        String
  host          User        @relation(fields: [hostId], references: [id])
  whiteboard    Whiteboard? @relation(fields: [whiteboardId], references: [id])
  whiteboardId  String?
  participants  User[]
}

model Whiteboard {
  id        String    @id @default(cuid())
  state     Json      // Stores the serialized whiteboard state
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## Project Structure

```
src/
├── controllers/
│   ├── sessionController.ts    # Handles session creation and management
│   ├── whiteboardController.ts # Manages whiteboard state persistence
│   └── userController.ts       # Handles user authentication and profile
├── models/
│   └── prismaClient.ts         # Prisma client instance
├── routes/
│   ├── sessionRoutes.ts        # Routes for session-related APIs
│   ├── whiteboardRoutes.ts     # Routes for whiteboard-related APIs
│   └── userRoutes.ts           # Routes for user-related APIs
├── services/
│   ├── websocketService.ts     # Handles WebSocket communication
│   ├── statePersistence.ts     # Logic for whiteboard state handling
│   └── authService.ts          # User authentication logic
├── utils/
│   ├── validateInput.ts        # Middleware for API input validation
│   ├── websocketUtils.ts       # Utilities for WebSocket handling
│   └── authMiddleware.ts       # Middleware for securing routes
├── prisma/
│   ├── schema.prisma           # Prisma schema file
│   └── migrations/             # Database migrations
├── config/
│   ├── redisConfig.ts          # Redis connection configuration
│   └── websocketConfig.ts      # WebSocket server configuration
├── app.ts                      # Express app configuration
├── server.ts                   # HTTP and WebSocket server entry point
└── index.ts                    # Main entry point
```

# Frontend System Documentation

## Project Overview

The frontend for the system is a dynamic, responsive web application designed to interact with the backend APIs provided. The system will cater to two primary user roles: teachers and students, enabling features like class creation, student management, collaborative whiteboard sessions, and real-time state updates. The frontend will use technologies like Vite, React, TypeScript, Redux, WebSocket, and TailwindCSS, react-router-dom, react-icons, shadcn/ui, react-toastify, tldraw to deliver a seamless user experience.

The application will focus on user-friendly workflows for creating, managing, and interacting within collaborative educational sessions, leveraging the backend services for functionality.

## Core Functionalities

### 1. User Authentication

#### UI Design

-   A central login/signup page for authentication
-   Separate interfaces for teachers and students after login

#### Features

-   Role-based access (teacher/student)
-   Display personalized information on the dashboard

#### API Endpoints

-   `POST /users/register`: To register a user
-   `POST /users/login`: For user authentication
-   `GET /users/profile`: To fetch the logged-in user's details

#### Interaction

-   Display validation errors for incorrect credentials
-   Use Redux to store and manage the authenticated user state

### 2. Class Management (Teacher Role)

#### UI Design

-   A dashboard showing all created classes
-   Buttons for adding, editing, or deleting classes
-   A table displaying enrolled students and active sessions for each class

#### Features

-   Create, view, delete, and manage classes
-   Enroll students using a form
-   View enrolled students and class details

#### API Endpoints

-   `POST /class`: Create a new class
-   `GET /class/:id`: Fetch details of a specific class
-   `DELETE /class/:id`: Delete a class
-   `POST /class/:id/enroll`: Enroll a student
-   `GET /class/:id/students`: Get enrolled students

#### Interaction

-   On successful class creation, update the class list dynamically
-   Provide modal confirmations for deletion
-   Display toast notifications for errors or successful actions

### 3. Session Management

#### Teacher

##### UI Design

-   A detailed view of sessions under each class
-   Options to create, view, or end sessions

##### Features

-   Manage sessions (create, view details, and end sessions)

##### API Endpoints

-   `POST /sessions/session`: Create a new session
-   `GET /sessions/session/:id`: Fetch session details
-   `PATCH /sessions/session/:id`: End a session

##### Interaction

-   Show active sessions in a card layout with metadata (title, description, start time)
-   Allow teachers to end sessions, updating the status dynamically

#### Student

##### UI Design

-   A simplified session list for joining active sessions

##### Features

-   View and join active sessions

##### Interaction

-   Highlight the current active session
-   Notify students when a session ends

### 4.Whiteboard UI with tldraw

#### UI Design

-   Use tldraw as the primary whiteboard library for drawing, erasing, undoing, and clearing actions.
-   A toolbar at the top or side with buttons for:
    -   Selection Tool: To move or resize objects.
    -   Drawing Tools: Pen, rectangle, circle, line, etc.
    -   Eraser Tool: To remove paths or shapes.
    -   Undo/Redo Buttons.
    -   Clear Button: To reset the canvas.
    -   Color Picker: To change the stroke color.
-   The whiteboard canvas should occupy the main viewport.

#### Interaction

-   Capture user actions (draw, erase, undo, etc.) and update the whiteboard canvas using tldraw's APIs.
-   Maintain smooth rendering and responsiveness during interactions.

#### Integration

-   Broadcast whiteboard actions via WebSocket.
-   Handle incoming WebSocket messages to update the canvas in real time.

#### Features

-   Fetch and save whiteboard state
-   Real-time updates for state synchronization
-   Thumbnail generation for session snapshots

#### API Endpoints

-   `GET /whiteboards/whiteboard/:id`: Fetch the current state of a session
-   `POST /whiteboards/whiteboard/:id/save`: Save the whiteboard state

#### WebSocket Events

-   `stateUpdate`: Receive real-time updates for whiteboard changes

#### Interaction

-   Show changes from other users in real time
-   Allow teachers to annotate the whiteboard

### 5. Real-Time WebSocket Integration

#### WebSocket Integration

-   Establish a persistent WebSocket connection on session join.
-   Handle WebSocket events:
    -   draw: Update the whiteboard with a new path.
    -   erase: Remove specific paths from the canvas.
    -   undo/redo: Reflect these actions across all clients.
    -   clear: Reset the canvas state for all participants.
    -   stateUpdate: Sync the full canvas state when a new client joins.

#### Conflict Management

-   Use sequence numbers provided by the backend to apply actions in the correct order.
-   Show a "Reconnecting..." message if the WebSocket connection drops and automatically retry.

### 6. Notifications

#### UI Design

-   Toast notifications for real-time events (e.g., session ended, state saved) using react-toastify

#### Features

-   Show success/error notifications for all API calls
-   Notify users of system updates (e.g., reconnection attempts)

#### 7. State Persistence and Recovery

-   Save State:
    -   Periodically or on demand, send the current whiteboard state to the backend using the POST /whiteboard/:sessionId/save API.
-   Retrieve State:
    -   On session join or reconnection, fetch the latest state using the GET /whiteboard/:sessionId API and apply it to the canvas.
-   Thumbnail Display:
    -   Generate and display a small thumbnail of the current whiteboard state for session previews.

## Technology Stack

-   **React**: Core framework for building the UI
-   **TypeScript**: For type-safe development
-   **Redux**: For global state management (authentication, sessions, etc.)
-   **TailwindCSS**: For responsive and consistent styling
-   **WebSocket**: For real-time synchronization
-   **Axios**: For API integration
-   **tldraw**: For the whiteboard UI
-   **react-toastify**: For toast notifications
-   **react-router-dom**: For routing
-   **react-icons**: For icons
-   **shadcn/ui**: For UI components

## Implementation Details

### API Integration

-   Use Axios to manage RESTful API calls
-   Configure interceptors to handle authentication tokens

### WebSocket Handling

-   Implement a service to manage WebSocket connections
-   Reconnect automatically on disconnections

## Project Structure

```
src/
├── components/
│   ├── Auth/                  # Login, Signup forms
│   ├── Dashboard/             # Class and session management components
│   ├── Whiteboard/            # Collaborative whiteboard components
│   ├── Notifications/         # Toast notifications
│   └── Shared/                # Reusable components (buttons, modals)
├── hooks/
│   ├── useAuth.ts             # Manage authentication state
│   ├── useWebSocket.ts        # Manage WebSocket connections
│   └── useNotification.ts     # Toast notifications
├── pages/
│   ├── Login.tsx              # Login page
│   ├── Signup.tsx             # Signup page
│   ├── Dashboard.tsx          # Teacher dashboard
│   ├── Whiteboard.tsx         # Whiteboard view
│   └── Session.tsx            # Session details
├── store/
│   ├── authSlice.ts           # Authentication state
│   ├── classSlice.ts          # Class management state
│   ├── sessionSlice.ts        # Session management state
│   └── whiteboardSlice.ts     # Whiteboard state
├── types/
│   ├── ApiTypes.ts            # TypeScript types for API responses
│   ├── WebSocketTypes.ts      # Types for WebSocket messages
├── utils/
│   ├── api.ts                 # Axios instance and API helpers
│   ├── websocket.ts           # WebSocket utilities
│   └── validators.ts          # Input validation utilities
├── App.tsx                    # Main app component
├── main.tsx                   # Vite entry point
└── index.css                  # TailwindCSS styles
```

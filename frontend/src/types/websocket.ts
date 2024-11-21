export type Point = {
    x: number;
    y: number;
};

export type Path = {
    id: string;
    points: Point[];
    color: string;
    width: number;
    userId: string;
};

export type WhiteboardAction = {
    type: "draw" | "erase" | "clear" | "undo";
    sessionId: string;
    userId: string;
    sequence?: number;
    payload?: any;
};

export type StateUpdateMessage = {
    type: "stateUpdate";
    sessionId: string;
    payload: {
        currentState: WhiteboardState;
    };
};

export type SyncRequestMessage = {
    type: "sync";
    sessionId: string;
    userId: string;
};

export type SessionUsersMessage = {
    type: "SESSION_USERS_UPDATE";
    sessionId: string;
    users: string[];
};

export type WhiteboardState = {
    paths: Path[];
    thumbnail?: string;
};

export type WebSocketMessage =
    | WhiteboardAction
    | StateUpdateMessage
    | SyncRequestMessage
    | SessionUsersMessage;

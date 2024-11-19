export type WebSocketMessageType =
    | "draw"
    | "erase"
    | "undo"
    | "clear"
    | "stateUpdate"
    | "sync";

export interface BaseWebSocketMessage {
    type: WebSocketMessageType;
    sessionId: string;
    userId: string;
    timestamp?: number;
}

export interface DrawAction extends BaseWebSocketMessage {
    type: "draw";
    payload: {
        path: any;
        color: string;
        width: number;
    };
    sequence?: number;
}

export interface EraseAction extends BaseWebSocketMessage {
    type: "erase";
    payload: {
        path: any;
        width: number;
    };
    sequence?: number;
}

export interface ClearAction extends BaseWebSocketMessage {
    type: "clear";
    sequence?: number;
}

export interface UndoAction extends BaseWebSocketMessage {
    type: "undo";
    sequence?: number;
}

export interface StateUpdateMessage extends BaseWebSocketMessage {
    type: "stateUpdate";
    payload: {
        currentState: string;
        thumbnail?: string;
    };
}

export interface SyncRequestMessage extends BaseWebSocketMessage {
    type: "sync";
}

export type WhiteboardAction =
    | DrawAction
    | EraseAction
    | ClearAction
    | UndoAction;
export type WebSocketMessage =
    | WhiteboardAction
    | StateUpdateMessage
    | SyncRequestMessage;

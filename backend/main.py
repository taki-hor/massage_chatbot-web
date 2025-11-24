from __future__ import annotations

import uuid
from datetime import datetime
from typing import Dict, List, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

SessionStatusLiteral = Literal["created", "running", "paused", "stopped", "error"]


class TTSConfig(BaseModel):
    voice: str = "default"
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    volume: float = Field(default=1.0, ge=0.0, le=1.0)
    overlap_protection: bool = True


class SessionCreate(BaseModel):
    patient_id: str
    goal: str
    tts: Optional[TTSConfig] = None


class Session(BaseModel):
    id: str
    started_at: str
    status: SessionStatusLiteral = "created"


class RobotStatus(BaseModel):
    connected: bool = True
    mode: Optional[Literal["idle", "freedrive", "force_control", "running"]] = "idle"
    load_kg: Optional[float] = 2.4
    warnings: List[str] = []


class SessionStatus(BaseModel):
    session: Session
    robot: RobotStatus


class ChatTurn(BaseModel):
    role: Literal["user", "assistant", "system"] = "assistant"
    text: str
    ts: str


class SessionLog(BaseModel):
    id: str
    ts: str
    level: Literal["info", "warning", "error"] = "info"
    message: str


app = FastAPI(title="Massage Chatbot Web API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# In-memory stores (stateless demo)
SESSIONS: Dict[str, Session] = {}
SESSION_META: Dict[str, SessionCreate] = {}
SESSION_LOGS: Dict[str, List[SessionLog]] = {}
SESSION_CHAT: Dict[str, List[ChatTurn]] = {}

ROBOT_STATUS = RobotStatus()


def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def require_session(session_id: str) -> Session:
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
    return SESSIONS[session_id]


def add_log(session_id: str, level: Literal["info", "warning", "error"], message: str) -> None:
    log = SessionLog(id=f"{session_id}-{len(SESSION_LOGS.get(session_id, []))+1}", ts=now_iso(), level=level, message=message)
    SESSION_LOGS.setdefault(session_id, []).append(log)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/sessions", response_model=Session)
def create_session(payload: SessionCreate):
    session_id = str(uuid.uuid4())
    session = Session(id=session_id, started_at=now_iso(), status="created")
    SESSIONS[session_id] = session
    SESSION_META[session_id] = payload
    SESSION_CHAT[session_id] = [
        ChatTurn(role="system", text="Welcome to the massage assistant.", ts=now_iso()),
    ]
    add_log(session_id, "info", f"Session created for patient {payload.patient_id} ({payload.goal})")
    return session


@app.post("/api/sessions/{session_id}/start", response_model=Session)
def start_session(session_id: str):
    session = require_session(session_id)
    session.status = "running"
    session.started_at = now_iso()
    SESSIONS[session_id] = session
    add_log(session_id, "info", "Session started")
    update_robot_for_session(session.status)
    return session


@app.post("/api/sessions/{session_id}/stop", response_model=Session)
def stop_session(session_id: str):
    session = require_session(session_id)
    session.status = "stopped"
    SESSIONS[session_id] = session
    add_log(session_id, "info", "Session stopped")
    update_robot_for_session(session.status)
    return session


@app.get("/api/sessions/{session_id}/status", response_model=SessionStatus)
def get_session_status(session_id: str):
    session = require_session(session_id)
    return SessionStatus(session=session, robot=ROBOT_STATUS)


@app.post("/api/sessions/{session_id}/chat", response_model=List[ChatTurn])
def send_chat(session_id: str, payload: Dict[str, str]):
    session = require_session(session_id)
    text = payload.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    history = SESSION_CHAT.get(session_id, [])
    user_turn = ChatTurn(role="user", text=text, ts=now_iso())
    history.append(user_turn)

    assistant_reply = ChatTurn(
        role="assistant",
        text="已收到，正在調整按摩流程。",
        ts=now_iso(),
    )
    history.append(assistant_reply)
    SESSION_CHAT[session_id] = history

    add_log(session_id, "info", f"User: {text}")
    add_log(session_id, "info", "Assistant: 已收到，正在調整按摩流程。")
    return history


@app.get("/api/sessions/{session_id}/logs", response_model=List[SessionLog])
def get_logs(session_id: str):
    require_session(session_id)
    return SESSION_LOGS.get(session_id, [])


@app.get("/api/robot/status", response_model=RobotStatus)
def robot_status():
    return ROBOT_STATUS


def update_robot_for_session(status: SessionStatusLiteral) -> None:
    global ROBOT_STATUS
    ROBOT_STATUS = RobotStatus(
        connected=True,
        mode="running" if status == "running" else ("freedrive" if status == "paused" else "idle"),
        load_kg=ROBOT_STATUS.load_kg,
        warnings=[] if status in {"running", "created"} else ROBOT_STATUS.warnings,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

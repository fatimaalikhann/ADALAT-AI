import logging
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel, Field

from api.db import get_pool

router = APIRouter()
logger = logging.getLogger("adalat.feedback")

_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS feedback (
    id         BIGSERIAL PRIMARY KEY,
    p_name     TEXT,
    pro_name   TEXT,
    p_msg      TEXT,
    pro_msg    TEXT,
    ts         BIGINT      NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


class FeedbackIn(BaseModel):
    pName:  str = Field(default="Anonymous", max_length=100)
    proName: str = Field(default="", max_length=100)
    pMsg:   str = Field(default="", max_length=500)
    proMsg: str = Field(default="", max_length=500)
    ts:     int = 0


class FeedbackOut(BaseModel):
    id:        int
    pName:     str
    proName:   str
    pMsg:      str
    proMsg:    str
    ts:        int
    timestamp: str


@router.post("/feedback", response_model=FeedbackOut, status_code=201)
async def submit_feedback(body: FeedbackIn) -> FeedbackOut:
    pool = await get_pool()
    ts = body.ts or int(datetime.now(timezone.utc).timestamp() * 1000)
    async with pool.acquire() as conn:
        await conn.execute(_CREATE_TABLE)
        row = await conn.fetchrow(
            """
            INSERT INTO feedback (p_name, pro_name, p_msg, pro_msg, ts)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, p_name, pro_name, p_msg, pro_msg, ts, created_at
            """,
            body.pName or "Anonymous",
            body.proName or "",
            body.pMsg or "",
            body.proMsg or "",
            ts,
        )
    timestamp = row["created_at"].astimezone(timezone.utc).strftime(
        "%-d %b %Y, %-I:%M %p PKT"
    )
    return FeedbackOut(
        id=row["id"],
        pName=row["p_name"],
        proName=row["pro_name"],
        pMsg=row["p_msg"],
        proMsg=row["pro_msg"],
        ts=row["ts"],
        timestamp=timestamp,
    )


@router.get("/feedback", response_model=list[FeedbackOut])
async def get_feedback() -> list[FeedbackOut]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(_CREATE_TABLE)
        rows = await conn.fetch(
            "SELECT id, p_name, pro_name, p_msg, pro_msg, ts, created_at "
            "FROM feedback ORDER BY ts DESC LIMIT 200"
        )
    result = []
    for row in rows:
        timestamp = row["created_at"].astimezone(timezone.utc).strftime(
            "%-d %b %Y, %-I:%M %p PKT"
        )
        result.append(FeedbackOut(
            id=row["id"],
            pName=row["p_name"],
            proName=row["pro_name"],
            pMsg=row["p_msg"],
            proMsg=row["pro_msg"],
            ts=row["ts"],
            timestamp=timestamp,
        ))
    return result

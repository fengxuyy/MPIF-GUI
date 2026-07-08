from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BASE_DIR / "mpif_publish.sqlite3"
DB_PATH = Path(os.environ.get("MPIF_DB_PATH", DEFAULT_DB_PATH))


class AuthorPayload(BaseModel):
  orcid: str
  name: str = ""
  email: str = ""


class PublishedFileCreate(BaseModel):
  fileName: str = Field(..., min_length=1)
  format: Literal["mpif", "json"]
  content: str = Field(..., min_length=1)
  mpifData: dict[str, Any]
  author: AuthorPayload


class PublishedFileRecord(PublishedFileCreate):
  id: str
  savedAt: str


app = FastAPI(title="MPIF Published Files API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://localhost:5173",
    "https://127.0.0.1:5173",
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


def get_connection() -> sqlite3.Connection:
  DB_PATH.parent.mkdir(parents=True, exist_ok=True)
  conn = sqlite3.connect(DB_PATH)
  conn.row_factory = sqlite3.Row
  return conn


def init_db() -> None:
  with get_connection() as conn:
    conn.execute(
      """
      CREATE TABLE IF NOT EXISTS published_files (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        format TEXT NOT NULL CHECK (format IN ('mpif', 'json')),
        content TEXT NOT NULL,
        mpif_data_json TEXT NOT NULL,
        author_orcid TEXT NOT NULL,
        author_name TEXT,
        author_email TEXT,
        saved_at TEXT NOT NULL
      )
      """
    )
    conn.execute(
      "CREATE INDEX IF NOT EXISTS idx_published_files_saved_at ON published_files(saved_at DESC)"
    )
    conn.execute(
      "CREATE INDEX IF NOT EXISTS idx_published_files_author_orcid ON published_files(author_orcid)"
    )


def row_to_record(row: sqlite3.Row) -> PublishedFileRecord:
  return PublishedFileRecord(
    id=row["id"],
    fileName=row["file_name"],
    format=row["format"],
    content=row["content"],
    mpifData=json.loads(row["mpif_data_json"]),
    author=AuthorPayload(
      orcid=row["author_orcid"],
      name=row["author_name"] or "",
      email=row["author_email"] or "",
    ),
    savedAt=row["saved_at"],
  )


@app.on_event("startup")
def on_startup() -> None:
  init_db()


@app.get("/health")
def health() -> dict[str, str]:
  return {"status": "ok", "database": str(DB_PATH)}


@app.post("/api/published-files", response_model=PublishedFileRecord, status_code=201)
def create_published_file(payload: PublishedFileCreate) -> PublishedFileRecord:
  init_db()

  record_id = str(uuid4())
  saved_at = datetime.now(timezone.utc).isoformat()
  mpif_data_json = json.dumps(payload.mpifData, separators=(",", ":"), ensure_ascii=False)

  with get_connection() as conn:
    conn.execute(
      """
      INSERT INTO published_files (
        id,
        file_name,
        format,
        content,
        mpif_data_json,
        author_orcid,
        author_name,
        author_email,
        saved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      (
        record_id,
        payload.fileName,
        payload.format,
        payload.content,
        mpif_data_json,
        payload.author.orcid,
        payload.author.name,
        payload.author.email,
        saved_at,
      ),
    )

  return PublishedFileRecord(
    id=record_id,
    fileName=payload.fileName,
    format=payload.format,
    content=payload.content,
    mpifData=payload.mpifData,
    author=payload.author,
    savedAt=saved_at,
  )


@app.get("/api/published-files", response_model=list[PublishedFileRecord])
def list_published_files() -> list[PublishedFileRecord]:
  init_db()

  with get_connection() as conn:
    rows = conn.execute(
      "SELECT * FROM published_files ORDER BY saved_at DESC"
    ).fetchall()

  return [row_to_record(row) for row in rows]


@app.get("/api/published-files/{record_id}", response_model=PublishedFileRecord)
def get_published_file(record_id: str) -> PublishedFileRecord:
  init_db()

  with get_connection() as conn:
    row = conn.execute(
      "SELECT * FROM published_files WHERE id = ?",
      (record_id,),
    ).fetchone()

  if row is None:
    raise HTTPException(status_code=404, detail="Published file not found")

  return row_to_record(row)


@app.delete("/api/published-files/{record_id}")
def delete_published_file(
  record_id: str,
  x_orcid_id: str | None = Header(default=None, alias="X-ORCID-ID"),
) -> dict[str, str]:
  init_db()

  if not x_orcid_id:
    raise HTTPException(status_code=401, detail="ORCID iD is required to delete a published file")

  with get_connection() as conn:
    row = conn.execute(
      "SELECT author_orcid FROM published_files WHERE id = ?",
      (record_id,),
    ).fetchone()

    if row is None:
      raise HTTPException(status_code=404, detail="Published file not found")

    if row["author_orcid"] != x_orcid_id:
      raise HTTPException(status_code=403, detail="Only the file owner can delete this published file")

    conn.execute(
      "DELETE FROM published_files WHERE id = ?",
      (record_id,),
    )

  return {"status": "deleted", "id": record_id}

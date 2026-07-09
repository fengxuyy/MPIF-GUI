# FastAPI backend for MPIF published files.
# Build from the repository root so the backend/ directory is in context:
#   docker build -f backend/Dockerfile -t mpif-api .

FROM python:3.12-slim

# curl for the container healthcheck, sqlite3 for ad-hoc inspection/backups
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl sqlite3 && \
    rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --uid 1001 appuser

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

# SQLite lives on a mounted volume, never in the image layer, so data
# survives redeploys. WAL mode also writes -wal/-shm files next to the
# database, which is why the whole directory is the volume.
ENV MPIF_DB_PATH=/var/lib/mpif/mpif_publish.sqlite3
RUN mkdir -p /var/lib/mpif && chown appuser /var/lib/mpif
VOLUME /var/lib/mpif

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "backend.database_api:app", "--host", "0.0.0.0", "--port", "8000"]

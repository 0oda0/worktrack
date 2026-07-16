from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import SessionLocal
from app.seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="WorkTrack", lifespan=lifespan)


@app.get("/api/health")
def health():
    return {"status": "ok"}

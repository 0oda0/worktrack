from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import SessionLocal
from app.routers import admin, attendance, auth, holidays
from app.seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="WorkTrack", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(attendance.router)
app.include_router(holidays.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}

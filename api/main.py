from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.db import close_pool
from api.routes import cases, documents

app = FastAPI(
    title="AdalatAI",
    description="Multi-agent legal aid system for Pakistani citizens.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router,     prefix="/api")
app.include_router(documents.router, prefix="/api")


@app.on_event("shutdown")
async def _shutdown() -> None:
    await close_pool()


@app.get("/api/health", tags=["meta"])
async def health() -> dict:
    return {"status": "ok"}

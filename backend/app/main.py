from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from app.config import settings
from app.routers import auth, wishlists, items, contributions
from app.websocket.manager import sio

app = FastAPI(title="Social Wishlist API", version="1.0.0")

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(wishlists.router)
app.include_router(items.router)
app.include_router(contributions.router)

# Socket.IO
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)


@app.get("/api/health")
async def health():
    return {"status": "ok"}

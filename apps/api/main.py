from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import SessionLocal
from app.deps.auth import get_current_operator
from app.routers import auth, clients, health, platform_settings

settings = get_settings()
require_auth = [Depends(get_current_operator)]


def _bootstrap() -> None:
    from app.database import Base, engine
    from app.models import operator, client, platform_setting, audit_log  # register models

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        from app.models.operator import Operator
        from app.deps.auth import hash_password
        import uuid

        if db.query(Operator).count() == 0:
            db.add(Operator(
                id="op_super_admin",
                email="admin@againerp.com",
                username="superadmin",
                hashed_password=hash_password("Admin@1234"),
                full_name="Super Admin",
                role="super_admin",
                is_active=True,
            ))
            db.commit()
            print("[Center] Default super_admin created: admin@againerp.com / Admin@1234")
    except Exception as e:
        print(f"[Center] Bootstrap error: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    import threading
    threading.Thread(target=_bootstrap, daemon=True).start()
    yield


app = FastAPI(
    title="AgainERP Control Center API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(clients.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(platform_settings.router, prefix="/api/v1", dependencies=require_auth)


@app.get("/")
def root() -> dict:
    return {
        "app": "AgainERP Control Center",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/v1/auth/login",
            "clients": "/api/v1/clients/",
            "settings": "/api/v1/platform-settings/",
        },
    }

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.client import Client
from app.models.operator import Operator

router = APIRouter(prefix="/clients", tags=["clients"])


class ClientCreate(BaseModel):
    name: str
    slug: str
    domain: Optional[str] = None
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str
    db_user: str
    db_password: str
    api_url: Optional[str] = None
    api_key: Optional[str] = None
    plan: str = "starter"
    notes: Optional[str] = None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    api_url: Optional[str] = None
    api_key: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


def _client_out(c: Client) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "slug": c.slug,
        "domain": c.domain,
        "db_host": c.db_host,
        "db_port": c.db_port,
        "db_name": c.db_name,
        "db_user": c.db_user,
        "api_url": c.api_url,
        "plan": c.plan,
        "status": c.status,
        "is_active": c.is_active,
        "notes": c.notes,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


@router.get("/")
def list_clients(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    clients = db.query(Client).order_by(Client.created_at.desc()).all()
    return [_client_out(c) for c in clients]


@router.post("/", status_code=201)
def create_client(
    body: ClientCreate,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    if db.query(Client).filter(Client.slug == body.slug).first():
        raise HTTPException(status_code=409, detail=f"Slug '{body.slug}' already exists")

    client = Client(
        id=f"client_{uuid.uuid4().hex[:12]}",
        **body.model_dump(),
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return _client_out(client)


@router.get("/{client_id}")
def get_client(
    client_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    c = db.query(Client).filter(Client.id == client_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")
    return _client_out(c)


@router.patch("/{client_id}")
def update_client(
    client_id: str,
    body: ClientUpdate,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    c = db.query(Client).filter(Client.id == client_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(c, field, val)
    db.commit()
    db.refresh(c)
    return _client_out(c)


@router.delete("/{client_id}")
def delete_client(
    client_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    c = db.query(Client).filter(Client.id == client_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(c)
    db.commit()
    return {"deleted": True}


@router.post("/{client_id}/test-connection")
def test_connection(
    client_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    c = db.query(Client).filter(Client.id == client_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")

    dsn = f"postgresql://{c.db_user}:{c.db_password}@{c.db_host}:{c.db_port}/{c.db_name}"
    try:
        eng = create_engine(dsn, connect_args={"connect_timeout": 5})
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        eng.dispose()
        return {"ok": True, "message": "Connection successful"}
    except Exception as e:
        return {"ok": False, "message": str(e)}


@router.get("/{client_id}/stats")
def client_stats(
    client_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    c = db.query(Client).filter(Client.id == client_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")

    dsn = f"postgresql://{c.db_user}:{c.db_password}@{c.db_host}:{c.db_port}/{c.db_name}"
    try:
        eng = create_engine(dsn, connect_args={"connect_timeout": 5})
        with eng.connect() as conn:
            stats = {}
            for table, label in [
                ("catalog_products", "products"),
                ("commerce_orders", "orders"),
                ("commerce_customers", "customers"),
                ("catalog_categories", "categories"),
            ]:
                try:
                    row = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                    stats[label] = row
                except Exception:
                    stats[label] = None
        eng.dispose()
        return {"ok": True, "client_id": client_id, "stats": stats}
    except Exception as e:
        return {"ok": False, "message": str(e), "stats": {}}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.operator import Operator
from app.services.notification_service import generate_platform_notifications

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    return generate_platform_notifications(db)

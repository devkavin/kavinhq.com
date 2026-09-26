from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models import AdminUser, Setting
from app.schemas.setting import SettingsRead, SettingsUpdate

router = APIRouter()
ALLOWED_KEYS = ("whatsapp_number", "whatsapp_message")


def read_settings(db: Session) -> dict[str, str]:
    rows = db.scalars(select(Setting).where(Setting.key.in_(ALLOWED_KEYS))).all()
    values = {row.key: row.value for row in rows}
    return {key: values.get(key, "") for key in ALLOWED_KEYS}


@router.get("/settings", response_model=SettingsRead)
def get_settings(db: Session = Depends(get_db)):
    return read_settings(db)


@router.put("/settings", response_model=SettingsRead)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(require_admin)):
    for key, value in payload.model_dump().items():
        row = db.get(Setting, key)
        if row:
            row.value = value
        else:
            db.add(Setting(key=key, value=value))
    db.commit()
    return read_settings(db)

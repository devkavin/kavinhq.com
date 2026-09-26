from pydantic import BaseModel, Field


class SettingsRead(BaseModel):
    whatsapp_number: str
    whatsapp_message: str


class SettingsUpdate(BaseModel):
    whatsapp_number: str = Field(pattern=r"^\d{7,16}$")
    whatsapp_message: str = Field(min_length=5, max_length=1000)

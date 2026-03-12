# app/schemas/image.py
from pydantic import BaseModel
from datetime import datetime

class ImageCreate(BaseModel):
    item_id: int
    url: str
    is_main: bool = False

class ImageRead(BaseModel):
    id: int
    item_id: int
    url: str
    is_main: bool
    created_at: datetime

    class Config:
        from_attributes = True

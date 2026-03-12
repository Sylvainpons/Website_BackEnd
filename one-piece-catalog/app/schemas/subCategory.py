from pydantic import BaseModel
from datetime import datetime

# ---------
# CREATE
# ---------
class SubCategoryCreate(BaseModel):
    name: str
    slug: str
    category_id: int

# ---------
# UPDATE
# ---------
class SubCategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    category_id: int | None = None

# ---------
# READ
# ---------
class SubCategoryRead(BaseModel):
    id: int
    name: str
    slug: str
    category_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        
from pydantic import BaseModel
from datetime import datetime

# ---------
# CREATE
# ---------
class CategoryCreate(BaseModel):
    name: str
    slug: str

# ---------
# UPDATE
# ---------
class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None

# ---------
# READ
# ---------
class CategoryRead(BaseModel):
    id: int
    name: str
    slug: str
    created_at: datetime
    #  Optional: Include subcategories if needed
    class Config:
        from_attributes = True

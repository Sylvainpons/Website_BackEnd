from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"))
    url = Column(String(512), nullable=False)
    is_main = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

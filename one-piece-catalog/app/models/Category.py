from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(256), nullable=False, unique=True)
    slug = Column(String(256), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now())

    subcategories = relationship("SubCategory", back_populates="category")
    items = relationship("Item", back_populates="category")

    def __repr__(self):
        return f"<Category id={self.id} name={self.name}>"

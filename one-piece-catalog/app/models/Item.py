from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True)
    title = Column(String(256), nullable=False)
    description = Column(String(1024))
    year = Column(Integer)
    external_link = Column(String(512))

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"), nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="items")
    subcategory = relationship("SubCategory", back_populates="items")

    def __repr__(self):
        return f"<Item id={self.id} title={self.title}>"

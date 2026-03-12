from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base

class SubCategory(Base):
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True)
    name = Column(String(256), nullable=False)
    slug = Column(String(256), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    category = relationship("Category", back_populates="subcategories")
    items = relationship("Item", back_populates="subcategory")

    __table_args__ = (
        UniqueConstraint("category_id", "slug", name="uq_subcategory_category_slug"),
    )

    def __repr__(self):
        return f"<SubCategory id={self.id} name={self.name}>"

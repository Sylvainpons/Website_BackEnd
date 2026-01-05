from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(256), nullable=False, unique=True)
    email = Column(String(256), nullable=False, unique=True)
    password_hashed = Column(String(512), nullable=False)
    role = Column(String(50), nullable=False, default="user")
    created_at = Column(DateTime, server_default=func.now())


    def __repr__(self):
        return f"<User id={self.id} username={self.username} email={self.email} role={self.role} created_at={self.created_at}>"
from app.db.database import engine
from app.db.base import Base

# IMPORT OBLIGATOIRE DES MODELS
from app.models.Category import Category
from app.models.SubCategory import SubCategory
from app.models.Item import Item


def init_db():
    Base.metadata.create_all(bind=engine)

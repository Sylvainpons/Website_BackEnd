from fastapi import FastAPI, HTTPException, Depends
from app.routes.category import router as category_router
from app.routes.subCategory import router as subcategory_router
from app.routes.item import router as item_router
from app.db.session import get_db
from app.db.database import engine
#from app.db.init_db import init_db
import sqlalchemy

app = FastAPI()
#init_db()

app.include_router(category_router)
app.include_router(subcategory_router)
app.include_router(item_router)

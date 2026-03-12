from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# ===================================
# IMPORTS PROPRES (Tous commencent par app.)
# ===================================
from app.db.database import engine
from app.models.Item import Base
from app.routes.category import router as category_router
from app.routes.subCategory import router as subcategory_router
from app.routes.item import router as item_router
from app.routes.image import router as image_router

Base.metadata.create_all(bind=engine)

# Créer l'application FastAPI
app = FastAPI(
    title="One Piece Catalog API",
    description="API pour gérer le catalogue One Piece",
    version="1.0.0"
)

# ===================================
# CONFIGURATION CORS
# ===================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================================
# DOSSIER IMAGES
# ===================================
IMG_DIR = Path("img")
IMG_DIR.mkdir(exist_ok=True)
app.mount("/img", StaticFiles(directory="img"), name="images")

# ===================================
# ROUTES
# ===================================
app.include_router(category_router)
app.include_router(subcategory_router)
app.include_router(item_router)
app.include_router(image_router)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API One Piece Catalog",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.on_event("startup")
async def startup_event():
    print("API démarrée avec succès!")
    print("Dossier images:", IMG_DIR.absolute())
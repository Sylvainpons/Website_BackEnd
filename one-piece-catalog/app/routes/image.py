from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pathlib import Path
import uuid
import os
from app.db.session import get_db
from app.models.Image import Image
from app.models.Item import Item
from app.schemas.image import ImageCreate, ImageRead

router = APIRouter(
    prefix="/images",
    tags=["images"]
)

# Dossier local pour stocker les images (à la racine du projet)
IMG_DIR = Path("img")
IMG_DIR.mkdir(exist_ok=True)

# ----------------
# CREATE (URL classique)
# ----------------
@router.post(
    "",
    response_model=ImageRead,
    status_code=status.HTTP_201_CREATED
)
def create_image(
    data: ImageCreate,
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == data.item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item does not exist"
        )
    
    image = Image(
        item_id=data.item_id,
        url=data.url,
        is_main=data.is_main
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

# ----------------
# UPLOAD IMAGE (LOCAL)
# ----------------
@router.post(
    "/upload/{item_id}",
    response_model=ImageRead,
    status_code=status.HTTP_201_CREATED
)
async def upload_image(
    item_id: int,
    file: UploadFile = File(...),
    is_main: bool = False,
    db: Session = Depends(get_db)
):
    # Vérifier que l'item existe
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item does not exist"
        )
    
    # Validation du type de fichier
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier doit être une image"
        )
    
    # Générer un nom de fichier unique
    file_extension = ""
    if file.filename and "." in file.filename:
        file_extension = file.filename.split(".")[-1]
    else:
        # Déterminer l'extension depuis le content_type
        content_type_map = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp"
        }
        file_extension = content_type_map.get(file.content_type, "jpg")
    
    filename = f"{uuid.uuid4()}.{file_extension}"
    
    # S'assurer que le dossier existe
    os.makedirs(IMG_DIR, exist_ok=True)
    
    # Chemin complet du fichier
    file_path = IMG_DIR / filename
    
    # Sauvegarder le fichier
    try:
        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la sauvegarde du fichier: {str(e)}"
        )
    
    # Créer l'entrée en base de données
    image = Image(
        item_id=item_id,
        url=f"/img/{filename}",
        is_main=is_main
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

# ----------------
# READ (images d'un item)
# ----------------
@router.get(
    "/item/{item_id}",
    response_model=list[ImageRead]
)
def list_images_for_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Image).filter(Image.item_id == item_id).all()

# ----------------
# DELETE
# ----------------
@router.delete(
    "/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_image(
    image_id: int,
    db: Session = Depends(get_db)
):
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Optionnel : Supprimer le fichier physique aussi
    try:
        file_path = Path(image.url.lstrip('/'))
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        print(f"Erreur suppression fichier: {e}")
    
    db.delete(image)
    db.commit()
    return None
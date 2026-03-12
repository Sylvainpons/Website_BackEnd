from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.SubCategory import SubCategory
from app.models.Category import Category
from app.schemas.subCategory import SubCategoryCreate,SubCategoryUpdate,SubCategoryRead

# Define the API router for subcategory-related endpoints
router=APIRouter(
    prefix="/subcategories",
    tags=["subCategories"]
)

# ----------------
# CREATE
# ----------------
@router.post(
    "",
    response_model=SubCategoryRead,
    status_code=status.HTTP_201_CREATED
)
def create_subcategory(
    data:SubCategoryCreate,
    db:Session=Depends(get_db)
    ):

    #Check if category exist 
    if data.category_id is not None:
        category = db.query(Category).filter(Category.id == data.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category does not exist"
        )

    subcategory=SubCategory(
        name=data.name,
        slug=data.slug,
        category_id=data.category_id
    )
    db.add(subcategory)
    db.commit()
    db.refresh(subcategory)
    return subcategory

# ----------------
# READ ALL
# ----------------
@router.get(
    "",
    response_model=list[SubCategoryRead]
)
def list_all_subcategories(db:Session=Depends(get_db)):
    return db.query(SubCategory).all()
# ----------------
# READ ONE
# ----------------
@router.get(
    "/{subcategory_id}",
    response_model=SubCategoryRead
)
def get_subcategory(
    subcategory_id:int,
    db:Session=Depends(get_db)
):
    subCategory = db.query(SubCategory).filter(SubCategory.id==subcategory_id).first()
    if not subCategory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"status":"SubCategory not found"}
        )
    return subCategory
# ----------------
# UPDATE
# ----------------
@router.put(
    "/{subcategory_id}",
    response_model=SubCategoryRead
)
def update_subcategory(
    subcategory_id:int,
    data:SubCategoryUpdate,
    db:Session=Depends(get_db)
):
    subCategory = db.query(SubCategory).filter(SubCategory.id==subcategory_id).first()
    if not subCategory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"status":"SubCategory not found"}
        )
    if data.category_id is not None:
        category = db.query(Category).filter(Category.id == data.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category does not exist"
        )
    subCategory.category_id = data.category_id
    if data.name is not None:
        subCategory.name = data.name  # type: ignore
    if data.slug is not None:
        subCategory.slug = data.slug  # type: ignore
    db.commit()
    db.refresh(subCategory)
    return subCategory

# ----------------
# DELETE
# ----------------
@router.delete(
    "/{subcategory_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_subcategory(
    subcategory_id:int,
    db:Session=Depends(get_db)
):
    subCategory = db.query(SubCategory).filter(SubCategory.id==subcategory_id).first()
    if not subCategory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"status":"SubCategory not found"}
        )
    db.delete(subCategory)
    db.commit()
    return None


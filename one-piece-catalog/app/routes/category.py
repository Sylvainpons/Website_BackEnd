from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.Category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryRead
# Define the API router for category-related endpoints
router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

# ----------------
# CREATE/
# ----------------
#déclare the route for creating a new category
@router.post(
    "",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED
)
#déclare the function for creating a new category
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db)
):
    # Create a new Category instance
    category = Category(
        name=data.name,
        slug=data.slug
    )
    # Add the new category to the database session and commit the transaction
    db.add(category)
    # excute the commit to save the new category
    db.commit()
    db.refresh(category)
    # Return the newly created category
    return category


# ----------------
# READ ALL
# ----------------
# declare the route for listing all categories
@router.get(
    "",
    response_model=list[CategoryRead]
)
# declare the function for listing all categories
def list_all_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


# ----------------
# READ ONE
# ----------------
# declare the route for retrieving a single category by its ID
@router.get(
    "/{category_id}",
    response_model=CategoryRead
)
# declare the function for retrieving a single category by its ID
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):  
    # Query the database for the category with the specified ID
    category = db.query(Category).filter(Category.id == category_id).first()
    # If the category does not exist, raise a 404 HTTP exception
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


# ----------------
# UPDATE
# ----------------
# declare the route for updating an existing category by its ID
@router.put(
    "/{category_id}",
    response_model=CategoryRead
)
# declare the function for updating an existing category by its ID
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db)
):
    # Query the database for the category with the specified ID
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if data.name is not None:
        category.name = data.name # type: ignore
    if data.slug is not None:
        category.slug = data.slug # type: ignore

    db.commit()
    db.refresh(category)

    return category


# ----------------
# DELETE
# ----------------
# declare the route for deleting a category by its ID
@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
# declare the function for deleting a category by its ID
def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(category)
    db.commit()

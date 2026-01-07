from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.Item import Item
from app.models.Category import Category
from app.models.SubCategory import SubCategory
from app.schemas.item import ItemCreate, ItemUpdate, ItemRead

router = APIRouter(
    prefix="/items",
    tags=["items"]
)

# ----------------
# CREATE
# ----------------
@router.post(
    "",
    response_model=ItemRead,
    status_code=status.HTTP_201_CREATED
)
def create_item(
    data: ItemCreate,
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == data.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category does not exist"
        )

    subcategory = db.query(SubCategory).filter(SubCategory.id == data.subcategory_id).first()
    if not subcategory:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SubCategory does not exist"
        )

    item = Item(
        title=data.title,
        description=data.description,
        year=data.year,
        external_link=data.external_link,
        category_id=data.category_id,
        subcategory_id=data.subcategory_id
    )

    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# ----------------
# READ ALL
# ----------------
@router.get(
    "",
    response_model=list[ItemRead]
)
def list_items(
    db: Session = Depends(get_db)
):
    return db.query(Item).all()


# ----------------
# READ ONE
# ----------------
@router.get(
    "/{item_id}",
    response_model=ItemRead
)
def get_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item


# ----------------
# UPDATE
# ----------------
@router.put(
    "/{item_id}",
    response_model=ItemRead
)
def update_item(
    item_id: int,
    data: ItemUpdate,
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    if data.category_id is not None:
        category = db.query(Category).filter(Category.id == data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category does not exist"
            )
        item.category_id = data.category_id

    if data.subcategory_id is not None:
        subcategory = db.query(SubCategory).filter(SubCategory.id == data.subcategory_id).first()
        if not subcategory:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SubCategory does not exist"
            )
        item.subcategory_id = data.subcategory_id

    if data.title is not None:
        item.title = data.title
    if data.description is not None:
        item.description = data.description
    if data.year is not None:
        item.year = data.year
    if data.external_link is not None:
        item.external_link = data.external_link

    db.commit()
    db.refresh(item)
    return item


# ----------------
# DELETE
# ----------------
@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    db.delete(item)
    db.commit()
    return None

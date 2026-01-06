from pydantic import BaseModel
from datetime import datetime

class ItemCreate(BaseModel):
	title:str
	description:str
	year:int
	external_link:str
	category_id:int
	subcategory_id:int

class ItemUpdate(BaseModel):
	title:str |None = None
	description:str |None = None
	year:int |None = None
	external_link:str |None = None
	category_id:int |None = None
	subcategory_id:int |None = None

class ItemRead(BaseModel):
	title:str
	description:str
	year:int
	external_link:str
	category_id:int
	subcategory_id:int
	created_at:datetime

	class Config:
		from_attributes = True
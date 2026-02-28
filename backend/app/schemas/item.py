from pydantic import BaseModel, Field
import uuid
from datetime import datetime


class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=300)
    link: str | None = None
    price: int = Field(gt=0)
    image_url: str | None = None


class ItemUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=300)
    link: str | None = None
    price: int | None = Field(None, gt=0)
    image_url: str | None = None


class ItemResponse(BaseModel):
    id: uuid.UUID
    wishlist_id: uuid.UUID
    name: str
    link: str | None
    price: int
    image_url: str | None
    total_funded: int = 0
    contributor_count: int = 0
    status: str = "AVAILABLE"
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

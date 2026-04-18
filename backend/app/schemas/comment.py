from datetime import datetime

from pydantic import BaseModel


class CommentCreate(BaseModel):
    text: str


class CommentResponse(BaseModel):
    id: str
    text: str
    created_at: datetime
    author_id: str
    author_display_name: str

    model_config = {"from_attributes": True}

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str


class CategoryResponse(BaseModel):
    id: str
    name: str

    model_config = {"from_attributes": True}


class TicketTypeCreate(BaseModel):
    name: str


class TicketTypeResponse(BaseModel):
    id: str
    name: str

    model_config = {"from_attributes": True}

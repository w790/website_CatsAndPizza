from pydantic import BaseModel, Field

class PizzaBase(BaseModel):
    id: str = Field(pattern = "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$")
class PizzaToReturn(PizzaBase):
    name: str = Field(min_length = 3, max_length = 20)
    cost: float = Field(ge = 0)
    imgURL: str
class OrderContent(PizzaBase):
    amount: int = Field(default = 1, ge = 1)
class OrderContentToReturn(OrderContent, PizzaToReturn): pass
class OrderBase(BaseModel):
    customer_name: str = Field(min_length = 3, max_length = 20)
    address: str = Field(min_length = 3)
class OrderCreate(OrderBase):
    pizzas: list[OrderContent]
class OrderToReturn(OrderBase):
    id: str = Field(pattern = "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$")
    pizzas: list[OrderContentToReturn]
    completed: bool = False

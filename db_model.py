from sqlalchemy.orm import DeclarativeBase,relationship
from sqlalchemy import Column, UUID, String, Float,Boolean,Integer,ForeignKey
from uuid import uuid4

class Base(DeclarativeBase):pass

class Pizza(Base):
    __tablename__ = "pizzas"
    id = Column(UUID,primary_key = True,index=True,default=uuid4)
    name = Column(String,nullable =False,unique=True)
    cost = Column(Float,nullable =False)
    imgURL = Column(String, nullable = False)
    orderContents = relationship("OrderContent",back_populates ="pizza",cascade = "all,delete-orphan")

class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID,primary_key=True,index=True,default=uuid4)
    customer_name = Column(String,nullable=False)
    address = Column(String,nullable=False)
    completed = Column(Boolean,nullable=False,default=False)
    orderContents = relationship("OrderContent",back_populates ="order",cascade = "all,delete-orphan")

class OrderContent(Base):
    __tablename__ = "order_contents"
    id = Column(UUID,primary_key=True,index=True,default=uuid4)
    order_id = Column(UUID,ForeignKey("orders.id"))
    pizza_id = Column(UUID,ForeignKey("pizzas.id"))
    amount = Column(Integer,nullable =False,default=1)
    order = relationship("Order", back_populates = "orderContents")
    pizza = relationship("Pizza", back_populates = "orderContents")

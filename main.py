from fastapi import FastAPI, Depends,Path
from fastapi.responses import FileResponse,JSONResponse
from sqlalchemy.orm import Session
from db import get_db
from db_model import Pizza, Order, OrderContent
from local_model import PizzaToReturn,OrderCreate, OrderContentToReturn, OrderToReturn
from uuid import UUID
from sqlalchemy.exc import IntegrityError
from fastapi.staticfiles import StaticFiles

app = FastAPI()

@app.get("/")
def root():
 return FileResponse(path = "./public/index.html")

@app.get("/cart")
def cart():
 return FileResponse(path = "./public/cart.html")

@app.get("/orders")
def orders():
 return FileResponse(path = "./public/orders.html")

@app.get("/api/pizzas")
def getPizzas(db: Session = Depends(get_db)): 
    pizzas_in_db = db.query(Pizza).all()
    pizzas_to_return = []
    for pizza_in_db in pizzas_in_db:
        pizzas_to_return.append(PizzaToReturn(
        id = str(pizza_in_db.id),
        name = pizza_in_db.name,
        cost = pizza_in_db.cost,
        imgURL = pizza_in_db.imgURL
    ))
    return pizzas_to_return

@app.post("/api/orders")
def createOrder(new_order: OrderCreate, db: Session = Depends(get_db)): 
    if len(new_order.pizzas) == 0:
        return JSONResponse(status_code = 422, content = {"message": "Пустой заказ"})
    new_order_db = Order(customer_name = new_order.customer_name, address = new_order.address)
    for orderPoint in new_order.pizzas:
        new_order_db.orderContents.append(OrderContent(
        pizza_id = UUID(orderPoint.id),
        amount = orderPoint.amount
        ))
    db.add(new_order_db)

    try:
        db.commit()
        db.refresh(new_order_db)
        pizzas = []
        for orderPoint in new_order_db.orderContents:
            pizzas.append(OrderContentToReturn(
                id = str(orderPoint.pizza.id),
                amount = orderPoint.amount,
                name = orderPoint.pizza.name,
                cost = orderPoint.pizza.cost,
                imgURL = orderPoint.pizza.imgURL
            )
        )
        return OrderToReturn(
            id = str(new_order_db.id),
            customer_name = new_order_db.customer_name,
            address = new_order_db.address,
            pizzas = pizzas
        )
    except IntegrityError: 
        db.rollback()
        return JSONResponse(status_code = 422, content = {"message": "Идентификатора по крайней мере одной из пицц не существует в базе данных"})
    
@app.get("/api/orders")
def getOrders(db: Session = Depends(get_db)):
    orders_db = db.query(Order).all()
    orders = []
    for order_db in orders_db:
        pizzas = []
        for orderPoint in order_db.orderContents:
            pizzas.append(OrderContentToReturn(
                id = str(orderPoint.pizza.id),
                amount = orderPoint.amount,
                name = orderPoint.pizza.name,
                cost = orderPoint.pizza.cost,
                imgURL = orderPoint.pizza.imgURL
        ))
        orders.append(OrderToReturn(
            id = str(order_db.id),
            customer_name = order_db.customer_name,
            address = order_db.address,
            pizzas = pizzas,
            completed = order_db.completed
        ))
    return orders

@app.delete("/api/orders/{id}")
def deleteOrder(
    id: str = Path(pattern = "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"),
    db: Session = Depends(get_db)
): 
    order_db = db.get(Order, UUID(id))
    if (order_db == None):
        return JSONResponse(status_code = 404, content = {"message": "Заказ не найден"})
    pizzas = []
    for orderPoint in order_db.orderContents:
        pizzas.append(OrderContentToReturn(
            id = str(orderPoint.pizza.id),
            amount = orderPoint.amount,
            name = orderPoint.pizza.name,
            cost = orderPoint.pizza.cost,
            imgURL = orderPoint.pizza.imgURL
    ))
    orderToReturn = OrderToReturn(
        id = str(order_db.id),
        customer_name = order_db.customer_name,
        address = order_db.address,
        pizzas = pizzas,
        completed = order_db.completed
    )
    db.delete(order_db)
    db.commit()
    return orderToReturn

@app.patch("/api/orders/{id}")
def toggleOrderStatus(
    id: str = Path(pattern = "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"),
    db: Session = Depends(get_db)
):
    order_db = db.get(Order, UUID(id))
    if (order_db == None):
        return JSONResponse(status_code = 404, content = {"message": "Заказ не найден"})
    order_db.completed = not order_db.completed
    db.commit()

    pizzas = []
    for orderPoint in order_db.orderContents:
        pizzas.append(OrderContentToReturn(
            id = str(orderPoint.pizza.id),
            amount = orderPoint.amount,
            name = orderPoint.pizza.name,
            cost = orderPoint.pizza.cost,
            imgURL = orderPoint.pizza.imgURL
        ))
    return OrderToReturn(
        id = str(order_db.id),
        customer_name = order_db.customer_name,
        address = order_db.address,
        pizzas = pizzas,
        completed = order_db.completed
)
app.mount("/public", StaticFiles(directory = "./public"))
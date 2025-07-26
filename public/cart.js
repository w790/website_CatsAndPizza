let pizzas = null;
function updateOrderInfo(order) {
 const orderSizeEl = document.querySelector(".order-size");
 const orderCostEl = document.querySelector(".order-cost");
 const orderFormBtn = document.querySelector(".order-form-btn");
 let orderSize = 0;
 let orderCost = 0;
 for (const pizza of order) {
 orderSize += pizza.amount;
 orderCost += pizza.amount * pizzas.find(p => p.id === pizza.id).cost;
 }
 orderFormBtn.innerText = `Оформить заказ на ${orderCost} \u20bd`;
 if (orderSize > 0) {
 orderFormBtn.disabled = false;
 } else {
 orderFormBtn.disabled = true;
 }
 orderSizeEl.innerText = orderSize;
 orderCostEl.innerText = `${orderCost} \u20bd`;
}
function onAmountControlBtnClick(click) {
 const btn = click.currentTarget;
 const orderItem = btn.closest(".order-item");
 const pizzaId = orderItem.getAttribute("data-pizza-id");
 const amountValue = orderItem.querySelector(".amount-control__amount-value");
 const order = JSON.parse(localStorage.getItem("order"));
 const pizzaInOrder = order.find(pizza => pizza.id === pizzaId);
 if (btn.classList.contains("amount-control__minus-btn")) {
 pizzaInOrder.amount--;
 if (pizzaInOrder.amount < 2) {
 btn.disabled = true;
 }
 } else {
 pizzaInOrder.amount++;
 if (pizzaInOrder.amount === 2) {
 const minusBtn = orderItem.querySelector(".amount-control__minus-btn");
 minusBtn.disabled = false;
 }
 }
 amountValue.innerText = pizzaInOrder.amount;
 localStorage.setItem("order", JSON.stringify(order));
 updateOrderInfo(order);
}
function onOrderControlDeleteBtnClick(click) {
 const btn = click.currentTarget;
 const orderItem = btn.closest(".order-item");
 const pizzaId = orderItem.getAttribute("data-pizza-id");
 const order = JSON.parse(localStorage.getItem("order"));
 const indexInOrder = order.indexOf(order.find(pizza => pizza.id === pizzaId));
 order.splice(indexInOrder, 1);
 if (order.length > 0) {
 localStorage.setItem("order", JSON.stringify(order));
 } else {
 localStorage.removeItem("order");
 }
 updateOrderInfo(order);
 orderItem.remove();
}
function createOrderItem(orderItemObj) {
 const pizza = pizzas.find(p => p.id === orderItemObj.id);
 const img = document.createElement("img");
 img.classList.add("w-100");
 img.alt = pizza.name;
 img.src = pizza.imgURL;
 const imgWrapper = document.createElement("div");
 imgWrapper.classList.add("col-1");
 imgWrapper.append(img);
 const pizzaName = document.createElement("h5");
 pizzaName.innerText = pizza.name;
 const pizzaCost = document.createElement("span");
 pizzaCost.innerText = `${pizza.cost} \u20bd`;
 const pizzaInfo = document.createElement("div");
 pizzaInfo.classList.add("d-flex", "flex-column");
 pizzaInfo.append(pizzaName, pizzaCost);
 const minusBtn = document.createElement("button");
 minusBtn.classList.add("btn", "rounded-circle", "amount-control__btn", "amountcontrol__minus-btn");
 minusBtn.addEventListener("click", onAmountControlBtnClick);
 if (orderItemObj.amount < 2) {
 minusBtn.disabled = true;
 }
 const amountValue = document.createElement("span");
 amountValue.classList.add("amount-control__amount-value", "fs-5", "fw-medium");
 amountValue.innerText = orderItemObj.amount;
 const plusBtn = document.createElement("button");
 plusBtn.classList.add("btn", "rounded-circle", "amount-control__btn", "amountcontrol__plus-btn");
 plusBtn.addEventListener("click", onAmountControlBtnClick);
 const amountControl = document.createElement("div");
 amountControl.classList.add("d-flex", "align-items-center", "gap-2");
 amountControl.append(minusBtn, amountValue, plusBtn);
 const deleteBtn = document.createElement("button");
 deleteBtn.classList.add("btn", "order-control__delete-btn");
 deleteBtn.addEventListener("click", onOrderControlDeleteBtnClick);
 const orderControl = document.createElement("div");
 orderControl.classList.add("d-flex", "align-items-center", "gap-5");
 orderControl.append(amountControl, deleteBtn);
 const contentWrapper = document.createElement("div");
 contentWrapper.classList.add("col-11", "d-flex", "justify-content-between", "align-itemscenter");
 contentWrapper.append(pizzaInfo, orderControl);
 const item = document.createElement("div");
 item.classList.add("row", "py-2", "matte-glass", "rounded", "order-item");
 item.setAttribute("data-pizza-id", orderItemObj.id);
 item.append(imgWrapper, contentWrapper);
 return item;
}
function createOrderSection(order) {
 const container = document.createElement("div");
 container.classList.add("container", "d-flex", "flex-column", "row-gap-3");
 for (const orderItemObj of order) {
 container.append(createOrderItem(orderItemObj));
 }
 const orderSection = document.createElement("section");
 orderSection.classList.add("mb-4");
 orderSection.append(container);
 return orderSection;
}
async function onOrderFormSubmit(submit) {
 submit.preventDefault();
 const orderForm = submit.currentTarget;
 const customerName = document.getElementById("customer_name");
 const address = document.getElementById("address");
 const order = JSON.parse(localStorage.getItem("order"));
 const response = await fetch(orderForm.action, {
    method: orderForm.method,
 headers: {"Content-Type": "application/json"},
 body: JSON.stringify({
 "customer_name": customerName.value,
 "address": address.value,
 "pizzas": order
 })
 });
 if (response.ok) {
 localStorage.removeItem("order");
 }
 window.location.href = "/";
}
(async () => {
 pizzas = await getPizzas();
 const order = JSON.parse(localStorage.getItem("order")) || [];
 updateOrderInfo(order);
 const main = document.querySelector("main");
 main.prepend(createOrderSection(order));
 const orderForm = main.querySelector(".order-form");
 orderForm.addEventListener("submit", onOrderFormSubmit);
})();
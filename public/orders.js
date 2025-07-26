async function getOrders() {
 const response = await fetch("/api/orders");
 return await response.json();
}
function onCompletedCheckboxClick(click) {
 const checkbox = click.currentTarget;
 const orderItem = checkbox.closest(".order-item");
 const orderId = orderItem.getAttribute("data-order-id");
 const incompleteOrders = document.querySelector(".incomplete-orders");
 if (checkbox.checked) {
 incompleteOrders.innerText = parseInt(incompleteOrders.innerText) - 1;
 orderItem.classList.add("matte-glass-success");
 orderItem.dataset.completed = "true";
 } else {
 incompleteOrders.innerText = parseInt(incompleteOrders.innerText) + 1;
 orderItem.classList.remove("matte-glass-success");
 orderItem.dataset.completed = "false";
 }
 fetch(`/api/orders/${orderId}`, {method: "PATCH"});
}
function onDeleteOrderBtnClick(click) {
 const btn = click.currentTarget;
 const orderItem = btn.closest(".order-item");
 const orderId = orderItem.getAttribute("data-order-id");
 const ordersAmount = document.querySelector(".orders-amount");
 ordersAmount.innerText = parseInt(ordersAmount.innerText) - 1;
 if (orderItem.dataset.completed === "false") {
 const incompleteOrders = document.querySelector(".incomplete-orders");
 incompleteOrders.innerText = parseInt(incompleteOrders.innerText) - 1;
 }
 orderItem.remove();
 fetch(`/api/orders/${orderId}`, {method: "DELETE"});
}
function createOrderItem(orderObj) {
 const customerName = document.createElement("span");
 customerName.classList.add("col-2", "text-start");
 customerName.innerText = orderObj.customer_name;
 const address = document.createElement("span");
 address.classList.add("col-7", "text-start");
 address.innerText = orderObj.address;
 let totalCost = 0;
 for (const pizza of orderObj.pizzas) {
 totalCost += pizza.amount * pizza.cost;
 }
 const totalCostEl = document.createElement("span");
 totalCostEl.classList.add("col-2", "text-start");
 totalCostEl.innerText = `${totalCost} \u20bd`;
 const expandIcon = document.createElement("span");
 expandIcon.classList.add("order-expand-icon", "col-1", "d-flex", "justify-content-end");
 const orderOpenBtn = document.createElement("button");
 orderOpenBtn.classList.add("order-open-btn", "row", "w-100", "py-3");
 orderOpenBtn.append(customerName, address, totalCostEl, expandIcon);
 orderOpenBtn.addEventListener("click", click => {
 orderItem.classList.toggle("order-item_active");
 });
 const orderHeader = document.createElement("h5");
 orderHeader.classList.add("order-header", "mb-0");
 orderHeader.append(orderOpenBtn);
 const orderBodyWrapper = document.createElement("div");
 orderBodyWrapper.classList.add("d-flex", "flex-column", "row-gap-2");
 for (const pizza of orderObj.pizzas) {
 const img = document.createElement("img");
 img.classList.add("w-100");
 img.src = pizza.imgURL;
 img.alt = pizza.name;
 const imgWrapper = document.createElement("div");
 imgWrapper.classList.add("col-1");
 imgWrapper.append(img);
 const pizzaName = document.createElement("span");
 pizzaName.classList.add("col-3", "text-start", "fs-5");
 pizzaName.innerText = pizza.name;
 const orderPointCost = document.createElement("span");
 orderPointCost.classList.add("col-8", "text-end", "fs-5");
 orderPointCost.innerText = `${pizza.amount} * ${pizza.cost} = ${pizza.amount *
pizza.cost} \u20bd`;
 const orderPoint = document.createElement("div");
 orderPoint.classList.add("order-point", "row", "align-items-center");
 orderPoint.append(imgWrapper, pizzaName, orderPointCost);
 orderBodyWrapper.append(orderPoint);
 }
 const completedCheckbox = document.createElement("input");
 completedCheckbox.type = "checkbox";
 completedCheckbox.id = `completed-checkbox-${orderObj.id}`;
 completedCheckbox.classList.add("btn-check");
 completedCheckbox.addEventListener("click", onCompletedCheckboxClick);
 const completedLabel = document.createElement("label");
 completedLabel.classList.add("btn", "btn-outline-success", "fw-semibold", "me-2");
 completedLabel.setAttribute("for", `completed-checkbox-${orderObj.id}`);
 completedLabel.innerText = "Завершить";
 const deleteBtn = document.createElement("button");
 deleteBtn.classList.add("btn", "btn-danger", "fw-semibold");
 deleteBtn.innerText = "Удалить";
 deleteBtn.addEventListener("click", onDeleteOrderBtnClick);
 const orderControl = document.createElement("div");
 orderControl.classList.add("d-flex", "justify-content-end", "align-items-center");
 orderControl.append(completedCheckbox, completedLabel, deleteBtn);
 orderBodyWrapper.append(orderControl);
 const orderBody = document.createElement("div");
 orderBody.classList.add("order-body", "pb-3");
 orderBody.append(orderBodyWrapper);
 const orderItem = document.createElement("div");
 orderItem.classList.add("order-item", "matte-glass", "container", "mb-2", "rounded");
 orderItem.setAttribute("data-order-id", orderObj.id);
 orderItem.append(orderHeader, orderBody);
 if (orderObj.completed) {
 completedCheckbox.checked = true;
 orderItem.classList.add("matte-glass-success");
 orderItem.dataset.completed = "true";
 } else {
 orderItem.dataset.completed = "false";
 }
 return orderItem;
}
function createOrderList(orders) {
 const orderList = document.createElement("div");
 orderList.classList.add("order-list");
 for (const order of orders) {
 orderList.append(createOrderItem(order));
 }
 return orderList;
}
(async () => {
 const orders = await getOrders();
 const sectionOrders = document.querySelector(".orders");
 sectionOrders.append(createOrderList(orders));
 const ordersAmount = document.querySelector(".orders-amount");
 const incompleteOrders = document.querySelector(".incomplete-orders");
 ordersAmount.innerText = orders.length;
 incompleteOrders.innerText = orders.filter(order => !order.completed).length;
})();
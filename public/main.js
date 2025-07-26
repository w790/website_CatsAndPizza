function updateLinkCart(order) {
 const linkCart = document.querySelector(".link-cart");
 let cartCounter = linkCart.querySelector(".cart-counter");
 if (order.length > 0) {
 let orderSize = 0;
 for (const pizza of order) {
 orderSize += pizza.amount;
 }
 if (!cartCounter) {
 cartCounter = document.createElement("span");
 cartCounter.classList.add("cart-counter", "position-absolute", "top-0", "start-100",
"translate-middle", "badge", "rounded-pill", "bg-danger");
 linkCart.append(cartCounter);
 }
 cartCounter.innerText = orderSize;
 } else {
 cartCounter?.remove();
 }
}
function onChoosePizzaBtnClick(click) {
 const btn = click.currentTarget;
 const card = btn.closest(".card");
 const pizzaId = card.getAttribute("data-pizza-id");
 const order = JSON.parse(localStorage.getItem("order")) || [];
 const pizzaInOrder = order.find(pizza => pizza.id === pizzaId);
 if (pizzaInOrder) {
 pizzaInOrder.amount++;
 } else {
 order.push({id: pizzaId, amount: 1});
 }
 localStorage.setItem("order", JSON.stringify(order));
 updateLinkCart(order);
}
function createMenuItem(pizzaObj) {
 const img = document.createElement("img");
 img.classList.add("card-img-top");
 img.alt = pizzaObj.name;
 img.src = pizzaObj.imgURL;
 const cardTitle = document.createElement("h5");
 cardTitle.classList.add("card-title", "text-center");
 cardTitle.innerText = pizzaObj.name;
 const btn = document.createElement("button");
 btn.classList.add("btn", "btn-dark")
 btn.innerText = `${pizzaObj.cost} \u20bd`;
 btn.addEventListener("click", onChoosePizzaBtnClick);
 const cardBody = document.createElement("div");
 cardBody.classList.add("card-body");
 cardBody.append(cardTitle, btn);
 const card = document.createElement("div");
 card.classList.add("card", "p-2", "text-end", "matte-glass");
 card.setAttribute("data-pizza-id", pizzaObj.id);
 card.append(img, cardBody);
 const item = document.createElement("div");
 item.classList.add("col-3");
 item.append(card);
 return item;
}
function createMenu(pizzas) {
 const row = document.createElement("div");
 row.classList.add("row", "row-gap-3");
 for (const pizzaObj of pizzas) {
 row.append(createMenuItem(pizzaObj));
 }
 const container = document.createElement("div");
 container.classList.add("container");
 container.append(row);
 const menu = document.createElement("section");
 menu.id = "menu";
 menu.classList.add("mb-4");
 menu.append(container);
 return menu;
}
(async () => {
 const main = document.querySelector("main");
 const pizzas = await getPizzas();
 main.append(createMenu(pizzas));
 const order = JSON.parse(localStorage.getItem("order")) || [];
 updateLinkCart(order);
})();
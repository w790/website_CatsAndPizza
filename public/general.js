async function getPizzas() {
 const response = await fetch("/api/pizzas");
 return await response.json();
}


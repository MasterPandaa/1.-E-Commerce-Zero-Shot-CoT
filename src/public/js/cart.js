async function loadCart() {
  try {
    const data = await api("/cart");
    const c = document.getElementById("cartItems");
    c.innerHTML = data.items
      .map(
        (it) => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <div>
            <div><b>${it.product_name}</b></div>
            <div>$${Number(it.unit_price).toFixed(2)}</div>
          </div>
          <div>
            <input type="number" data-id="${it.product_id}" class="qty" min="0" value="${it.quantity}" style="width:80px" />
          </div>
        </div>
      </div>
    `,
      )
      .join("");
    document.getElementById("cartTotals").innerHTML =
      `<h3>Total: $${Number(data.totals.total).toFixed(2)}</h3>`;
    c.querySelectorAll(".qty").forEach((inp) =>
      inp.addEventListener("change", async () => {
        const productId = Number(inp.dataset.id);
        const quantity = Number(inp.value);
        await api("/cart/items/" + productId, {
          method: "PATCH",
          body: JSON.stringify({ quantity }),
        });
        loadCart();
      }),
    );
  } catch (err) {
    if (/Unauthorized/i.test(err.message)) {
      alert("Please login to view your cart.");
      window.location.href = "/login.html";
    } else {
      alert(err.message);
    }
  }
}

document.addEventListener("DOMContentLoaded", loadCart);

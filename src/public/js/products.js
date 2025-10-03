async function loadCategories() {
  const cats = await api("/products/categories/list");
  const sel = document.getElementById("category");
  if (!sel) return;
  sel.innerHTML =
    '<option value="">All categories</option>' +
    cats.map((c) => `<option value="${c.slug}">${c.name}</option>`).join("");
}

async function loadProducts(page = 1) {
  const q = document.getElementById("search").value.trim();
  const category = document.getElementById("category").value;
  const price_min = document.getElementById("priceMin").value;
  const price_max = document.getElementById("priceMax").value;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (price_min) params.set("price_min", price_min);
  if (price_max) params.set("price_max", price_max);
  params.set("page", page);
  params.set("limit", 12);

  const resp = await api("/products?" + params.toString());
  const list = document.getElementById("products");
  list.innerHTML = resp.data
    .map(
      (p) => `
    <div class="card">
      <img class="product-img" src="${p.image_url || "https://via.placeholder.com/300x200?text=No+Image"}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>${p.description ? p.description.substring(0, 120) : ""}</p>
      <p><b>$${Number(p.price).toFixed(2)}</b></p>
      <button data-id="${p.id}" class="addCart">Add to cart</button>
    </div>
  `,
    )
    .join("");
  list.querySelectorAll(".addCart").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api("/cart/items", {
          method: "POST",
          body: JSON.stringify({
            product_id: Number(btn.dataset.id),
            quantity: 1,
          }),
        });
        alert("Added to cart");
      } catch (e) {
        alert(e.message);
      }
    }),
  );

  const pag = document.getElementById("pagination");
  const totalPages = Math.ceil(resp.pagination.total / resp.pagination.limit);
  pag.innerHTML = "";
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const b = document.createElement("button");
      b.textContent = i;
      if (i === resp.pagination.page) b.disabled = true;
      b.addEventListener("click", () => loadProducts(i));
      pag.appendChild(b);
    }
  }
}

function initProductsPage() {
  const apply = document.getElementById("applyFilters");
  apply && apply.addEventListener("click", () => loadProducts(1));
  // Real-time search debounce
  const search = document.getElementById("search");
  let t;
  if (search) {
    search.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => loadProducts(1), 300);
    });
  }
  loadCategories().then(() => loadProducts());
}

document.addEventListener("DOMContentLoaded", initProductsPage);

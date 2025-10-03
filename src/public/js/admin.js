async function requireAdmin() {
  const me = await api("/auth/me");
  if (me.role !== "admin") throw new Error("Admin only");
}

async function loadStats() {
  const stats = await api("/admin/stats");
  drawSalesChart(stats.monthly || []);
}

async function loadOrders() {
  const out = await api("/admin/orders?limit=20");
  const div = document.getElementById("orders");
  div.innerHTML = out.data
    .map(
      (o) =>
        `<div class="card">#${o.id} - ${o.status} - $${o.total_amount}</div>`,
    )
    .join("");
}

async function loadUsers() {
  const out = await api("/admin/users?limit=20");
  const div = document.getElementById("users");
  div.innerHTML = out.data
    .map((u) => `<div class="card">${u.id} - ${u.email} (${u.role})</div>`)
    .join("");
}

async function loadCategories() {
  const cats = await api("/products/categories/list");
  const sel = document.getElementById("p_category");
  if (!sel) return;
  sel.innerHTML =
    '<option value="">No category</option>' +
    cats.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

async function listAdminProducts() {
  const resp = await api("/products?limit=50");
  const div = document.getElementById("adminProducts");
  div.innerHTML = resp.data
    .map(
      (p) => `
    <div class="card">
      <div style="display:flex;gap:8px;align-items:center">
        <img src="${p.image_url || "https://via.placeholder.com/80x60?text=No+Image"}" style="width:80px;height:60px;object-fit:cover;border-radius:4px" />
        <div style="flex:1">
          <div><b>${p.name}</b></div>
          <div>$${Number(p.price).toFixed(2)} | Stock: ${p.stock}</div>
        </div>
        <button class="del" data-id="${p.id}">Delete</button>
      </div>
    </div>
  `,
    )
    .join("");
  div.querySelectorAll(".del").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this product?")) return;
      try {
        await api("/products/" + btn.dataset.id, { method: "DELETE" });
        await listAdminProducts();
      } catch (e) {
        alert(e.message);
      }
    }),
  );
}

function drawSalesChart(monthly) {
  const canvas = document.getElementById("salesChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const labels = monthly.map((m) => m.month);
  const values = monthly.map((m) => Number(m.revenue));
  const maxVal = Math.max(10, ...values);
  const padding = 30;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  // Axes
  ctx.strokeStyle = "#888";
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  if (values.length === 0) return;
  const stepX = chartW / (values.length - 1 || 1);

  // Line
  ctx.strokeStyle = "#0a66c2";
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = padding + i * stepX;
    const y = padding + chartH - (v / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Points
  ctx.fillStyle = "#0a66c2";
  values.forEach((v, i) => {
    const x = padding + i * stepX;
    const y = padding + chartH - (v / maxVal) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await requireAdmin();
    await Promise.all([
      loadStats(),
      loadOrders(),
      loadUsers(),
      loadCategories(),
      listAdminProducts(),
    ]);
    const form = document.getElementById("createProductForm");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          const fd = new FormData();
          fd.append("name", document.getElementById("p_name").value.trim());
          fd.append("price", document.getElementById("p_price").value);
          fd.append("stock", document.getElementById("p_stock").value || "0");
          fd.append(
            "category_id",
            document.getElementById("p_category").value || "",
          );
          fd.append(
            "description",
            document.getElementById("p_description").value,
          );
          const file = document.getElementById("p_image").files[0];
          if (file) fd.append("image", file);
          await api("/products", { method: "POST", body: fd });
          form.reset();
          await listAdminProducts();
          alert("Product created");
        } catch (e) {
          alert(e.message);
        }
      });
    }
  } catch (err) {
    alert(err.message);
    window.location.href = "/";
  }
});

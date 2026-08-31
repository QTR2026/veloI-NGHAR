// =============================================================
// VELORA — منطق صفحة المنتج المستقلة
// =============================================================
import { fetchProductById, CATEGORIES, formatPrice, placeholderImg, escapeHTML, addToCart, showToast } from "./store.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const wrap = document.getElementById("pd-wrap");

  if (!id) {
    wrap.innerHTML = notFoundHTML();
    return;
  }

  const product = await fetchProductById(id);
  if (!product) {
    wrap.innerHTML = notFoundHTML();
    return;
  }

  document.title = `${product.name} | VELORA`;
  document.getElementById("crumb-cat").textContent = CATEGORIES[product.category] || "";
  document.getElementById("crumb-name").textContent = product.name;

  const hasOffer = product.offer && product.oldPrice;

  wrap.innerHTML = `
    <div class="pd-gallery">
      <img src="${product.image || placeholderImg()}" alt="${escapeHTML(product.name)}">
    </div>
    <div class="pd-details">
      <span class="pd-cat">${CATEGORIES[product.category] || ""}</span>
      <h1 class="pd-name">${escapeHTML(product.name)}</h1>
      <div class="pd-price-row">
        <span class="pd-price">${formatPrice(product.price)}</span>
        ${hasOffer ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>` : ""}
      </div>
      <p class="pd-desc">${escapeHTML(product.description || "لا يوجد وصف لهذا المنتج حاليًا.")}</p>

      <div class="qty-row">
        <span>الكمية</span>
        <div class="qty-control">
          <button id="qty-inc">+</button>
          <span id="qty-val">1</span>
          <button id="qty-dec">−</button>
        </div>
      </div>

      <div class="pd-actions">
        <button class="btn btn-gold" id="add-cart-btn">أضيفي إلى السلة</button>
        <a href="cart.html" class="btn btn-outline">اذهبي للسلة</a>
      </div>
      <p class="pd-note">التوصيل متاح لجميع المدن — إتمام الطلب يتم مباشرة عبر واتساب.</p>
    </div>
  `;

  let qty = 1;
  const qtyVal = document.getElementById("qty-val");
  document.getElementById("qty-inc").addEventListener("click", () => {
    qty++; qtyVal.textContent = qty;
  });
  document.getElementById("qty-dec").addEventListener("click", () => {
    if (qty <= 1) return;
    qty--; qtyVal.textContent = qty;
  });
  document.getElementById("add-cart-btn").addEventListener("click", () => {
    addToCart(product, qty);
    showToast(`تمت إضافة "${product.name}" إلى السلة`);
  });
});

function notFoundHTML() {
  return `<div class="empty-state" style="grid-column:1/-1;">
    <h3>المنتج غير موجود</h3>
    <p>ربما تم حذفه أو أن الرابط غير صحيح.</p>
    <a href="index.html" class="btn btn-outline" style="margin-top:16px;">العودة للرئيسية</a>
  </div>`;
}

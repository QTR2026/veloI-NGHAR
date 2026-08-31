// =============================================================
// VELORA — منطق صفحة السلة الكاملة + إرسال الطلب عبر واتساب
// =============================================================
import { WHATSAPP_NUMBER } from "./firebase-config.js";
import {
  getCart, updateQty, removeFromCart, cartTotal, cartCount,
  formatPrice, placeholderImg, escapeHTML, buildWhatsAppOrderMessage, showToast
} from "./store.js";

const wrap = document.getElementById("cart-items-wrap");
const sumCount = document.getElementById("sum-count");
const sumTotal = document.getElementById("sum-total");

function render() {
  const cart = getCart();

  if (cart.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <h3>سلتكِ فارغة</h3>
        <p>لم تضيفي أي منتجات بعد.</p>
        <a href="index.html" class="btn btn-outline" style="margin-top:16px;">تصفّحي المنتجات</a>
      </div>`;
  } else {
    wrap.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image || placeholderImg()}" alt="${escapeHTML(item.name)}">
        <div>
          <div class="cart-item-name">${escapeHTML(item.name)}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="qty-control">
          <button data-inc>+</button>
          <span>${item.qty}</span>
          <button data-dec>−</button>
        </div>
        <button class="cart-remove" data-remove>حذف</button>
      </div>
    `).join("");

    wrap.querySelectorAll(".cart-item").forEach(row => {
      const id = row.dataset.id;
      row.querySelector("[data-inc]").addEventListener("click", () => {
        const item = getCart().find(i => i.id === id);
        updateQty(id, item.qty + 1);
        render();
      });
      row.querySelector("[data-dec]").addEventListener("click", () => {
        const item = getCart().find(i => i.id === id);
        if (item.qty <= 1) return;
        updateQty(id, item.qty - 1);
        render();
      });
      row.querySelector("[data-remove]").addEventListener("click", () => {
        removeFromCart(id);
        render();
      });
    });
  }

  sumCount.textContent = cartCount(cart);
  sumTotal.textContent = formatPrice(cartTotal(cart));

  const btn = document.getElementById("whatsapp-order");
  btn.disabled = cart.length === 0;
}

document.getElementById("whatsapp-order").addEventListener("click", () => {
  const cart = getCart();
  if (cart.length === 0) return;

  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-address").value.trim();

  if (!name || !phone) {
    showToast("رجاءً أدخلي الاسم ورقم الهاتف قبل إرسال الطلب");
    return;
  }

  const message = buildWhatsAppOrderMessage(cart, { name, phone, address });
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});

render();

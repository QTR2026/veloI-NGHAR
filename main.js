// =============================================================
// VELORA — تفاعلات مشتركة: القائمة، درج السلة
// =============================================================
import {
  getCart, saveCart, removeFromCart, updateQty,
  cartTotal, formatPrice, updateCartBadge, placeholderImg, escapeHTML
} from "./store.js";

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  /* قائمة الجوال */
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
      mainNav.style.display = mainNav.classList.contains("open") ? "flex" : "";
    });
  }

  /* درج السلة */
  const drawer = document.querySelector(".cart-drawer");
  const overlay = document.querySelector(".drawer-overlay");
  const openBtns = document.querySelectorAll("[data-open-cart]");
  const closeBtn = document.querySelector(".drawer-close");

  function openDrawer() {
    renderDrawer();
    drawer?.classList.add("open");
    overlay?.classList.add("open");
  }
  function closeDrawer() {
    drawer?.classList.remove("open");
    overlay?.classList.remove("open");
  }
  openBtns.forEach(b => b.addEventListener("click", (e) => { e.preventDefault(); openDrawer(); }));
  closeBtn?.addEventListener("click", closeDrawer);
  overlay?.addEventListener("click", closeDrawer);

  function renderDrawer() {
    const itemsEl = document.querySelector(".drawer-items");
    const footerEl = document.querySelector(".drawer-footer");
    if (!itemsEl) return;
    const cart = getCart();

    if (cart.length === 0) {
      itemsEl.innerHTML = `<div class="empty-state"><h3>السلة فارغة</h3><p>أضيفي منتجاتك المفضلة لتظهر هنا.</p></div>`;
      if (footerEl) footerEl.style.display = "none";
      return;
    }
    if (footerEl) footerEl.style.display = "block";

    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image || placeholderImg()}" alt="${escapeHTML(item.name)}">
        <div>
          <div class="cart-item-name">${escapeHTML(item.name)}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="qty-control" style="margin-top:8px;">
            <button data-dec>−</button>
            <span>${item.qty}</span>
            <button data-inc>+</button>
          </div>
        </div>
        <button class="cart-remove" data-remove>حذف</button>
      </div>
    `).join("");

    if (footerEl) {
      footerEl.innerHTML = `
        <div class="summary-total"><span>الإجمالي</span><strong>${formatPrice(cartTotal(cart))}</strong></div>
        <a href="cart.html" class="btn btn-gold btn-block">إتمام الطلب</a>
      `;
    }

    itemsEl.querySelectorAll(".cart-item").forEach(row => {
      const id = row.dataset.id;
      row.querySelector("[data-inc]").addEventListener("click", () => {
        const item = getCart().find(i => i.id === id);
        updateQty(id, item.qty + 1);
        renderDrawer();
      });
      row.querySelector("[data-dec]").addEventListener("click", () => {
        const item = getCart().find(i => i.id === id);
        if (item.qty <= 1) return;
        updateQty(id, item.qty - 1);
        renderDrawer();
      });
      row.querySelector("[data-remove]").addEventListener("click", () => {
        removeFromCart(id);
        renderDrawer();
      });
    });
  }

  /* الاستماع لأزرار "أضيفي إلى السلة" في أي صفحة (تفويض) */
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-add-id]");
    if (!btn) return;
    const { fetchProductById, addToCart, showToast } = await import("./store.js");
    const id = btn.dataset.addId;
    btn.disabled = true;
    const product = await fetchProductById(id);
    btn.disabled = false;
    if (!product) return;
    addToCart(product, 1);
    showToast(`تمت إضافة "${product.name}" إلى السلة`);
  });
});

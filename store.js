// =============================================================
// VELORA — منطق مشترك للمتجر (المنتجات + السلة)
// =============================================================
import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export const CATEGORIES = {
  beauty: "التجميل",
  perfumes: "العطور",
  fashion: "الأزياء"
};

const CART_KEY = "velora_cart";

/* ---------------- تنسيق السعر ---------------- */
export function formatPrice(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("ar") + " ر.س";
}

/* ---------------- جلب المنتجات من Firestore ---------------- */
export async function fetchProducts() {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("تعذر جلب المنتجات:", err);
    return [];
  }
}

export async function fetchProductById(id) {
  try {
    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("تعذر جلب المنتج:", err);
    return null;
  }
}

/* ---------------- بطاقة منتج (HTML) ---------------- */
export function productCardHTML(p) {
  const hasOffer = p.offer && p.oldPrice;
  return `
    <article class="prod-card">
      <a href="product.html?id=${p.id}" class="prod-thumb">
        ${hasOffer ? `<span class="badge-offer">عرض خاص</span>` : ""}
        <img src="${p.image || placeholderImg()}" alt="${escapeHTML(p.name)}" loading="lazy">
      </a>
      <div class="prod-info">
        <span class="prod-cat">${CATEGORIES[p.category] || ""}</span>
        <h3 class="prod-name"><a href="product.html?id=${p.id}">${escapeHTML(p.name)}</a></h3>
        <div class="prod-price-row">
          <span class="price">${formatPrice(p.price)}</span>
          ${hasOffer ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ""}
        </div>
        <button class="prod-add" data-add-id="${p.id}">أضيفي إلى السلة</button>
      </div>
    </article>`;
}

export function placeholderImg() {
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'>
       <rect width='100%' height='100%' fill='#1a1510'/>
       <text x='50%' y='50%' fill='#8a712a' font-family='sans-serif' font-size='16' text-anchor='middle'>VELORA</text>
     </svg>`
  );
}

export function escapeHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------------- السلة (localStorage) ---------------- */
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

export function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "",
      qty
    });
  }
  saveCart(cart);
}

export function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(cart);
}

export function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}

export function cartTotal(cart = getCart()) {
  return cart.reduce((sum, i) => sum + (Number(i.price) || 0) * i.qty, 0);
}

export function cartCount(cart = getCart()) {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

export function updateCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = cartCount();
}

/* ---------------- توست تنبيه ---------------- */
export function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

/* ---------------- رابط واتساب لإرسال الطلب ---------------- */
export function buildWhatsAppOrderMessage(cart, extra = {}) {
  const lines = [];
  lines.push("طلب جديد من متجر VELORA:");
  lines.push("");
  cart.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.name} × ${item.qty} — ${formatPrice(item.price * item.qty)}`);
  });
  lines.push("");
  lines.push(`الإجمالي: ${formatPrice(cartTotal(cart))}`);
  if (extra.name) lines.push(`الاسم: ${extra.name}`);
  if (extra.phone) lines.push(`الهاتف: ${extra.phone}`);
  if (extra.address) lines.push(`العنوان: ${extra.address}`);
  return lines.join("\n");
}

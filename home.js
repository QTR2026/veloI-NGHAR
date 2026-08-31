// =============================================================
// VELORA — منطق الصفحة الرئيسية
// =============================================================
import { fetchProducts, productCardHTML } from "./store.js";

document.addEventListener("DOMContentLoaded", async () => {
  const products = await fetchProducts();

  const featuredGrid = document.getElementById("featured-grid");
  const offersGrid = document.getElementById("offers-grid");
  const shopGrid = document.getElementById("shop-grid");
  const catTabs = document.getElementById("cat-tabs");

  const params = new URLSearchParams(location.search);
  const activeCat = params.get("cat") || "";

  if (products.length === 0) {
    const emptyMsg = `<div class="empty-state"><h3>لا توجد منتجات بعد</h3><p>سيتم عرض المنتجات هنا فور إضافتها من لوحة الإدارة.</p></div>`;
    featuredGrid.innerHTML = emptyMsg;
    offersGrid.innerHTML = emptyMsg;
    shopGrid.innerHTML = emptyMsg;
    document.getElementById("offers")?.style && (document.getElementById("offers").style.display = "none");
    return;
  }

  /* المختارات */
  const featured = products.filter(p => p.featured);
  featuredGrid.innerHTML = featured.length
    ? featured.slice(0, 8).map(productCardHTML).join("")
    : `<div class="empty-state"><h3>لا توجد مختارات حاليًا</h3></div>`;

  /* العروض */
  const offers = products.filter(p => p.offer);
  const offersSection = document.getElementById("offers");
  if (offers.length === 0) {
    offersSection.style.display = "none";
  } else {
    offersGrid.innerHTML = offers.slice(0, 8).map(productCardHTML).join("");
  }

  /* كل المنتجات مع الفلترة */
  function renderShop(cat) {
    const filtered = cat ? products.filter(p => p.category === cat) : products;
    shopGrid.innerHTML = filtered.length
      ? filtered.map(productCardHTML).join("")
      : `<div class="empty-state"><h3>لا توجد منتجات في هذا القسم</h3></div>`;

    catTabs.querySelectorAll("a").forEach(a => {
      a.style.color = a.dataset.cat === cat ? "var(--gold-light)" : "";
    });
  }
  renderShop(activeCat);
});

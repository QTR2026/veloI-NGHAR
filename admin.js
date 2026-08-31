// =============================================================
// VELORA — لوحة الإدارة: تسجيل الدخول + إدارة المنتجات (CRUD)
// =============================================================
import { db, auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs,
  query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const CATEGORIES = { beauty: "التجميل", perfumes: "العطور", fashion: "الأزياء" };

/* ---------------- عناصر DOM ---------------- */
const loginScreen = document.getElementById("login-screen");
const adminShell = document.getElementById("admin-shell");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginBtn = document.getElementById("login-btn");
const adminEmail = document.getElementById("admin-email");
const logoutBtn = document.getElementById("logout-btn");

const productForm = document.getElementById("product-form");
const formTitle = document.getElementById("form-title");
const cancelEditBtn = document.getElementById("cancel-edit");
const saveBtn = document.getElementById("save-btn");
const tableWrap = document.getElementById("table-wrap");
const imgPreview = document.getElementById("img-preview");

const fId = document.getElementById("prod-id");
const fImage = document.getElementById("prod-image");
const fName = document.getElementById("prod-name");
const fCategory = document.getElementById("prod-category");
const fPrice = document.getElementById("prod-price");
const fOldPrice = document.getElementById("prod-oldprice");
const fDesc = document.getElementById("prod-desc");
const fFeatured = document.getElementById("prod-featured");
const fOffer = document.getElementById("prod-offer");

/* ---------------- حالة تسجيل الدخول ---------------- */
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.style.display = "none";
    adminShell.classList.add("show");
    adminEmail.textContent = user.email;
    loadProducts();
  } else {
    loginScreen.style.display = "flex";
    adminShell.classList.remove("show");
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.classList.remove("show");
  loginBtn.disabled = true;
  loginBtn.textContent = "جارِ الدخول…";
  try {
    await signInWithEmailAndPassword(
      auth,
      document.getElementById("login-email").value.trim(),
      document.getElementById("login-password").value
    );
  } catch (err) {
    loginError.textContent = translateAuthError(err.code);
    loginError.classList.add("show");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "تسجيل الدخول";
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

function translateAuthError(code) {
  const map = {
    "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة.",
    "auth/user-not-found": "لا يوجد حساب بهذا البريد الإلكتروني.",
    "auth/wrong-password": "كلمة المرور غير صحيحة.",
    "auth/invalid-credential": "بيانات الدخول غير صحيحة.",
    "auth/too-many-requests": "محاولات كثيرة، حاولي لاحقًا."
  };
  return map[code] || "تعذر تسجيل الدخول، تأكدي من البيانات.";
}

/* ---------------- معاينة الصورة ---------------- */
fImage.addEventListener("input", () => {
  const url = fImage.value.trim();
  imgPreview.innerHTML = url ? `<img src="${url}" alt="">` : "لا توجد صورة";
});

/* ---------------- تحميل وعرض المنتجات ---------------- */
let productsCache = [];

async function loadProducts() {
  tableWrap.innerHTML = `<div class="empty-row">جارِ التحميل…</div>`;
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  productsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderStats();
  renderTable();
}

function renderStats() {
  document.getElementById("stat-total").textContent = productsCache.length;
  document.getElementById("stat-offers").textContent = productsCache.filter(p => p.offer).length;
  document.getElementById("stat-featured").textContent = productsCache.filter(p => p.featured).length;
}

function renderTable() {
  if (productsCache.length === 0) {
    tableWrap.innerHTML = `<div class="empty-row">لا توجد منتجات بعد. أضيفي أول منتج من النموذج أعلاه.</div>`;
    return;
  }
  tableWrap.innerHTML = `
    <table class="prod-table">
      <thead>
        <tr>
          <th>الصورة</th><th>الاسم</th><th>التصنيف</th><th>السعر</th><th>الحالة</th><th>إجراءات</th>
        </tr>
      </thead>
      <tbody>
        ${productsCache.map(p => `
          <tr>
            <td><img src="${p.image || ''}" alt="" onerror="this.style.opacity=0"></td>
            <td>${escapeHTML(p.name)}</td>
            <td>${CATEGORIES[p.category] || ""}</td>
            <td>${(Number(p.price) || 0).toLocaleString("ar")} ر.س</td>
            <td>
              ${p.featured ? `<span class="tag">مختار</span>` : ""}
              ${p.offer ? `<span class="tag tag-offer">عرض</span>` : ""}
            </td>
            <td class="row-actions">
              <button class="btn btn-outline btn-sm" data-edit="${p.id}">تعديل</button>
              <button class="btn btn-danger btn-sm" data-delete="${p.id}">حذف</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  tableWrap.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => startEdit(btn.dataset.edit)));
  tableWrap.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", () => handleDelete(btn.dataset.delete)));
}

function escapeHTML(str = "") {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------------- إضافة / تعديل ---------------- */
function startEdit(id) {
  const p = productsCache.find(x => x.id === id);
  if (!p) return;
  fId.value = p.id;
  fImage.value = p.image || "";
  fName.value = p.name || "";
  fCategory.value = p.category || "beauty";
  fPrice.value = p.price ?? "";
  fOldPrice.value = p.oldPrice ?? "";
  fDesc.value = p.description || "";
  fFeatured.checked = !!p.featured;
  fOffer.checked = !!p.offer;
  imgPreview.innerHTML = p.image ? `<img src="${p.image}" alt="">` : "لا توجد صورة";

  formTitle.textContent = "تعديل المنتج";
  saveBtn.textContent = "حفظ التعديلات";
  cancelEditBtn.style.display = "inline-flex";
  productForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  productForm.reset();
  fId.value = "";
  imgPreview.innerHTML = "لا توجد صورة";
  formTitle.textContent = "إضافة منتج جديد";
  saveBtn.textContent = "حفظ المنتج";
  cancelEditBtn.style.display = "none";
}
cancelEditBtn.addEventListener("click", resetForm);

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (fOffer.checked && !fOldPrice.value) {
    alert("لإظهار المنتج ضمن العروض، الرجاء إدخال السعر قبل الخصم.");
    return;
  }

  const data = {
    name: fName.value.trim(),
    category: fCategory.value,
    price: Number(fPrice.value) || 0,
    oldPrice: fOldPrice.value ? Number(fOldPrice.value) : null,
    description: fDesc.value.trim(),
    image: fImage.value.trim(),
    featured: fFeatured.checked,
    offer: fOffer.checked
  };

  saveBtn.disabled = true;
  saveBtn.textContent = "جارِ الحفظ…";

  try {
    if (fId.value) {
      await updateDoc(doc(db, "products", fId.value), data);
      showToast("تم تحديث المنتج بنجاح");
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, "products"), data);
      showToast("تمت إضافة المنتج بنجاح");
    }
    resetForm();
    loadProducts();
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء الحفظ. تأكدي من تسجيل الدخول وقواعد الأمان في Firestore.");
  } finally {
    saveBtn.disabled = false;
  }
});

async function handleDelete(id) {
  if (!confirm("هل أنتِ متأكدة من حذف هذا المنتج؟")) return;
  try {
    await deleteDoc(doc(db, "products", id));
    showToast("تم حذف المنتج");
    loadProducts();
  } catch (err) {
    console.error(err);
    alert("تعذر حذف المنتج.");
  }
}

/* ---------------- توست ---------------- */
function showToast(message) {
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

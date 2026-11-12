// M.R GAME ZONE storefront data layer (Firebase Realtime Database)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, get, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSZDoy8qcAgGR_qk4vZ5rWGlvID4t8B7Q",
  authDomain: "mr-game-shop-9f914.firebaseapp.com",
  databaseURL: "https://mr-game-shop-9f914-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mr-game-shop-9f914",
  storageBucket: "mr-game-shop-9f914.firebasestorage.app",
  messagingSenderId: "709309210572",
  appId: "1:709309210572:web:02e664a71cee8165874769"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const CART_KEY = "mrGameZoneCart";
let products = {};

const money = value => "৳" + Number(value || 0).toLocaleString("en-BD");
const safe = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; } };
const saveCart = cart => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); };
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = count);
}
function productCard(id, p) {
  return `<article class="product-card">
    <a href="product-details.html?id=${encodeURIComponent(id)}" class="product-visual">${p.image ? `<img src="${safe(p.image)}" alt="${safe(p.name)}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">` : "🎮"}</a>
    <h3>${safe(p.name)}</h3><p>${safe(p.category || "Gaming Gear")}</p>
    <div class="price">${money(p.price)}</div>
    <div class="card-actions"><button class="btn primary" data-add-cart="${safe(id)}">কার্টে যোগ</button><a class="btn secondary" href="product-details.html?id=${encodeURIComponent(id)}">বিস্তারিত</a></div>
  </article>`;
}
function showMessage(target, message) {
  const el = document.querySelector(target);
  if (el) el.innerHTML = `<div class="empty">${safe(message)}</div>`;
}
async function loadProducts() {
  const snapshot = await get(ref(db, "products"));
  products = snapshot.exists() ? snapshot.val() : {};
  return Object.entries(products).filter(([,p]) => p && p.active !== false);
}
function renderProductLists() {
  const entries = Object.entries(products).filter(([,p]) => p && p.active !== false);
  const featured = document.getElementById("featured-products");
  if (featured) featured.innerHTML = entries.slice(0, 4).map(([id,p]) => productCard(id,p)).join("") || '<div class="empty">এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</div>';
  renderAllProducts();
}
function renderAllProducts() {
  const host = document.getElementById("all-products");
  if (!host) return;
  const q = (document.getElementById("search-input")?.value || "").trim().toLowerCase();
  const category = document.getElementById("category-filter")?.value || "all";
  const entries = Object.entries(products).filter(([,p]) => p && p.active !== false)
    .filter(([,p]) => (!q || (p.name+" "+(p.category||"")+" "+(p.description||"")).toLowerCase().includes(q)))
    .filter(([,p]) => category === "all" || (p.category || "").toLowerCase() === category.toLowerCase());
  host.innerHTML = entries.map(([id,p]) => productCard(id,p)).join("") || '<div class="empty">কোনো প্রোডাক্ট পাওয়া যায়নি।</div>';
}
function renderDetail() {
  const host = document.getElementById("product-detail");
  if (!host) return;
  const id = new URLSearchParams(location.search).get("id");
  const p = products[id];
  if (!p || p.active === false) { showMessage("#product-detail", "প্রোডাক্টটি পাওয়া যায়নি।"); return; }
  host.innerHTML = `<div class="detail-layout"><div class="detail-visual">${p.image ? `<img src="${safe(p.image)}" alt="${safe(p.name)}" style="max-width:100%;max-height:300px;object-fit:contain">` : "🎮"}</div><div><span class="eyebrow">${safe(p.category || "GAMING GEAR")}</span><h2>${safe(p.name)}</h2><div class="price">${money(p.price)}</div><p>${safe(p.description || "এই প্রোডাক্ট সম্পর্কে বিস্তারিত জানতে যোগাযোগ করুন।")}</p><p>স্টক: ${Number(p.stock || 0)}</p><button class="btn primary" data-add-cart="${safe(id)}">কার্টে যোগ করুন</button></div></div>`;
}
function renderCart() {
  const host = document.getElementById("cart-content");
  if (!host) return;
  const cart = getCart();
  const rows = cart.map(item => ({...item, product: products[item.id]})).filter(x => x.product && x.product.active !== false);
  if (!rows.length) { host.innerHTML = '<div class="empty">আপনার কার্ট খালি। <a class="text-link" href="products.html">প্রোডাক্ট দেখুন</a></div>'; return; }
  const total = rows.reduce((sum,x) => sum + Number(x.product.price) * x.quantity, 0);
  host.innerHTML = rows.map(x => `<div class="cart-row"><div><b>${safe(x.product.name)}</b><small>${money(x.product.price)} × ${x.quantity}</small></div><div class="qty"><button data-qty="${safe(x.id)}" data-delta="-1">−</button><b>${x.quantity}</b><button data-qty="${safe(x.id)}" data-delta="1">+</button></div><b class="price">${money(Number(x.product.price)*x.quantity)}</b><button class="small-btn danger" data-remove-cart="${safe(x.id)}">বাদ দিন</button></div>`).join("") + `<h3>মোট: <span class="price">${money(total)}</span></h3><a class="btn primary" href="checkout.html">অর্ডার করতে এগিয়ে যান</a>`;
}
function renderCheckout() {
  const host = document.getElementById("checkout-summary");
  if (!host) return;
  const rows = getCart().map(item => ({...item, product: products[item.id]})).filter(x => x.product && x.product.active !== false);
  const total = rows.reduce((sum,x) => sum + Number(x.product.price)*x.quantity, 0);
  host.innerHTML = rows.length ? rows.map(x => `<p>${safe(x.product.name)} × ${x.quantity} — <b>${money(Number(x.product.price)*x.quantity)}</b></p>`).join("") + `<h3>সর্বমোট: ${money(total)}</h3>` : '<p class="empty">কার্ট খালি। আগে প্রোডাক্ট যোগ করুন।</p>';
  const form = document.getElementById("checkout-form");
  if (form) form.querySelector('button[type="submit"]').disabled = !rows.length;
}
document.addEventListener("click", async event => {
  const add = event.target.closest("[data-add-cart]");
  if (add) {
    const id = add.dataset.addCart, cart = getCart(), found = cart.find(x => x.id === id);
    if (found) found.quantity += 1; else cart.push({id, quantity:1});
    saveCart(cart); add.textContent = "যোগ হয়েছে ✓"; setTimeout(() => add.textContent = "কার্টে যোগ", 1200);
  }
  const qty = event.target.closest("[data-qty]");
  if (qty) {
    const cart = getCart(), item = cart.find(x => x.id === qty.dataset.qty);
    if (item) item.quantity = Math.max(0, item.quantity + Number(qty.dataset.delta));
    saveCart(cart.filter(x => x.quantity > 0)); renderCart();
  }
  const remove = event.target.closest("[data-remove-cart]");
  if (remove) { saveCart(getCart().filter(x => x.id !== remove.dataset.removeCart)); renderCart(); }
});
document.getElementById("search-input")?.addEventListener("input", renderAllProducts);
document.getElementById("category-filter")?.addEventListener("change", renderAllProducts);

async function submitOrder(event) {
  event.preventDefault();
  const form = event.currentTarget, button = form.querySelector('button[type="submit"]');
  const cart = getCart();
  const rows = cart.map(item => ({...item, product: products[item.id]})).filter(x => x.product && x.product.active !== false);
  if (!rows.length) { alert("আপনার কার্ট খালি।"); return; }
  const data = new FormData(form);
  const customer = {name:String(data.get("name")||"").trim(), phone:String(data.get("phone")||"").trim(), address:String(data.get("address")||"").trim(), payment:String(data.get("payment")||""), transaction:String(data.get("transaction")||"").trim()};
  if (!customer.name || !customer.phone || !customer.address) { alert("নাম, মোবাইল ও ঠিকানা পূরণ করুন।"); return; }
  const items = rows.map(x => ({productId:x.id, name:x.product.name, price:Number(x.product.price), quantity:x.quantity}));
  const total = items.reduce((sum,x) => sum + x.price*x.quantity, 0);
  button.disabled = true; button.textContent = "অর্ডার পাঠানো হচ্ছে...";
  try {
    const orderRef = push(ref(db, "orders"));
    await set(orderRef, {customer, items, total, status:"Pending", createdAt:Date.now()});
    localStorage.removeItem(CART_KEY); updateCartCount();
    form.outerHTML = '<div class="panel"><h3>অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</h3><p>আপনার অর্ডার নম্বর: <b>' + safe(orderRef.key) + '</b></p><p>আমরা শিগগিরই আপনার সঙ্গে যোগাযোগ করব।</p><a class="btn primary" href="products.html">আরও কেনাকাটা করুন</a></div>';
    const summary = document.getElementById("checkout-summary"); if(summary) summary.innerHTML = "";
  } catch (error) {
    console.error(error); alert("অর্ডার পাঠানো যায়নি। ইন্টারনেট ও Firebase Database Rules পরীক্ষা করুন।");
    button.disabled = false; button.textContent = "অর্ডার কনফার্ম করুন";
  }
}
document.getElementById("checkout-form")?.addEventListener("submit", submitOrder);

export async function initStore() {
  updateCartCount();
  const year = document.getElementById("year"); if(year) year.textContent = new Date().getFullYear();
  try {
    await loadProducts();
    renderProductLists(); renderDetail(); renderCart(); renderCheckout();
    onValue(ref(db,"products"), snapshot => {
      products = snapshot.exists() ? snapshot.val() : {};
      renderProductLists(); renderDetail(); renderCart(); renderCheckout();
    }, error => { console.error(error); showMessage("#all-products","প্রোডাক্ট লোড করা যায়নি।"); });
  } catch (error) {
    console.error(error);
    ["#featured-products","#all-products","#product-detail","#cart-content","#checkout-summary"].forEach(sel => showMessage(sel,"Firebase থেকে তথ্য আনা যায়নি। Database Rules ও সংযোগ পরীক্ষা করুন।"));
  }
}

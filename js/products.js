 import { db, auth } from "./firebase.js";
import { collection, getDocs, getDoc, doc, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── 상품 데이터 (데모용 하드코딩) ──
const demoProducts = [
  { id: "p1", name: "프리미엄 복숭아", price: 45000, spec: "10kg", origin: "충남 예산", stock: 120, minOrder: 2, image: "https://images.unsplash.com/photo-1595124249638-520e77a97f68?w=600&q=80", season: true, soldout: false, desc: "당도 14° 이상의 고당도 프리미엄 복숭아" },
  { id: "p2", name: "고당도 수박", price: 12000, spec: "특 1통", origin: "전남 해남", stock: 85, minOrder: 5, image: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=600&q=80", season: true, soldout: false, desc: "해안 연안의 일교차로 당도가 극대화된 수박" },
  { id: "p3", name: "꿀 참외", price: 28000, spec: "5kg", origin: "경남 밀양", stock: 60, minOrder: 3, image: "https://images.unsplash.com/photo-1593529482509-02f918a0c2ac?w=600&q=80", season: true, soldout: false, desc: "설향 품종, 당도 13° 이상" },
  { id: "p4", name: "천도복숭아", price: 38000, spec: "10kg", origin: "강원 원주", stock: 45, minOrder: 2, image: "https://images.unsplash.com/photo-1595124249638-520e77a97f68?w=600&q=80", season: true, soldout: false, desc: "고랭지 재배로 아삭한 식감" },
  { id: "p5", name: "청포도", price: 55000, spec: "5kg", origin: "충북 제천", stock: 30, minOrder: 3, image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80", season: false, soldout: false, desc: "캠벨릴리, 씨 없음" },
  { id: "p6", name: "자두", price: 32000, spec: "5kg", origin: "전북 임실", stock: 0, minOrder: 2, image: "https://images.unsplash.com/photo-1563746098251-d35aef196e83?w=600&q=80", season: false, soldout: true, desc: "모란 자두, 당도 15°" },
  { id: "p7", name: "살구", price: 25000, spec: "5kg", origin: "경남 밀양", stock: 15, minOrder: 3, image: "https://images.unsplash.com/photo-1593078166039-c9878df5c520?w=600&q=80", season: true, soldout: false, desc: "품질优质的 밀양 살구" },
  { id: "p8", name: "생갈치", price: 0, spec: "-", origin: "-", stock: 0, minOrder: 0, image: "", season: false, soldout: true, desc: "품절 상품" },
];

// ── 카드 HTML 생성 ──
function createProductCard(p) {
  const stockClass = p.soldout || p.stock === 0 ? "out" : "in";
  const stockText = p.soldout ? "품절" : (p.stock > 0 ? `${p.stock}박스` : "재고없음");
  const soldoutBadge = p.soldout ? `<span class="soldout-badge">SOLD OUT</span>` : "";
  const priceText = p.soldout ? "가격문의" : `${p.price.toLocaleString()}원`;

  return `
    <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'">
      <img src="${p.image}" alt="${p.name}">
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="spec">${p.spec} · ${p.origin}</p>
        <p class="price">${priceText}</p>
        <p class="stock ${stockClass}">${stockText}</p>
        ${soldoutBadge}
      </div>
    </div>
  `;
}

// ── 메인 페이지 상품 로드 ──
function loadMainProducts() {
  const grid = document.getElementById("mainProductGrid");
  if (!grid) return;
  const available = demoProducts.filter(p => !p.soldout);
  grid.innerHTML = available.map(createProductCard).join("");
}

// ── 상품 목록 페이지 ──
function loadProducts() {
  const grid = document.getElementById("productListGrid");
  if (!grid) return;

  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get("tab") || "all";

  let filtered = demoProducts;
  if (tab === "season") filtered = demoProducts.filter(p => p.season);
  if (tab === "soldout") filtered = demoProducts.filter(p => p.soldout);

  grid.innerHTML = filtered.map(createProductCard).join("");

  // 필터 탭 active
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
}

// ── 상품 상세페이지 ──
function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const product = demoProducts.find(p => p.id === id);
  if (!product) return;

  document.getElementById("detailImage").src = product.image;
  document.getElementById("detailTitle").textContent = product.name;
  document.getElementById("detailDesc").textContent = product.desc;
  document.getElementById("detailSpec").textContent = product.spec;
  document.getElementById("detailOrigin").textContent = product.origin;
  document.getElementById("detailStock").textContent = product.soldout ? "품절" : `${product.stock}박스`;
  document.getElementById("detailMinOrder").textContent = `${product.minOrder}박스`;
  document.getElementById("detailPrice").textContent = product.soldout ? "가격문의" : `${product.price.toLocaleString()}원`;
  document.getElementById("detailPrice").dataset.price = product.price;
  document.getElementById("orderQty").min = product.minOrder;
  document.getElementById("orderQty").value = product.minOrder;
  document.getElementById("minOrderDisplay").textContent = product.minOrder;

  updateTotal();

  // 관련 상품
  const related = document.getElementById("relatedGrid");
  if (related) {
    const others = demoProducts.filter(p => p.id !== id && !p.soldout).slice(0, 3);
    related.innerHTML = others.map(createProductCard).join("");
  }

  // 가격 숨김 처리 (사업자만)
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.data()?.role === "approved") {
        // 가격 표시 유지
      }
    } else {
      // 비회원은 가격 숨김
      document.querySelectorAll(".product-card .price").forEach(el => {
        if (el.textContent.includes("원")) {
          el.textContent = "******";
        }
      });
    }
  });
}

// ── 사업자 가격표 ──
function loadBizPriceTable() {
  const tbody = document.getElementById("bizPriceTable");
  if (!tbody) return;

  tbody.innerHTML = demoProducts.map(p => `
    <div class="price-row">
      <span>${p.name}</span>
      <span>${p.spec}</span>
      <span>${p.price.toLocaleString()}원</span>
      <span>${p.soldout ? "품절" : p.stock + "박스"}</span>
      <span>${p.minOrder}박스~</span>
    </div>
  `).join("");
}

// ── 초기화 ──
loadMainProducts();
loadProducts();
loadProductDetail();
loadBizPriceTable();
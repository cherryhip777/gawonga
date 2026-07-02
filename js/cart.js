function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("#cartCount").forEach(el => {
    el.textContent = count > 0 ? count : "0";
  });
}

function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cartList");
  const emptyEl = document.getElementById("cartEmpty");
  const summaryEl = document.querySelector(".cart-layout");

  if (cart.length === 0) {
    if (container) container.style.display = "none";
    if (summaryEl) summaryEl.style.display = "none";
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }

  if (container) {
    container.style.display = "flex";
    container.innerHTML = cart.map(item => {
      const product = getProductById(item.id);
      if (!product) return "";
      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}">
          <div class="cart-item-info">
            <h3>${product.name}</h3>
            <p>${product.spec} · ${product.origin}</p>
            <div class="cart-item-bottom">
              <span class="cart-item-price">${(product.price * item.qty).toLocaleString()}원</span>
              <span class="cart-remove" onclick="removeFromCart('${item.id}')">삭제</span>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  let totalItems = 0;
  let totalBoxes = 0;
  let totalPrice = 0;
  cart.forEach(item => {
    const p = getProductById(item.id);
    if (p) {
      totalItems++;
      totalBoxes += item.qty;
      totalPrice += p.price * item.qty;
    }
  });

  const el = id => document.getElementById(id);
  if (el("totalItems")) el("totalItems").textContent = totalItems + "종";
  if (el("totalBoxes")) el("totalBoxes").textContent = totalBoxes + "박스";
  if (el("cartTotal")) el("cartTotal").textContent = totalPrice.toLocaleString() + "원";
}

function getProductById(id) {
  const products = [
    { id: "p1", name: "프리미엄 복숭아", price: 45000, spec: "10kg", origin: "충남 예산", image: "https://images.unsplash.com/photo-1595124249638-520e77a97f68?w=600&q=80" },
    { id: "p2", name: "고당도 수박", price: 12000, spec: "특 1통", origin: "전남 해남", image: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=600&q=80" },
    { id: "p3", name: "꿀 참외", price: 28000, spec: "5kg", origin: "경남 밀양", image: "https://images.unsplash.com/photo-1593529482509-02f918a0c2ac?w=600&q=80" },
    { id: "p4", name: "천도복숭아", price: 38000, spec: "10kg", origin: "강원 원주", image: "https://images.unsplash.com/photo-1595124249638-520e77a97f68?w=600&q=80" },
    { id: "p5", name: "청포도", price: 55000, spec: "5kg", origin: "충북 제천", image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80" },
    { id: "p6", name: "자두", price: 32000, spec: "5kg", origin: "전북 임실", image: "https://images.unsplash.com/photo-1563746098251-d35aef196e83?w=600&q=80" },
    { id: "p7", name: "살구", price: 25000, spec: "5kg", origin: "경남 밀양", image: "https://images.unsplash.com/photo-1593078166039-c9878df5c520?w=600&q=80" },
  ];
  return products.find(p => p.id === id);
}

window.removeFromCart = (id) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
};

window.checkout = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return alert("장바구니가 비어있습니다.");
  alert("주문이 완료되었습니다! 관리자 확인 후 처리됩니다.");
  localStorage.removeItem("cart");
  location.href = "index.html";
};

updateCartCount();
loadCart();
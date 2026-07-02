 // ── Apple식 스크롤 등장 애니메이션 ──
const observerOptions = {
  threshold: 0.12,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".reveal").forEach(el => {
  observer.observe(el);
});

// ── 헤더 스크롤 효과 ──
let lastScroll = 0;
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    header.style.boxShadow = "0 2px 20px rgba(0,0,0,0.08)";
  } else {
    header.style.boxShadow = "none";
  }

  lastScroll = currentScroll;
});

// ── 카운트 업데이트 ──
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("#cartCount").forEach(el => {
    el.textContent = count > 0 ? count : "0";
  });
}

updateCartCount();

// ── 필터 탭 ──
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    location.href = `products.html?tab=${tab}`;
  });
});


document.addEventListener("DOMContentLoaded", () => {

  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  const isBizApproved = localStorage.getItem("bizApproved") === "true";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // ✅ 비회원
  if (!isLoggedIn) {
    authArea.innerHTML = `
      <a href="login.html" class="login-btn">로그인</a>
      <a href="business.html" class="biz-btn">사업자 전용</a>
      <a href="cart.html" class="cart-icon">🛒</a>
    `;
  }

  // ✅ 로그인했지만 승인 안 된 회원
  if (isLoggedIn && !isBizApproved) {
    authArea.innerHTML = `
      <a href="business.html" class="login-btn">마이페이지</a>
      <a href="business.html" class="biz-btn">사업자 전용</a>
      <a href="#" onclick="logout()" class="login-btn">로그아웃</a>
      <a href="cart.html" class="cart-icon">🛒</a>
    `;
  }

  // ✅ 승인된 사업자
  if (isBizApproved) {
    authArea.innerHTML = `
      <a href="business.html" class="biz-btn">사업자 페이지</a>
      <a href="#" onclick="logout()" class="login-btn">로그아웃</a>
      <a href="cart.html" class="cart-icon">🛒</a>
    `;
  }

});

function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("bizApproved");
  location.href = "index.html";
}


document.addEventListener("DOMContentLoaded", () => {

  const slides = document.querySelectorAll(".gallery-slide");
  const thumbs = document.querySelectorAll(".thumb");
  const next = document.querySelector(".gallery-next");
  const prev = document.querySelector(".gallery-prev");

  if (!slides.length) return;

  let current = 0;

  const showSlide = (index) => {
    slides.forEach(s => s.classList.remove("active"));
    thumbs.forEach(t => t.classList.remove("active"));
    slides[index].classList.add("active");
    thumbs[index].classList.add("active");
  };

  next.addEventListener("click", () => {
    current = (current + 1) % slides.length;
    showSlide(current);
  });

  prev.addEventListener("click", () => {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  });

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => {
      current = i;
      showSlide(current);
    });
  });

  /* ✅ 모바일 터치 스와이프 */
  let startX = 0;

  document.querySelector(".product-gallery").addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  document.querySelector(".product-gallery").addEventListener("touchend", e => {
    let endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) {
      current = (current + 1) % slides.length;
    } else if (endX - startX > 50) {
      current = (current - 1 + slides.length) % slides.length;
    }
    showSlide(current);
  });

});

 
 


/* ✅ 햄버거 메뉴 */
const toggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav-links");
const overlay = document.getElementById("menuOverlay");

if (toggle) {

  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    nav.classList.remove("active");
    overlay.classList.remove("active");
  });

}

/* ✅ 맨 위로 버튼 */
const scrollBtn = document.createElement("button");
scrollBtn.id = "scrollTopBtn";
scrollBtn.innerHTML = "↑";
document.body.appendChild(scrollBtn);

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


 
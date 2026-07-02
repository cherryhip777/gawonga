import { db, storage } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, getDoc }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ── 탭 전환 ──
window.showSection = (section) => {
  document.querySelectorAll(".admin-section").forEach(s => s.classList.remove("active"));
  document.getElementById("section-" + section).classList.add("active");
  document.querySelectorAll(".admin-sidebar a").forEach(a => a.classList.remove("active"));
  event.target.classList.add("active");
};

// ── 회원 목록 로드 ──
async function loadUsers() {
  const pending = document.getElementById("pendingUserList");
  const approved = document.getElementById("approvedUserList");

  const snapshot = await getDocs(collection(db, "users"));

  let pendingHTML = "";
  let approvedHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const itemHTML = `
      <div class="admin-user-item">
        <div class="user-info">
          <h4>${data.company}</h4>
          <p>${data.name} · ${data.email} · ${data.phone || "-"}</p>
        </div>
        <div class="admin-user-actions">
          ${data.role === "pending"
            ? `<button class="btn-approve" onclick="approveUser('${docSnap.id}')">승인</button>`
            : `<button class="btn-revoke" onclick="revokeUser('${docSnap.id}')">승인취소</button>`
          }
        </div>
      </div>
    `;

    if (data.role === "pending") {
      pendingHTML += itemHTML;
    } else {
      approvedHTML += itemHTML;
    }
  });

  if (pending) pending.innerHTML = pendingHTML || '<p class="empty-text">대기 중인 회원이 없습니다.</p>';
  if (approved) approved.innerHTML = approvedHTML || '<p class="empty-text">승인된 회원이 없습니다.</p>';
}

window.approveUser = async (id) => {
  await updateDoc(doc(db, "users", id), { role: "approved" });
  alert("승인 완료!");
  loadUsers();
};

window.revokeUser = async (id) => {
  await updateDoc(doc(db, "users", id), { role: "pending" });
  alert("승인 취소 완료!");
  loadUsers();
};

// ── 상품 추가 ──
window.addProduct = async () => {
  const name = document.getElementById("pName").value;
  const price = document.getElementById("pPrice").value;
  const spec = document.getElementById("pSpec").value;
  const origin = document.getElementById("pOrigin").value;
  const stock = document.getElementById("pStock").value;
  const minOrder = document.getElementById("pMinOrder").value;
  const desc = document.getElementById("pDesc").value;
  const category = document.getElementById("pCategory").value;
  const soldout = document.getElementById("pSoldout").checked;
  const file = document.getElementById("pImage").files[0];

  if (!name || !price) {
    alert("상품명과 가격을 입력해주세요.");
    return;
  }

  let imageURL = "";
  if (file) {
    const storageRef = ref(storage, "products/" + file.name);
    await uploadBytes(storageRef, file);
    imageURL = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "products"), {
    name, price: Number(price), spec, origin,
    stock: Number(stock), minOrder: Number(minOrder),
    description: desc, category, soldout,
    image: imageURL, createdAt: new Date()
  });

  alert("상품 등록 완료!");
  location.reload();
};

// ── 상품 목록 ──
async function loadAdminProducts() {
  const list = document.getElementById("adminProductList");
  if (!list) return;

  const snapshot = await getDocs(collection(db, "products"));

  if (snapshot.empty) {
    list.innerHTML = '<p class="empty-text">등록된 상품이 없습니다.</p>';
    return;
  }

  list.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "admin-product-item";
    div.innerHTML = `
      <div class="user-info">
        <h4>${data.name}</h4>
        <p>${data.spec} · ${data.price?.toLocaleString() || 0}원 · 재고 ${data.stock || 0}박스</p>
      </div>
      <div class="admin-user-actions">
        <button class="btn-edit-sm" onclick="editProduct('${docSnap.id}')">수정</button>
        <button class="btn-delete-sm" onclick="deleteProduct('${docSnap.id}')">삭제</button>
      </div>
    `;
    list.appendChild(div);
  });
}

window.deleteProduct = async (id) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  await deleteDoc(doc(db, "products", id));
  alert("삭제 완료");
  loadAdminProducts();
};

window.editProduct = async (id) => {
  const newName = prompt("새 상품명:");
  const newPrice = prompt("새 가격:");
  if (newName) await updateDoc(doc(db, "products", id), { name: newName });
  if (newPrice) await updateDoc(doc(db, "products", id), { price: Number(newPrice) });
  alert("수정 완료");
  loadAdminProducts();
};

// ── 주문 목록 ──
async function loadOrders() {
  const list = document.getElementById("orderList");
  if (!list) return;
  list.innerHTML = '<p class="empty-text">주문 내역이 없습니다. (주문 시스템 연동 필요)</p>';
}

// ── 초기화 ──
loadUsers();
loadAdminProducts();
loadOrders();
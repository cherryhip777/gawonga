import { db } from "./firebase.js";
import { 
  collection, addDoc, getDocs, deleteDoc, 
  updateDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { getStorage, ref, uploadBytes, getDownloadURL } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const storage = getStorage();

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const descInput = document.getElementById("description");
const fileInput = document.getElementById("imageFile");
const seasonInput = document.getElementById("season");
const soldoutInput = document.getElementById("soldout");

document.getElementById("addProduct").addEventListener("click", async () => {

  const file = fileInput.files[0];
  const storageRef = ref(storage, "products/" + file.name);

  await uploadBytes(storageRef, file);
  const imageURL = await getDownloadURL(storageRef);

  await addDoc(collection(db, "products"), {
    name: nameInput.value,
    price: Number(priceInput.value),
    description: descInput.value,
    image: imageURL,
    season: seasonInput.checked,
    soldout: soldoutInput.checked,
    createdAt: new Date()
  });

  alert("상품 등록 완료");
  location.reload();
});

async function loadProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  const container = document.getElementById("productList");

  snapshot.forEach((item) => {
    const data = item.data();

    const card = document.createElement("div");
    card.className = "glass-card";

    card.innerHTML = `
      <img src="${data.image}" class="admin-thumb">
      <h3>${data.name}</h3>
      <p>${data.price.toLocaleString()}원</p>
      <button onclick="editProduct('${item.id}', '${data.name}', ${data.price})">수정</button>
      <button onclick="deleteProduct('${item.id}')">삭제</button>
    `;

    container.appendChild(card);
  });
}

window.deleteProduct = async (id) => {
  await deleteDoc(doc(db, "products", id));
  alert("삭제 완료");
  location.reload();
};

window.editProduct = async (id, name, price) => {
  const newName = prompt("상품명 수정", name);
  const newPrice = prompt("가격 수정", price);

  await updateDoc(doc(db, "products", id), {
    name: newName,
    price: Number(newPrice)
  });

  alert("수정 완료");
  location.reload();
};

loadProducts();
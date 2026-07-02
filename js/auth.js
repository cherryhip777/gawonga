import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, getDoc, collection, getDocs, updateDoc }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── 회원가입 ──
window.register = async () => {
  const company = document.getElementById("company").value;
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!company || !email || !password) {
    alert("필수 항목을 입력해주세요.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), {
      company, name, phone, email,
      role: "pending",
      createdAt: new Date()
    });
    alert("가입 완료! 관리자 승인 후 이용 가능합니다.");
    location.href = "login.html";
  } catch (e) {
    alert("가입 실패: " + e.message);
  }
};

// ── 로그인 ──
window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const role = userDoc.data().role;

    if (role === "pending") {
      alert("아직 관리자 승인이 완료되지 않았습니다.");
      await signOut(auth);
      return;
    }

    sessionStorage.setItem("userUid", userCredential.user.uid);
    sessionStorage.setItem("userRole", role);
    alert("로그인 완료!");
    location.href = "business.html";
  } catch (e) {
    alert("로그인 실패: " + e.message);
  }
};

// ── 로그아웃 ──
window.logout = async () => {
  await signOut(auth);
  sessionStorage.removeItem("userUid");
  sessionStorage.removeItem("userRole");
  location.href = "index.html";
};

// ── 현재 로그인 상태 감시 (사업자 페이지용) ──
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      document.getElementById("bizUserInfo").textContent = `${data.company} · ${data.name}님`;
      document.getElementById("accCompany").textContent = data.company;
      document.getElementById("accName").textContent = data.name;
      document.getElementById("accEmail").textContent = data.email;

      const gradeEl = document.getElementById("accGrade");
      if (data.role === "approved") {
        gradeEl.textContent = "승인완료";
        gradeEl.className = "grade-badge";
        document.getElementById("bizContent").style.display = "grid";
      } else {
        gradeEl.textContent = "승인대기";
        gradeEl.className = "grade-badge pending";
      }
    }
  }
});
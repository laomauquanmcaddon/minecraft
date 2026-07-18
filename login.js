import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUXJQP0mBLsXF6Dv3TvdlVoINBHoLw0rk",
  authDomain: "minecraft-free-community.firebaseapp.com",
  projectId: "minecraft-free-community",
  storageBucket: "minecraft-free-community.firebasestorage.app",
  messagingSenderId: "603547178802",
  appId: "1:603547178802:web:41dc99449d0c9b918c692b",
  measurementId: "G-6B8MH0LB8C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const btnLogin = document.getElementById('btnLogin');
    const btnRegister = document.getElementById('btnRegister');

    if (btnLogin) {
        btnLogin.addEventListener("click", (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) return alert("⚠️ Vui lòng điền đầy đủ tài khoản và mật khẩu!");

            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    alert("🎉 Đăng nhập thành công!");
                    window.location.href = "index.html";
                })
                .catch((error) => {
                    alert("❌ Sai tài khoản hoặc mật khẩu!");
                });
        });
    }

    if (btnRegister) {
        btnRegister.addEventListener("click", (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) return alert("⚠️ Vui lòng nhập thông tin đăng ký!");
            if (password.length < 6) return alert("⚠️ Mật khẩu phải từ 6 ký tự trở lên!");

            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    alert("✅ Đăng ký thành công và đã tự động đăng nhập!");
                    window.location.href = "index.html";
                })
                .catch((error) => {
                    if (error.code === "auth/email-already-in-use") {
                        alert("❌ Email này đã được đăng ký rồi!");
                    } else {
                        alert("❌ Lỗi: " + error.message);
                    }
                });
        });
    }
});
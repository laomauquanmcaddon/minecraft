import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Cấu hình Firebase chính xác 100% bằng text bạn vừa copy
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
    // --- PHẦN TỬ TRÊN TRANG LOGIN.HTML ---
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const btnSignIn = document.getElementById('btnSignIn');
    const btnSignUp = document.getElementById('btnSignUp');
    const btnSignOut = document.getElementById('btnSignOut');
    const authContainer = document.getElementById('authContainer');
    const userInfoContainer = document.getElementById('userInfoContainer');
    const userEmailTxt = document.getElementById('userEmailTxt');

    // --- PHẦN TỬ TRÊN TRANG CHỦ INDEX.HTML ---
    const userHomeBtn = document.getElementById('userHomeBtn');
    const defaultUserIcon = document.getElementById('defaultUserIcon');
    const userAvatar = document.getElementById('userAvatar');
    const accountDropdown = document.getElementById('accountDropdown');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const btnDropdownSignOut = document.getElementById('btnDropdownSignOut');

    let isLoggedIn = false;

    // Hàm thông báo Toast nhảy lên giữa màn hình
    const notify = (message) => {
        const toast = document.getElementById('customToast');
        if (toast) {
            toast.innerHTML = message;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 3000);
        } else {
            alert(message);
        }
    };

    // THEO DÕI TRẠNG THÁI ĐĂNG NHẬP
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isLoggedIn = true;

            if (authContainer) authContainer.style.display = 'none';
            if (userInfoContainer) userInfoContainer.style.display = 'block';
            if (userEmailTxt) userEmailTxt.innerHTML = `🎉 Đăng nhập thành công!<br><strong style="color:#ffb6c1;">${user.email}</strong>`;
            
            if (userAvatar && defaultUserIcon) {
                const finalAvatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=ffb6c1&color=000000&bold=true&rounded=true`;
                userAvatar.src = finalAvatarUrl;
                userAvatar.style.display = 'block';
                defaultUserIcon.style.display = 'none';
            }
            if (dropdownEmail) {
                dropdownEmail.innerText = user.email;
            }
        } else {
            isLoggedIn = false;

            if (authContainer) authContainer.style.display = 'block';
            if (userInfoContainer) userInfoContainer.style.display = 'none';

            if (userAvatar && defaultUserIcon) {
                userAvatar.style.display = 'none';
                defaultUserIcon.style.display = 'block';
            }
            if (accountDropdown) {
                accountDropdown.style.display = 'none';
            }
        }
    });

    // --- LOGIC TRÊN INDEX.HTML ---
    if (userHomeBtn) {
        userHomeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isLoggedIn) {
                window.location.href = "login.html";
            } else {
                if (accountDropdown) {
                    const isHidden = accountDropdown.style.display === 'none';
                    accountDropdown.style.display = isHidden ? 'block' : 'none';
                }
            }
        });
    }

    document.addEventListener('click', () => {
        if (accountDropdown) accountDropdown.style.display = 'none';
    });

    if (btnDropdownSignOut) {
        btnDropdownSignOut.addEventListener('click', () => {
            signOut(auth).then(() => { notify("🔒 Đã đăng xuất!"); });
        });
    }

    // --- LOGIC TRÊN LOGIN.HTML ---
    if (btnSignUp) {
        btnSignUp.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            if (!email || !password) return notify("⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu!");
            if (password.length < 6) return notify("⚠️ Mật khẩu cần từ 6 ký tự trở lên!");

            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    notify("🎉 Tạo tài khoản thành công!");
                    emailInput.value = ""; passwordInput.value = "";
                })
                .catch((error) => {
                    if (error.code === 'auth/email-already-in-use') {
                        notify("❌ Email này đã được đăng ký trước đó rồi!");
                    } else if (error.code === 'auth/invalid-email') {
                        notify("❌ Định dạng Email không hợp lệ!");
                    } else {
                        notify("❌ Lỗi: " + error.message);
                    }
                });
        });
    }

    if (btnSignIn) {
        btnSignIn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) return notify("⚠️ Vui lòng nhập cả Email và Mật khẩu!");

            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    notify("✅ Đăng nhập thành công! Đang quay về trang chủ...");
                    setTimeout(() => { window.location.href = "index.html"; }, 1000);
                })
                .catch(() => {
                    notify("❌ Tài khoản hoặc mật khẩu không chính xác!");
                });
        });
    }

    if (btnSignOut) {
        btnSignOut.addEventListener('click', () => {
            signOut(auth).then(() => { notify("🔒 Đã đăng xuất an toàn!"); });
        });
    }
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Cấu hình dự án Firebase của bạn
const firebaseConfig = {
    apiKey: "AIzaSyBlXJQP0mBLcXF6Dv3TvdlyoDN8MoLmN0k",
    authDomain: "minecraft-free-community.firebaseapp.com",
    projectId: "minecraft-free-community",
    storageBucket: "minecraft-free-community.appspot.com",
    messagingSenderId: "603547178802",
    appId: "1:603547178802:web:43dc994d9fec9b918cb42b",
    measurementId: "G-G5BMH0LEBC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    // Các phần tử trên trang Đăng nhập (login.html)
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const btnSignIn = document.getElementById('btnSignIn');
    const btnSignUp = document.getElementById('btnSignUp');
    const btnSignOut = document.getElementById('btnSignOut');

    // Các phần tử trên Trang Chủ (index.html)
    const userHomeBtn = document.getElementById('userHomeBtn');
    const defaultUserIcon = document.getElementById('defaultUserIcon');
    const userAvatar = document.getElementById('userAvatar');
    const accountDropdown = document.getElementById('accountDropdown');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const btnDropdownSignOut = document.getElementById('btnDropdownSignOut');

    let isLoggedIn = false;

    // Hàm thông báo Toast thông tin
    const notify = (message) => {
        const toast = document.getElementById('customToast');
        if (toast) {
            toast.innerHTML = message;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 2500);
        } else {
            alert(message);
        }
    };

    // Lắng nghe trạng thái đăng nhập từ máy chủ Firebase
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isLoggedIn = true;

            // Xử lý giao diện trang login.html nếu đang ở đây
            const authContainer = document.getElementById('authContainer');
            const userInfoContainer = document.getElementById('userInfoContainer');
            const userEmailTxt = document.getElementById('userEmailTxt');
            if (authContainer) authContainer.style.display = 'none';
            if (userInfoContainer) userInfoContainer.style.display = 'block';
            if (userEmailTxt) userEmailTxt.innerHTML = `🎉 Chào mừng quay trở lại!<br><strong style="color:#ffb6c1;">${user.email}</strong>`;
            
            // --- THU THẬP VÀ XỬ LÝ AVATAR TÀI KHOẢN ---
            if (userAvatar && defaultUserIcon) {
                let finalAvatarUrl = "";

                if (user.photoURL) {
                    // 1. Nếu đăng nhập Google/Gmail và có avatar gốc, lấy luôn ảnh đó
                    finalAvatarUrl = user.photoURL;
                } else {
                    // 2. Nếu đăng ký thường bằng Email, tự tạo avatar theo chữ cái đầu (Nền hồng chữ đen cực đẹp)
                    const firstLetter = user.email.charAt(0).toUpperCase();
                    finalAvatarUrl = `https://ui-avatars.com/api/?name=${firstLetter}&background=ffb6c1&color=000000&bold=true&rounded=true`;
                }

                userAvatar.src = finalAvatarUrl;
                userAvatar.style.display = 'block';
                defaultUserIcon.style.display = 'none';
            }

            if (dropdownEmail) {
                dropdownEmail.innerText = user.email;
            }
        } else {
            isLoggedIn = false;

            // Đưa giao diện trang login.html về trạng thái chưa đăng nhập
            const authContainer = document.getElementById('authContainer');
            const userInfoContainer = document.getElementById('userInfoContainer');
            if (authContainer) authContainer.style.display = 'block';
            if (userInfoContainer) userInfoContainer.style.display = 'none';

            // Reset nút Avatar ở trang chủ về icon mặc định
            if (userAvatar && defaultUserIcon) {
                userAvatar.style.display = 'none';
                defaultUserIcon.style.display = 'block';
            }
            if (accountDropdown) {
                accountDropdown.style.display = 'none';
            }
        }
    });

    // Sự kiện nhấn vào nút tròn Avatar ở Trang Chủ
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

    // Click ra ngoài để đóng menu Setting dropdown
    document.addEventListener('click', () => {
        if (accountDropdown) accountDropdown.style.display = 'none';
    });

    // Nút đăng xuất nhanh ở Trang Chủ
    if (btnDropdownSignOut) {
        btnDropdownSignOut.addEventListener('click', () => {
            signOut(auth).then(() => { alert("🔒 Bạn đã đăng xuất thành công!"); });
        });
    }

    // Xử lý sự kiện trang đăng nhập (login.html)
    if (btnSignUp) {
        btnSignUp.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) return notify("⚠️ Vui lòng điền đủ Email và Mật khẩu!");
            if (password.length < 6) return notify("⚠️ Mật khẩu cần dài từ 6 ký tự trở lên!");
            
            createUserWithEmailAndPassword(auth, email, password)
                .then(() => { 
                    notify("🎉 Tạo tài khoản thành công!");
                    emailInput.value = ""; passwordInput.value = "";
                })
                .catch(() => { notify("❌ Lỗi: Tài khoản đã tồn tại hoặc điền sai!"); });
        });
    }

    if (btnSignIn) {
        btnSignIn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) return notify("⚠️ Vui lòng điền đủ Email và Mật khẩu!");

            signInWithEmailAndPassword(auth, email, password)
                .then(() => { 
                    notify("✅ Đăng nhập thành công!");
                    emailInput.value = ""; passwordInput.value = "";
                })
                .catch(() => { notify("❌ Sai tài khoản hoặc mật khẩu!"); });
        });
    }

    if (btnSignOut) {
        btnSignOut.addEventListener('click', () => {
            signOut(auth).then(() => { notify("🔒 Đã đăng xuất!"); });
        });
    }
});
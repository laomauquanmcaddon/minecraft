import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Cấu hình kết nối Firebase chính xác của bạn
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
    // --- LẤY PHẦN TỬ GIAO DIỆN TRÊN TRANG LOGIN.HTML ---
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const btnSignIn = document.getElementById('btnSignIn');
    const btnSignUp = document.getElementById('btnSignUp');
    const btnSignOut = document.getElementById('btnSignOut');
    const authContainer = document.getElementById('authContainer');
    const userInfoContainer = document.getElementById('userInfoContainer');
    const userEmailTxt = document.getElementById('userEmailTxt');

    // --- LẤY PHẦN TỬ GIAO DIỆN TRÊN TRANG CHỦ INDEX.HTML ---
    const userHomeBtn = document.getElementById('userHomeBtn');
    const defaultUserIcon = document.getElementById('defaultUserIcon');
    const userAvatar = document.getElementById('userAvatar');
    const accountDropdown = document.getElementById('accountDropdown');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const btnDropdownSignOut = document.getElementById('btnDropdownSignOut');

    let isLoggedIn = false;

    // Hàm hiển thị thông báo nhanh (Toast) trực quan
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

    // THEO DÕI TRẠNG THÁI ĐĂNG NHẬP LIÊN TỤC TỪ FIREBASE
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isLoggedIn = true;

            // 1. Nếu đang ở trang login.html: Ẩn khung nhập, hiện thông báo chào mừng
            if (authContainer) authContainer.style.display = 'none';
            if (userInfoContainer) userInfoContainer.style.display = 'block';
            if (userEmailTxt) userEmailTxt.innerHTML = `🎉 Đăng nhập thành công!<br><strong style="color:#ffb6c1;">${user.email}</strong>`;
            
            // 2. Nếu đang ở trang index.html: Hiển thị avatar Gmail (hoặc tạo tự động theo tên)
            if (userAvatar && defaultUserIcon) {
                // Tự động lấy ảnh avatar từ Gmail, nếu đăng ký thường thì tạo ảnh chữ cái nền Hồng chữ Đen cực chất
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

            // 1. Trả trang login.html về trạng thái form nhập liệu ban đầu
            if (authContainer) authContainer.style.display = 'block';
            if (userInfoContainer) userInfoContainer.style.display = 'none';

            // 2. Trả nút Avatar ở trang chủ về icon hình người mặc định ban đầu
            if (userAvatar && defaultUserIcon) {
                userAvatar.style.display = 'none';
                defaultUserIcon.style.display = 'block';
            }
            if (accountDropdown) {
                accountDropdown.style.display = 'none';
            }
        }
    });

    // --- SỰ KIỆN XỬ LÝ TRÊN TRANG CHỦ (INDEX.HTML) ---
    if (userHomeBtn) {
        userHomeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isLoggedIn) {
                // Chưa đăng nhập -> Nhảy sang trang đăng ký
                window.location.href = "login.html";
            } else {
                // Đã đăng nhập -> Bật tắt menu cài đặt nhanh
                if (accountDropdown) {
                    const isHidden = accountDropdown.style.display === 'none';
                    accountDropdown.style.display = isHidden ? 'block' : 'none';
                }
            }
        });
    }

    // Nhấp chuột ra ngoài màn hình để ẩn hộp menu Setting
    document.addEventListener('click', () => {
        if (accountDropdown) accountDropdown.style.display = 'none';
    });

    // Nút đăng xuất nhanh tích hợp trong Menu trang chủ
    if (btnDropdownSignOut) {
        btnDropdownSignOut.addEventListener('click', () => {
            signOut(auth).then(() => { notify("🔒 Đã đăng xuất tài khoản!"); });
        });
    }

    // --- SỰ KIỆN XỬ LÝ TRÊN TRANG ĐĂNG NHẬP (LOGIN.HTML) ---
    if (btnSignUp) {
        btnSignUp.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            if (!email || !password) return notify("⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu!");
            if (password.length < 6) return notify("⚠️ Bảo mật bắt buộc: Mật khẩu phải từ 6 ký tự trở lên!");

            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    notify("🎉 Chúc mừng bạn đã đăng ký tài khoản thành công!");
                    emailInput.value = ""; passwordInput.value = "";
                })
                .catch((error) => {
                    if (error.code === 'auth/email-already-in-use') {
                        notify("❌ Email này đã được đăng ký trước đó rồi!");
                    } else if (error.code === 'auth/invalid-email') {
                        notify("❌ Định dạng Email không hợp lệ (ví dụ đúng: nick@gmail.com)!");
                    } else {
                        notify("❌ Lỗi đăng ký: " + error.message);
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
                    notify("✅ Đăng nhập thành công! Đang chuyển hướng về trang chủ...");
                    setTimeout(() => { window.location.href = "index.html"; }, 1200);
                })
                .catch((error) => {
                    notify("❌ Thông tin tài khoản hoặc mật khẩu không chính xác!");
                });
        });
    }

    if (btnSignOut) {
        btnSignOut.addEventListener('click', () => {
            signOut(auth).then(() => { notify("🔒 Đã đăng xuất an toàn!"); });
        });
    }
});
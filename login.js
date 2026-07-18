import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

    const changePasswordArea = document.getElementById('changePasswordArea');
    const txtNewPassword = document.getElementById('txtNewPassword');
    const txtConfirmPassword = document.getElementById('txtConfirmPassword');
    const btnConfirmChangePwd = document.getElementById('btnConfirmChangePwd');

    let currentUser = null;

    // Hàm hiển thị thông báo Toast đẹp mắt thay cho alert()
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

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            if (changePasswordArea) changePasswordArea.style.display = "block";
        } else {
            currentUser = null;
            if (changePasswordArea) changePasswordArea.style.display = "none";
        }
    });

    if (btnLogin) {
        btnLogin.addEventListener("click", (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) return notify("⚠️ Vui lòng điền đầy đủ tài khoản và mật khẩu!");

            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    notify("🎉 Đăng nhập thành công!");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1000);
                })
                .catch((error) => {
                    notify("❌ Sai tài khoản hoặc mật khẩu!");
                });
        });
    }

    if (btnRegister) {
        btnRegister.addEventListener("click", (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) return notify("⚠️ Vui lòng nhập thông tin đăng ký!");
            if (password.length < 6) return notify("⚠️ Mật khẩu phải từ 6 ký tự trở lên!");

            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    notify("✅ Đăng ký thành công và đã tự động đăng nhập!");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1500);
                })
                .catch((error) => {
                    if (error.code === "auth/email-already-in-use") {
                        notify("❌ Email này đã được đăng ký rồi!");
                    } else {
                        notify("❌ Lỗi: " + error.message);
                    }
                });
        });
    }

    if (btnConfirmChangePwd) {
        btnConfirmChangePwd.addEventListener("click", (e) => {
            e.preventDefault();
            if (!currentUser) return notify("⚠️ Bạn phải đang đăng nhập để thực hiện đổi mật khẩu!");

            const newPwd = txtNewPassword.value.trim();
            const confirmPwd = txtConfirmPassword.value.trim();

            if (!newPwd || !confirmPwd) return notify("⚠️ Vui lòng nhập đầy đủ cả 2 lần mật khẩu mới!");
            if (newPwd.length < 6) return notify("⚠️ Mật khẩu mới phải từ 6 ký tự trở lên!");
            if (newPwd !== confirmPwd) return notify("❌ Mật khẩu xác nhận lần 2 không trùng khớp!");

            btnConfirmChangePwd.disabled = true;
            btnConfirmChangePwd.innerText = "ĐANG ĐỔI MẬT KHẨU...";

            updatePassword(currentUser, newPwd)
                .then(() => {
                    notify("🎉 Đổi mật khẩu thành công! Hãy đăng nhập lại bằng mật khẩu mới.");
                    txtNewPassword.value = "";
                    txtConfirmPassword.value = "";
                    
                    setTimeout(() => {
                        signOut(auth).then(() => {
                            window.location.reload();
                        });
                    }, 2000);
                })
                .catch((error) => {
                    btnConfirmChangePwd.disabled = false;
                    btnConfirmChangePwd.innerText = "XÁC NHẬN ĐỔI MẬT KHẨU";
                    
                    if (error.code === "auth/requires-recent-login") {
                        notify("🔒 Phiên làm việc đã quá hạn. Vui lòng tải lại trang, đăng nhập lại rồi đổi liền nhé!");
                    } else {
                        notify("❌ Thất bại: " + error.message);
                    }
                });
        });
    }
});
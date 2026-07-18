import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Cấu hình Firebase chính xác của dự án của bạn
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
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    // --- CÁC PHẦN TỬ CHAT TRÊN INDEX.HTML ---
    const chatAuthWarning = document.getElementById('chatAuthWarning');
    const chatBoxContent = document.getElementById('chatBoxContent');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const btnSendChat = document.getElementById('btnSendChat');

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
    let currentUser = null;
    let unsubscribeChat = null;

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

    // THEO DÕI TRẠNG THÁI ĐĂNG NHẬP (ĐÃ TÍCH HỢP ĐỒNG BỘ CHAT)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isLoggedIn = true;
            currentUser = user;

            // Xử lý khung Chat khi đã đăng nhập
            if (chatAuthWarning) chatAuthWarning.style.display = 'none';
            if (chatBoxContent) chatBoxContent.style.display = 'block';
            loadChatMessages();

            // Xử lý Header và Trang Login cũ
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
            currentUser = null;

            // Xử lý khung Chat khi chưa đăng nhập
            if (chatAuthWarning) chatAuthWarning.style.display = 'block';
            if (chatBoxContent) chatBoxContent.style.display = 'none';
            if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }

            // Thao tác cũ khi đăng xuất
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

    // --- LOGIC XỬ LÝ LỌC VÀ LƯU TIN NHẮN CHAT VĨNH VIỄN ---
    function loadChatMessages() {
        if (unsubscribeChat) unsubscribeChat();

        const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
        
        unsubscribeChat = onSnapshot(q, (snapshot) => {
            if (!chatMessages) return;
            chatMessages.innerHTML = "";
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const msgEl = document.createElement('div');
                msgEl.style.fontSize = "12px";
                msgEl.style.lineHeight = "1.4";
                
                const shortEmail = data.email.split('@')[0];
                msgEl.innerHTML = `<strong style="color: #ffb6c1;">${shortEmail}:</strong> <span style="color: #ffffff;">${data.message}</span>`;
                chatMessages.appendChild(msgEl);
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    function sendNewMessage() {
        if (!chatInput || !currentUser) return;
        const text = chatInput.value.trim();
        if (text === "") return;

        addDoc(collection(db, "chats"), {
            email: currentUser.email,
            message: text,
            timestamp: new Date()
        }).then(() => {
            chatInput.value = "";
        }).catch((err) => {
            notify("❌ Lỗi gửi tin nhắn: " + err.message);
        });
    }

    if (btnSendChat) btnSendChat.addEventListener('click', sendNewMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendNewMessage();
        });
    }

    // --- CÁC LOGIC SỰ KIỆN CỦA TRANG CHỦ & TRANG ĐĂNG NHẬP CŨ ---
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
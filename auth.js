import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    const chatAuthWarning = document.getElementById('chatAuthWarning');
    const chatBoxContent = document.getElementById('chatBoxContent');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const btnSendChat = document.getElementById('btnSendChat');

    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const btnSignIn = document.getElementById('btnSignIn');
    const btnSignUp = document.getElementById('btnSignUp');
    const btnSignOut = document.getElementById('btnSignOut');
    const authContainer = document.getElementById('authContainer');
    const userInfoContainer = document.getElementById('userInfoContainer');
    const userEmailTxt = document.getElementById('userEmailTxt');

    const userHomeBtn = document.getElementById('userHomeBtn');
    const defaultUserIcon = document.getElementById('defaultUserIcon');
    const userAvatar = document.getElementById('userAvatar');
    const accountDropdown = document.getElementById('accountDropdown');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const btnDropdownSignOut = document.getElementById('btnDropdownSignOut');

    // Các thành phần cấu hình ẩn danh mới thêm
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    const settingsPanel = document.getElementById('settingsPanel');
    const chkIncognito = document.getElementById('chkIncognito');

    let isLoggedIn = false;
    let currentUser = null;
    let unsubscribeChat = null;

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

    // Hàm tạo mã số ẩn danh ngẫu nhiên ngắn gọn cố định theo ID người dùng
    function getAnonymousName(uid) {
        let hash = 0;
        for (let i = 0; i < uid.length; i++) {
            hash = uid.charCodeAt(i) + ((hash << 5) - hash);
        }
        return "Ẩn danh #" + Math.abs(hash % 10000).toString().padStart(4, '0');
    }

    // THEO DÕI TRẠNG THÁI ĐĂNG NHẬP
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isLoggedIn = true;
            currentUser = user;

            if (chatAuthWarning) chatAuthWarning.style.display = 'none';
            if (chatBoxContent) chatBoxContent.style.display = 'block';
            loadChatMessages();

            if (authContainer) authContainer.style.display = 'none';
            if (userInfoContainer) userInfoContainer.style.display = 'block';
            if (userEmailTxt) userEmailTxt.innerHTML = `🎉 Đăng nhập thành công!<br><strong style="color:#ffb6c1;">${user.email}</strong>`;
            
            if (userAvatar && defaultUserIcon) {
                const finalAvatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=ffb6c1&color=000000&bold=true&rounded=true`;
                userAvatar.src = finalAvatarUrl;
                userAvatar.style.display = 'block';
                defaultUserIcon.style.display = 'none';
            }
            if (dropdownEmail) dropdownEmail.innerText = user.email;
        } else {
            isLoggedIn = false;
            currentUser = null;

            if (chatAuthWarning) chatAuthWarning.style.display = 'block';
            if (chatBoxContent) chatBoxContent.style.display = 'none';
            if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }

            if (authContainer) authContainer.style.display = 'block';
            if (userInfoContainer) userInfoContainer.style.display = 'none';

            if (userAvatar && defaultUserIcon) {
                userAvatar.style.display = 'none';
                defaultUserIcon.style.display = 'block';
            }
            if (accountDropdown) accountDropdown.style.display = 'none';
        }
    });

    // BẬT/TẮT BẢNG NHỎ CÀI ĐẶT DƯỚI AVATAR
    if (btnOpenSettings && settingsPanel) {
        btnOpenSettings.addEventListener('click', (e) => {
            e.stopPropagation(); // Tránh kích hoạt đóng đóng mở dropdown ngẫu nhiên
            if (settingsPanel.style.maxHeight === '0px' || !settingsPanel.style.maxHeight) {
                settingsPanel.style.maxHeight = '50px';
            } else {
                settingsPanel.style.maxHeight = '0px';
            }
        });
    }

    // --- TẢI TIN NHẮN TỪ FIRESTORE (XỬ LÝ HIỂN THỊ ẨN DANH) ---
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
                msgEl.style.display = "flex";
                msgEl.style.alignItems = "center";
                msgEl.style.gap = "6px";
                
                let displayName = "";
                let displayAvatar = "";

                // Kiểm tra xem tin nhắn này có bật chế độ ẩn danh hay không
                if (data.isIncognito) {
                    displayName = data.anonName || "Ẩn danh";
                    // Sử dụng hình icon khỉ dễ thương cho chế độ ẩn danh
                    displayAvatar = "🐒"; 
                } else {
                    displayName = data.email.split('@')[0];
                    displayAvatar = "💬";
                }

                msgEl.innerHTML = `<span>${displayAvatar}</span><strong style="color: #ffb6c1;">${displayName}:</strong> <span style="color: #ffffff;">${data.message}</span>`;
                chatMessages.appendChild(msgEl);
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // --- THAO TÁC GỬI TIN NHẮN TÍCH HỢP ẨN DANH ---
    function sendNewMessage() {
        if (!chatInput || !currentUser) return;
        const text = chatInput.value.trim();
        if (text === "") return;

        const isIncognitoActive = chkIncognito ? chkIncognito.checked : false;

        addDoc(collection(db, "chats"), {
            email: currentUser.email,
            message: text,
            timestamp: new Date(),
            isIncognito: isIncognitoActive, // Lưu trạng thái ẩn danh vào Database
            anonName: getAnonymousName(currentUser.uid) // Tạo mã số ẩn danh dựa trên UID tài khoản
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

    // --- CÁC LOGIC CLICK GIAO DIỆN CŨ ---
    if (userHomeBtn) {
        userHomeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isLoggedIn) {
                window.location.href = "login.html";
            } else {
                if (accountDropdown) {
                    const isHidden = accountDropdown.style.display === 'none';
                    accountDropdown.style.display = isHidden ? 'block' : 'none';
                    // Đóng panel cài đặt lại khi mở lại menu mới
                    if (settingsPanel) settingsPanel.style.maxHeight = '0px'; 
                }
            }
        });
    }

    // Ngăn chặn đóng dropdown khi click vào bên trong bảng điều khiển nhỏ cài đặt
    if (accountDropdown) {
        accountDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
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
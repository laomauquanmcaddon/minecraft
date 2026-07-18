import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    const userHomeBtn = document.getElementById('userHomeBtn');
    const defaultUserIcon = document.getElementById('defaultUserIcon');
    const userAvatar = document.getElementById('userAvatar');
    const accountDropdown = document.getElementById('accountDropdown');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const btnDropdownSignOut = document.getElementById('btnDropdownSignOut');
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    const settingsPanel = document.getElementById('settingsPanel');
    const chkIncognito = document.getElementById('chkIncognito');

    // CONFIG ĐẶC QUYỀN ADMIN CHÍNH CHỦ
    const ADMIN_EMAIL = "huquan227@gmail.com"; 
    const adminCrown = document.getElementById('adminCrown');
    const adminSettingRow = document.getElementById('adminSettingRow');
    const adminDeleteRow = document.getElementById('adminDeleteRow');
    const chkAdminMode = document.getElementById('chkAdminMode');
    const chkDeleteMode = document.getElementById('chkDeleteMode');
    const btnAdminAddCard = document.getElementById('btnAdminAddCard');
    const addonContainer = document.getElementById('addonContainer');

    const adminAddModal = document.getElementById('adminAddModal');
    const btnAdminSave = document.getElementById('btnAdminSave');
    const btnAdminCancel = document.getElementById('btnAdminCancel');
    const addModName = document.getElementById('addModName');
    const addModImg = document.getElementById('addModImg');
    const addModUrl = document.getElementById('addModUrl');
    const addModCategory = document.getElementById('addModCategory');

    const downloadModal = document.getElementById('downloadModal');
    const modalModName = document.getElementById('modalModName');
    const btnDownloadActual = document.getElementById('btnDownloadActual');
    const btnCancel = document.getElementById('btnCancel');
    const progressBar = document.getElementById('progressBar');

    let isLoggedIn = false;
    let currentUser = null;
    let unsubscribeChat = null;
    let unsubscribeMods = null;
    let listAllMods = [];
    let activeCategory = "all";
    let currentDownloadUrl = "";

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

    function getAnonymousName(uid) {
        let hash = 0;
        for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
        return "Ẩn danh #" + Math.abs(hash % 10000).toString().padStart(4, '0');
    }

    // KIỂM TRA ĐĂNG NHẬP VÀ PHÂN QUYỀN ADMIN TUYỆT ĐỐI
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isLoggedIn = true;
            currentUser = user;

            if (chatAuthWarning) chatAuthWarning.style.display = 'none';
            if (chatBoxContent) chatBoxContent.style.display = 'block';
            loadChatMessages();

            if (userAvatar && defaultUserIcon) {
                const finalAvatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=ffb6c1&color=000000&bold=true&rounded=true`;
                userAvatar.src = finalAvatarUrl;
                userAvatar.style.display = 'block';
                defaultUserIcon.style.display = 'none';
            }

            // NẾU LÀ GMAIL ADMIN ĐƯỢC CẤP QUYỀN
            if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                if (adminCrown) adminCrown.style.display = 'block'; // Hiện vương miện trên Avatar tròn
                if (dropdownEmail) dropdownEmail.innerHTML = `<span style="color: #ffd700; font-weight: bold;">👑 ${user.email}</span>`; // Tên màu vàng
                if (adminSettingRow) adminSettingRow.style.display = 'flex'; // Cho phép can thiệp mở bảng cài đặt admin
            } else {
                // Khách bình thường: Khóa sạch mọi tính năng can thiệp chỉnh sửa
                if (adminCrown) adminCrown.style.display = 'none';
                if (dropdownEmail) dropdownEmail.innerText = user.email;
                if (adminSettingRow) adminSettingRow.style.display = 'none';
                if (chkAdminMode) chkAdminMode.checked = false;
                if (chkDeleteMode) chkDeleteMode.checked = false;
                if (btnAdminAddCard) btnAdminAddCard.style.display = 'none';
            }
        } else {
            isLoggedIn = false;
            currentUser = null;
            if (chatAuthWarning) chatAuthWarning.style.display = 'block';
            if (chatBoxContent) chatBoxContent.style.display = 'none';
            if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
            if (adminCrown) adminCrown.style.display = 'none';
            if (adminSettingRow) adminSettingRow.style.display = 'none';
            if (btnAdminAddCard) btnAdminAddCard.style.display = 'none';
            if (userAvatar && defaultUserIcon) {
                userAvatar.style.display = 'none';
                defaultUserIcon.style.display = 'block';
            }
        }
    });

    // ĐỒNG BỘ DANH SÁCH Ô MOD TỪ FIRESTORE
    function loadAddonCards() {
        if (unsubscribeMods) unsubscribeMods();
        const q = query(collection(db, "addons"), orderBy("timestamp", "desc"));
        unsubscribeMods = onSnapshot(q, (snapshot) => {
            listAllMods = [];
            snapshot.forEach((doc) => { listAllMods.push({ id: doc.id, ...doc.data() }); });
            renderModsGrid();
        });
    }
    loadAddonCards();

    // IN RA LƯỚI Ô CHỨA MOD
    function renderModsGrid() {
        if (!addonContainer) return;
        addonContainer.innerHTML = "";

        const filtered = listAllMods.filter(item => activeCategory === "all" || item.category === activeCategory);
        if (filtered.length === 0) {
            addonContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #555; padding: 40px 0; font-size: 13px;">Chưa có ô dữ liệu nào được tạo.</div>`;
            return;
        }

        const isAuthorizedAdmin = currentUser && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        filtered.forEach((mod) => {
            const card = document.createElement('div');
            card.className = "addon-card";
            
            // Chỉ đổi viền cảnh báo xoá màu đỏ nếu là Admin thật sự và đang bật nút Xoá
            if (isAuthorizedAdmin && chkAdminMode && chkAdminMode.checked && chkDeleteMode && chkDeleteMode.checked) {
                card.style.borderColor = "#ff4d4d";
                card.style.cursor = "pointer";
            }

            card.innerHTML = `
                <img src="${mod.image || 'https://via.placeholder.com/150'}" class="addon-thumb" onerror="this.src='https://via.placeholder.com/150';">
                <p>${mod.name}</p>
            `;

            card.addEventListener('click', () => {
                // CHỈ CHO PHÉP XOÁ KHI ĐÚNG EMAIL ADMIN ĐƯỢC CẤP QUYỀN
                if (isAuthorizedAdmin && chkAdminMode && chkAdminMode.checked && chkDeleteMode && chkDeleteMode.checked) {
                    if (confirm(`Bạn có chắc chắn muốn XOÁ VĨNH VIỄN ô "${mod.name}" này không?`)) {
                        deleteDoc(doc(db, "addons", mod.id))
                            .then(() => notify("🗑️ Đã xoá ô chứa thành công!"))
                            .catch(err => notify("❌ Lỗi khi xoá: " + err.message));
                    }
                } else {
                    // Khách bấm vào thì mở popup chạy tiến trình tải bình thường
                    if (downloadModal && modalModName) {
                        modalModName.innerText = mod.name;
                        currentDownloadUrl = mod.downloadUrl;
                        progressBar.style.width = '0%';
                        btnDownloadActual.disabled = false;
                        btnDownloadActual.innerText = "TẢI NGAY";
                        downloadModal.classList.add('active');
                    }
                }
            });

            addonContainer.appendChild(card);
        });
    }

    // BẬT TẮT CHẾ ĐỘ ADMIN (CHỈ ADMIN THẬT SỰ MỚI CHẠY ĐƯỢC)
    if (chkAdminMode) {
        chkAdminMode.addEventListener('change', () => {
            const isAuthorizedAdmin = currentUser && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            if (chkAdminMode.checked && isAuthorizedAdmin) {
                if (btnAdminAddCard) btnAdminAddCard.style.display = "flex";
                if (adminDeleteRow) adminDeleteRow.style.display = "flex";
            } else {
                chkAdminMode.checked = false;
                if (btnAdminAddCard) btnAdminAddCard.style.display = "none";
                if (adminDeleteRow) adminDeleteRow.style.display = "none";
                if (chkDeleteMode) chkDeleteMode.checked = false;
            }
            renderModsGrid();
        });
    }

    if (chkDeleteMode) {
        chkDeleteMode.addEventListener('change', renderModsGrid);
    }

    if (btnAdminAddCard) {
        btnAdminAddCard.addEventListener('click', () => {
            const isAuthorizedAdmin = currentUser && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            if (isAuthorizedAdmin && adminAddModal) adminAddModal.style.display = "flex";
        });
    }
    if (btnAdminCancel) {
        btnAdminCancel.addEventListener('click', () => { if (adminAddModal) adminAddModal.style.display = "none"; });
    }

    // LƯU Ô MỚI (CHẶN NGAY TỪ PHÍA KHÁCH HÀNG)
    if (btnAdminSave) {
        btnAdminSave.addEventListener('click', () => {
            const isAuthorizedAdmin = currentUser && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            if (!isAuthorizedAdmin) {
                notify("❌ Bạn không có quyền thực hiện hành động này!");
                return;
            }

            const name = addModName.value.trim();
            const img = addModImg.value.trim();
            const url = addModUrl.value.trim();
            const category = addModCategory.value;

            if (!name || !url) return notify("⚠️ Tên ô và Link tải không được để trống!");

            addDoc(collection(db, "addons"), {
                name: name,
                image: img,
                downloadUrl: url,
                category: category,
                timestamp: new Date()
            }).then(() => {
                notify("✅ Đã tạo và lưu ô chứa vĩnh viễn!");
                addModName.value = ""; addModImg.value = ""; addModUrl.value = "";
                if (adminAddModal) adminAddModal.style.display = "none";
            }).catch((err) => { notify("❌ Lỗi: " + err.message); });
        });
    }

    // TIẾN TRÌNH TẢI MOD CỦA NGƯỜI DÙNG
    if (btnDownloadActual) {
        btnDownloadActual.addEventListener('click', () => {
            if (!currentDownloadUrl) return notify("⚠️ Link tải trống!");
            btnDownloadActual.disabled = true;
            btnDownloadActual.innerText = "ĐANG KẾT NỐI...";
            
            let width = 0;
            progressBar.style.width = '0%';
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    window.open(currentDownloadUrl, '_blank');
                    if (downloadModal) downloadModal.classList.remove('active');
                } else {
                    width += 5;
                    progressBar.style.width = width + '%';
                }
            }, 40);
        });
    }
    if (btnCancel) {
        btnCancel.addEventListener('click', () => { if (downloadModal) downloadModal.classList.remove('active'); });
    }

    // ĐIỀU HƯỚNG TÁP CATEGORY
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.getAttribute('data-category');
            renderModsGrid();
        });
    });

    if (btnOpenSettings && settingsPanel) {
        btnOpenSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            if (settingsPanel.style.maxHeight === '0px' || !settingsPanel.style.maxHeight) {
                settingsPanel.style.maxHeight = '120px';
            } else {
                settingsPanel.style.maxHeight = '0px';
            }
        });
    }

    // KHUNG CHAT CỘNG ĐỒNG BÌNH THƯỜNG
    function loadChatMessages() {
        if (unsubscribeChat) unsubscribeChat();
        const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
        unsubscribeChat = onSnapshot(q, (snapshot) => {
            if (!chatMessages) return;
            chatMessages.innerHTML = "";
            snapshot.forEach((doc) => {
                const data = doc.data();
                const msgEl = document.createElement('div');
                msgEl.style.fontSize = "12px"; msgEl.style.lineHeight = "1.4";
                msgEl.style.display = "flex"; msgEl.style.alignItems = "center"; msgEl.style.gap = "6px";
                
                let displayName = data.isIncognito ? (data.anonName || "Ẩn danh") : data.email.split('@')[0];
                let displayAvatar = data.isIncognito ? "🐒" : "💬";

                if (!data.isIncognito && data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                    displayName = `<span style="color: #ffd700; font-weight: bold;">👑 Admin (${displayName})</span>`;
                }

                msgEl.innerHTML = `<span>${displayAvatar}</span><strong style="color: #ffb6c1;">${displayName}:</strong> <span style="color: #ffffff;">${data.message}</span>`;
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
            timestamp: new Date(),
            isIncognito: chkIncognito ? chkIncognito.checked : false,
            anonName: getAnonymousName(currentUser.uid)
        }).then(() => { chatInput.value = ""; }).catch(err => notify("❌ Lỗi chat: " + err.message));
    }

    if (btnSendChat) btnSendChat.addEventListener('click', sendNewMessage);
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendNewMessage(); });

    if (userHomeBtn) {
        userHomeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isLoggedIn) { window.location.href = "login.html"; } 
            else { if (accountDropdown) { const isHidden = accountDropdown.style.display === 'none'; accountDropdown.style.display = isHidden ? 'block' : 'none'; if (settingsPanel) settingsPanel.style.maxHeight = '0px'; } }
        });
    }
    if (accountDropdown) accountDropdown.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => { if (accountDropdown) accountDropdown.style.display = 'none'; });
    if (btnDropdownSignOut) btnDropdownSignOut.addEventListener('click', () => { signOut(auth).then(() => { notify("🔒 Đã đăng xuất!"); }); });
});
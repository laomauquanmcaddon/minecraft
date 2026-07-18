/* ///////// 1. DANH SÁCH DỮ LIỆU GỐC ///////// */
const originalMods = [
    { 
        name: "Terrain Landscapes<br>V3.0", 
        img: "anh1.png", 
        downloadUrl: "https://www.mediafire.com/file/mp6ju0gmzfgwzhx/Terrain_landscapes_V3.0.mcaddon/file",
        type: "mcaddon" 
    }, 
    { 
        name: "Siêu xe Thể thao<br>mcpack", 
        img: "anh2.png", 
        downloadUrl: "files/addon2.mcpack",
        type: "mcpack" 
    },
    { 
        name: "Vũ khí Huyền thoại<br>V2", 
        img: "https://i.imgur.com/example.png", 
        downloadUrl: "files/game.apk",
        type: "apk" 
    },
    { 
        name: "Gói Kết cấu Đẹp<br>Shader", 
        img: "anh4.png", 
        downloadUrl: "https://www.mediafire.com/file/xxxxx/file.zip/file",
        type: "mcpack" 
    }
];

/* TỰ ĐỘNG NHÂN BẢN: Nhân số lượng lên 60 lần (Tổng 240 ô) và GIỮ NGUYÊN TÊN GỐC SẠCH SẼ */
const modList = [];
for (let i = 1; i <= 60; i++) {
    originalMods.forEach(mod => {
        modList.push({
            name: mod.name, // Đã bỏ phần cộng chuỗi "(Tập i)" đi theo ý bạn
            img: mod.img,
            downloadUrl: mod.downloadUrl,
            type: mod.type
        });
    });
}

/* ///////// 2. KHỞI TẠO CÁC BIẾN LIÊN KẾT GIAO DIỆN ///////// */
const container = document.getElementById('addonContainer');
const modal = document.getElementById('downloadModal');
const modalModName = document.getElementById('modalModName');
const btnCancel = document.getElementById('btnCancel');
const btnDownloadActual = document.getElementById('btnDownloadActual');
const progressBar = document.getElementById('progressBar');
const searchBox = document.querySelector('.search-box');
const btnClearSearch = document.getElementById('btnClearSearch');

let currentDownloadUrl = ""; 
let toastTimer = null;

/* HÀM TẠO VÀ HIỂN THỊ THÔNG BÁO NHANH (TOAST) */
function showToast(message) {
    let toast = document.getElementById('customToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'customToast';
        toast.className = 'toast-container';
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = message;
    toast.style.display = 'block';

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

/* ///////// 3. HÀM VẼ VÀ LỌC DỮ LIỆU CHÍNH ///////// */
function renderAndFilterMods() {
    const currentTab = document.querySelector('.tab-btn.active').getAttribute('data-category');
    const keyword = searchBox ? searchBox.value.toLowerCase().trim() : "";

    container.innerHTML = '';

    modList.forEach(mod => {
        if (currentTab !== "all" && mod.type !== currentTab) return;
        if (keyword && !mod.name.toLowerCase().includes(keyword)) return;

        const card = document.createElement('div');
        card.className = 'addon-card';
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <img data-src="${mod.img}" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'></svg>" alt="" class="addon-thumb lazy-thumb" onerror="this.src='https://i.imgur.com/7S8V32v.png';">
            <p>${mod.name}</p>
        `;

        card.addEventListener('click', () => {
            if (modal) {
                modalModName.innerHTML = mod.name;
                progressBar.style.width = '0%'; 
                currentDownloadUrl = mod.downloadUrl; 
                modal.style.display = 'flex'; 
                setTimeout(() => { modal.classList.add('active'); }, 10); 
            }
        });

        container.appendChild(card);
    });

    initLazyLoading();
}

/* ///////// 4. BỘ QUÉT LAZY LOADING ///////// */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-thumb');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.getAttribute('data-src');
                    image.classList.remove('lazy-thumb');
                    imageObserver.unobserve(image);
                }
            });
        });

        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        lazyImages.forEach(image => {
            image.src = image.getAttribute('data-src');
        });
    }
}

renderAndFilterMods();

/* ///////// 5. THEO DÕI CUỘN TRANG ĐỂ LÀM MỜ HEADER ///////// */
const headerElement = document.querySelector('.sticky-header');
if (headerElement) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            headerElement.classList.add('scrolled');
        } else {
            headerElement.classList.remove('scrolled');
        }
    });
}

/* ///////// 6. LẮNG NGHE CÁC SỰ KIỆN TƯƠNG TÁC ///////// */

// Sự kiện bấm chọn Tab danh mục
document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelector('.tab-btn.active').classList.remove('active');
        e.target.classList.add('active');
        renderAndFilterMods();
        showToast(`📂 Đã lọc danh mục: ${e.target.innerText}`);
    });
});

// Sự kiện gõ chữ vào ô Tìm kiếm
if (searchBox && btnClearSearch) {
    searchBox.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        btnClearSearch.style.display = value.length > 0 ? 'block' : 'none';
        renderAndFilterMods();
    });

    btnClearSearch.addEventListener('click', () => {
        searchBox.value = '';
        btnClearSearch.style.display = 'none';
        renderAndFilterMods();
        searchBox.focus();
        showToast("🧹 Đã xóa từ khóa tìm kiếm");
    });
}

// Sự kiện bấm nút "TẢI NGAY" trên Popup
if (btnDownloadActual) {
    btnDownloadActual.addEventListener('click', () => {
        if (!currentDownloadUrl || currentDownloadUrl === "#") {
            showToast("⚠️ Chưa có link tải cho mod này!");
            return;
        }
        
        showToast("🔄 Đang chuẩn bị tệp tin tải xuống...");

        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                window.open(currentDownloadUrl, '_blank');
                showToast("✅ Bắt đầu tải xuống thành công!");
                setTimeout(() => {
                    modal.classList.remove('active');
                    modal.style.display = 'none';
                }, 500);
            } else {
                width += 5;
                progressBar.style.width = width + '%';
            }
        }, 40);
    });
}

// Sự kiện bấm nút "TRỞ LẠI" đóng Popup
if (btnCancel) {
    btnCancel.addEventListener('click', () => {
        modal.classList.remove('active'); 
        modal.style.display = 'none'; 
    });
}
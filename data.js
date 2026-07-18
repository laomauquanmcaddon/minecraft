/* ///////// DANH SÁCH DỮ LIỆU CÁC Ô MOD VÀ LINK TẢI ///////// */
const modList = [
    // Ô số 1: Thay thế bằng ảnh thật và link tải file trực tiếp (.mcaddon) của bạn
    { 
        name: "mcaddon<br>mcpack 1", 
        img: "anh1.png", 
        downloadUrl: "https://www.mediafire.com/file/mp6ju0gmzfgwzhx/Terrain_landscapes_V3.0.mcaddon" 
    }, 
    // Ô số 2: Link ảnh mẫu và link tải file trực tiếp (.mcpack)
    { 
        name: "mcaddon<br>mcpack 2", 
        img: "https://placehold.co/150x150/png", 
        downloadUrl: "files/addon2.mcpack" 
    },
    // Ô số 3: Link tải file cài đặt game (.apk)
    { 
        name: "mcaddon<br>mcpack 3", 
        img: "https://placehold.co/150x150/png", 
        downloadUrl: "files/game.apk" 
    },
    // Ô số 4: Bạn có thể dán link Mediafire hoặc Google Drive vào đây để test
    { 
        name: "mcaddon<br>mcpack 4", 
        img: "https://placehold.co/150x150/png", 
        downloadUrl: "https://www.mediafire.com/file/xxxxx/file.zip/file" 
    },
    { 
        name: "mcaddon<br>mcpack 5", 
        img: "https://placehold.co/150x150/png", 
        downloadUrl: "#" 
    },
    { 
        name: "mcaddon<br>mcpack 6", 
        img: "https://placehold.co/150x150/png", 
        downloadUrl: "#" 
    }
];

/* ///////// KHỞI TẠO CÁC BIẾN LIÊN KẾT ĐẾN GIAO DIỆN ///////// */
const container = document.getElementById('addonContainer');
const modal = document.getElementById('downloadModal');
const modalModName = document.getElementById('modalModName');
const btnCancel = document.getElementById('btnCancel');
const btnDownloadActual = document.getElementById('btnDownloadActual');
const progressBar = document.getElementById('progressBar');

let currentDownloadUrl = ""; // Biến lưu tạm thời đường dẫn tải của ô đang được chọn

/* ///////// TỰ ĐỘNG VẼ CÁC Ô MOD RA MÀN HÌNH ///////// */
modList.forEach(mod => {
    const card = document.createElement('div');
    card.className = 'addon-card';
    card.style.cursor = 'pointer'; // Tạo hiệu ứng bàn tay khi di chuột trên PC
    
    card.innerHTML = `
        <img src="${mod.img}" alt="" class="addon-thumb">
        <p>${mod.name}</p>
    `;

    // Sự kiện: Khi click vào vùng ô mod, nạp dữ liệu và đẩy bảng tiến trình lên
    card.addEventListener('click', () => {
        modalModName.innerHTML = mod.name;
        progressBar.style.width = '0%'; // Reset thanh tiến trình về ban đầu
        currentDownloadUrl = mod.downloadUrl; // Lưu lại link của ô được chọn
        modal.classList.add('active'); // Kích hoạt hiệu ứng trượt lên
    });

    container.appendChild(card);
});

/* ///////// XỬ LÝ SỰ KIỆN KHI BẤM NÚT "TẢI NGAY" ///////// */
btnDownloadActual.addEventListener('click', () => {
    // Kiểm tra xem ô mod hiện tại đã được cấu hình link tải chưa
    if (!currentDownloadUrl || currentDownloadUrl === "#") {
        alert("Hiện tại chưa có link tải cho Mod này!");
        return;
    }

    let width = 0;
    // Chạy giả lập thanh tiến trình tăng dần từ 0% đến 100% cho mượt mà
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            
            // KIỂM TRA ĐUÔI FILE ĐỂ TỰ ĐỘNG KÍCH HOẠT TẢI KHÔNG ĐỔI TAB
            const isDirectFile = currentDownloadUrl.match(/\.(mcaddon|mcpack|apk|zip|rar|png|jpg)$/i);

            if (isDirectFile) {
                // Trường hợp 1: Nếu là file trực tiếp, tạo thẻ tải âm thầm ngay tại trang hiện tại
                const hiddenLink = document.createElement('a');
                hiddenLink.href = currentDownloadUrl;
                hiddenLink.setAttribute('download', '');
                document.body.appendChild(hiddenLink);
                hiddenLink.click();
                document.body.removeChild(hiddenLink);
            } else {
                // Trường hợp 2: Nếu là link Mediafire/Drive, sử dụng iframe ẩn để gửi lệnh tải mà không nhảy sang tab mới
                let iframe = document.getElementById('hiddenDownloadIframe');
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'hiddenDownloadIframe';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }
                iframe.src = currentDownloadUrl;
            }
            
            // Sau khi lệnh tải được phát đi, tự động thu bảng điều khiển xuống sau 0.5 giây
            setTimeout(() => {
                modal.classList.remove('active');
            }, 500);
        } else {
            width += 5; // Tốc độ tải (mỗi lần tăng 5%)
            progressBar.style.width = width + '%';
        }
    }, 40); // Cứ sau mỗi 40ms sẽ tăng thanh tiến trình lên một chút
});

/* ///////// XỬ LÝ SỰ KIỆN KHI BẤM NÚT "TRỞ LẠI" ///////// */
btnCancel.addEventListener('click', () => {
    modal.classList.remove('active'); // Ẩn bảng điều khiển xuống dưới
});
// ===== TRẠNG THÁI CÀI ĐẶT =====
let sessionUser = null;

window.onload = function () {
    // 1. Kiểm tra đăng nhập
    sessionUser = checkAuth();
    if (!sessionUser) return;

    // 2. Cấu hình thông tin ban đầu
    initSettingsForm();

    // Ngôn ngữ
    translatePage();
};

function goBack() {
    window.location.href = '../trang_chu/trang_chu.html';
}

// ===== KHỞI TẠO FORM CÀI ĐẶT =====
function initSettingsForm() {
    const activeProfile = getActiveProfile();
    const headerAvatar = document.getElementById('settingsAvatar');
    if (headerAvatar) {
        headerAvatar.textContent = activeProfile.name.charAt(0).toUpperCase();
        headerAvatar.style.backgroundColor = activeProfile.avatar || '#E50914';
    }

    // Điền thông tin tài khoản
    document.getElementById('usernameInput').value = sessionUser.name || '';
    document.getElementById('emailDisplay').value = sessionUser.email || '';

    // Chọn giá trị Theme hiện tại
    const savedTheme = localStorage.getItem('netflix_theme') || 'dark';
    document.getElementById('themeSelect').value = savedTheme;

    // Chọn giá trị Ngôn ngữ hiện tại
    const savedLang = getLanguage();
    document.getElementById('langSelect').value = savedLang;
}

// ===== THAY ĐỔI CẤU HÌNH GIAO DIỆN & NGÔN NGỮ =====
function changeThemeSetting() {
    const theme = document.getElementById('themeSelect').value;
    setTheme(theme);
}

function changeLangSetting() {
    const lang = document.getElementById('langSelect').value;
    setLanguage(lang);
}

// ===== LƯU CÀI ĐẶT TÀI KHOẢN =====
function saveAccountSettings() {
    const newName = document.getElementById('usernameInput').value.trim();
    const oldPass = document.getElementById('oldPassInput').value;
    const newPass = document.getElementById('newPassInput').value;
    const confirmPass = document.getElementById('confirmPassInput').value;
    
    const msgEl = document.getElementById('passMsg');
    const lang = getLanguage();
    
    msgEl.className = 'msg-box';
    msgEl.textContent = '';

    if (!newName) {
        msgEl.textContent = lang === 'vi' ? '⚠ Họ và tên không được bỏ trống.' : '⚠ Name cannot be empty.';
        msgEl.classList.add('msg-error');
        return;
    }

    // 1. Tải danh sách người dùng
    const usersData = localStorage.getItem('netflix_users');
    let users = usersData ? JSON.parse(usersData) : [];
    
    // Tìm tài khoản người dùng hiện tại
    const userIndex = users.findIndex(u => u.email === sessionUser.email);
    if (userIndex === -1) {
        msgEl.textContent = lang === 'vi' ? '✗ Không tìm thấy tài khoản người dùng.' : '✗ User account not found.';
        msgEl.classList.add('msg-error');
        return;
    }

    let userObj = users[userIndex];

    // 2. Xử lý đổi mật khẩu nếu có nhập mật khẩu cũ/mới
    if (oldPass || newPass || confirmPass) {
        if (!oldPass || !newPass || !confirmPass) {
            msgEl.textContent = lang === 'vi' ? '⚠ Vui lòng điền đầy đủ các thông tin để đổi mật khẩu.' : '⚠ Please fill in all fields to change password.';
            msgEl.classList.add('msg-error');
            return;
        }

        // Kiểm tra mật khẩu cũ
        if (userObj.password !== oldPass) {
            msgEl.textContent = lang === 'vi' ? '✗ Mật khẩu cũ không chính xác.' : '✗ Incorrect old password.';
            msgEl.classList.add('msg-error');
            return;
        }

        // Kiểm tra độ dài mật khẩu mới
        if (newPass.length < 6) {
            msgEl.textContent = lang === 'vi' ? '✗ Mật khẩu mới phải từ 6 ký tự trở lên.' : '✗ New password must be at least 6 characters.';
            msgEl.classList.add('msg-error');
            return;
        }

        // Kiểm tra mật khẩu xác nhận
        if (newPass !== confirmPass) {
            msgEl.textContent = lang === 'vi' ? '✗ Mật khẩu xác nhận không khớp.' : '✗ Passwords do not match.';
            msgEl.classList.add('msg-error');
            return;
        }

        // Cập nhật mật khẩu mới
        userObj.password = newPass;
    }

    // 3. Cập nhật họ tên
    userObj.name = newName;
    users[userIndex] = userObj;
    
    // Lưu lại danh sách tài khoản
    localStorage.setItem('netflix_users', JSON.stringify(users));

    // Cập nhật phiên đăng nhập hiện tại
    const updatedSession = { email: userObj.email, name: userObj.name };
    sessionStorage.setItem('netflix_user', JSON.stringify(updatedSession));
    if (localStorage.getItem('netflix_remember')) {
        localStorage.setItem('netflix_remember', JSON.stringify(updatedSession));
    }

    // Đồng bộ lại biến cục bộ
    sessionUser = updatedSession;

    // Reset các ô nhập mật khẩu
    document.getElementById('oldPassInput').value = '';
    document.getElementById('newPassInput').value = '';
    document.getElementById('confirmPassInput').value = '';

    msgEl.textContent = lang === 'vi' ? '✓ Lưu thành công!' : '✓ Saved successfully!';
    msgEl.classList.add('msg-success');

    // Cập nhật tên hiển thị ở header nếu có
    const activeProfile = getActiveProfile();
    // Nếu hồ sơ hoạt động trùng tên cũ của user, tự động đồng bộ
    if (activeProfile.id === 'p1') {
        activeProfile.name = newName;
        setActiveProfile(activeProfile);
    }
}

// ===== XÓA DANH SÁCH YÊU THÍCH =====
function clearWatchList() {
    const lang = getLanguage();
    if (confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn xóa tất cả phim trong Danh sách của tôi?' : 'Are you sure you want to clear My List?')) {
        localStorage.removeItem('netflix_mylist');
        alert(lang === 'vi' ? 'Đã xóa Danh sách của tôi thành công!' : 'My List cleared successfully!');
    }
}

// ===== XÓA TOÀN BỘ LỊCH SỬ ĐÁNH GIÁ =====
function clearAllReviews() {
    const lang = getLanguage();
    if (confirm(lang === 'vi' ? 'Hành động này sẽ xóa sạch các bình luận bạn đã đánh giá trên hệ thống. Tiếp tục?' : 'This will wipe all your custom reviews. Proceed?')) {
        // Tìm và xóa tất cả key dạng netflix_reviews_*
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('netflix_reviews_')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(k => localStorage.removeItem(k));
        alert(lang === 'vi' ? 'Đã xóa lịch sử đánh giá thành công!' : 'Reviews wiped successfully!');
    }
}

// ===== ĐĂNG XUẤT =====
function doLogout() {
    sessionStorage.removeItem('netflix_user');
    localStorage.removeItem('netflix_remember');
    window.location.href = '../login/login.html';
}

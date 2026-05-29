// ===== TRẠNG THÁI TRANG HỒ SƠ =====
let isEditMode = false;
let currentEditingId = null; // null đại diện cho Thêm mới
let selectedColor = '#E50914';

window.onload = function () {
    // 1. Kiểm tra đăng nhập
    const user = checkAuth();
    if (!user) return;

    // 2. Tải và hiển thị danh sách hồ sơ
    renderProfilesList();
    
    // Gắn sự kiện chọn màu đại diện trong Modal
    setupColorPickerEvents();
    
    // Ngôn ngữ mặc định
    translatePage();
};

// ===== ĐỔ DANH SÁCH HỒ SƠ =====
function renderProfilesList() {
    const listContainer = document.getElementById('profilesList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    const profiles = getProfiles();
    const lang = getLanguage();

    profiles.forEach(p => {
        const card = document.createElement('div');
        card.className = `profile-card ${isEditMode ? 'edit-active' : ''}`;
        
        card.onclick = () => {
            if (isEditMode) {
                openProfileModal(p.id);
            } else {
                selectProfile(p);
            }
        };

        const avatarBox = document.createElement('div');
        avatarBox.className = 'profile-avatar-box';
        avatarBox.style.backgroundColor = p.avatar;
        avatarBox.textContent = p.name ? p.name.charAt(0).toUpperCase() : 'N';

        // Lớp phủ bút chì khi ở chế độ quản lý
        const overlay = document.createElement('div');
        overlay.className = 'pencil-overlay';
        overlay.innerHTML = `<span class="pencil-icon"><i class="fa fa-pencil"></i></span>`;
        avatarBox.appendChild(overlay);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'profile-name';
        nameDiv.textContent = p.name;

        card.appendChild(avatarBox);
        card.appendChild(nameDiv);
        listContainer.appendChild(card);
    });

    // Nếu ở chế độ Edit và số hồ sơ dưới 5, hiện nút thêm hồ sơ mới
    if (isEditMode && profiles.length < 5) {
        const cardAdd = document.createElement('div');
        cardAdd.className = 'profile-card';
        cardAdd.onclick = () => openProfileModal(null);

        const avatarAdd = document.createElement('div');
        avatarAdd.className = 'profile-avatar-box add-avatar';
        avatarAdd.textContent = '+';

        const nameAdd = document.createElement('div');
        nameAdd.className = 'profile-name';
        nameAdd.textContent = lang === 'vi' ? 'Thêm hồ sơ' : 'Add Profile';
        nameAdd.setAttribute('data-translate', 'profileAdd');

        cardAdd.appendChild(avatarAdd);
        cardAdd.appendChild(nameAdd);
        listContainer.appendChild(cardAdd);
    }
}

// Bật/Tắt chế độ chỉnh sửa
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btn = document.getElementById('btnManage');
    const title = document.getElementById('viewTitle');
    const lang = getLanguage();

    if (isEditMode) {
        btn.textContent = lang === 'vi' ? 'Hoàn tất' : 'Done';
        title.textContent = lang === 'vi' ? 'Quản lý hồ sơ:' : 'Manage Profiles:';
    } else {
        btn.textContent = lang === 'vi' ? 'Quản lý hồ sơ' : 'Manage Profiles';
        title.textContent = lang === 'vi' ? 'Ai đang xem?' : "Who's watching?";
    }

    renderProfilesList();
}

// Chọn hồ sơ hoạt động và chuyển hướng về trang chủ
function selectProfile(profile) {
    setActiveProfile(profile);
    window.location.href = '../trang_chu/trang_chu.html';
}

// ===== ĐIỀU KHIỂN MODAL HỒ SƠ =====
function openProfileModal(profileId) {
    currentEditingId = profileId;
    const modal = document.getElementById('profileModal');
    const modalTitle = document.getElementById('modalTitleText');
    const nameInput = document.getElementById('profileNameInput');
    const preview = document.getElementById('avatarPreview');
    const btnDelete = document.getElementById('btnDeleteProfile');
    const lang = getLanguage();

    modal.classList.add('show');

    if (profileId === null) {
        // Chế độ THÊM MỚI
        modalTitle.textContent = lang === 'vi' ? 'Thêm hồ sơ mới' : 'Add Profile';
        nameInput.value = '';
        selectedColor = '#E50914';
        preview.textContent = 'N';
        btnDelete.style.display = 'none'; // Không thể xóa hồ sơ chưa tạo
    } else {
        // Chế độ CHỈNH SỬA
        modalTitle.textContent = lang === 'vi' ? 'Chỉnh sửa hồ sơ' : 'Edit Profile';
        const profiles = getProfiles();
        const profile = profiles.find(p => p.id === profileId);
        
        nameInput.value = profile.name;
        selectedColor = profile.avatar;
        preview.textContent = profile.name.charAt(0).toUpperCase();
        btnDelete.style.display = 'block'; // Có thể xóa
    }

    preview.style.backgroundColor = selectedColor;
    updateColorPickerHighlight();
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('show');
}

// Theo dõi thay đổi chữ nhập vào avatar preview
document.getElementById('profileNameInput').addEventListener('input', function() {
    const preview = document.getElementById('avatarPreview');
    preview.textContent = this.value ? this.value.charAt(0).toUpperCase() : 'N';
});

// Sự kiện cho bộ chọn màu sắc đại diện
function setupColorPickerEvents() {
    const dots = document.querySelectorAll('.color-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            selectedColor = this.getAttribute('data-color');
            document.getElementById('avatarPreview').style.backgroundColor = selectedColor;
            updateColorPickerHighlight();
        });
    });
}

function updateColorPickerHighlight() {
    const dots = document.querySelectorAll('.color-dot');
    dots.forEach(dot => {
        const color = dot.getAttribute('data-color');
        dot.classList.toggle('active', color === selectedColor);
    });
}

// Lưu thay đổi (thêm mới hoặc cập nhật)
function saveProfileChanges() {
    const nameInput = document.getElementById('profileNameInput');
    const name = nameInput.value.trim();
    const lang = getLanguage();

    if (!name) {
        alert(lang === 'vi' ? 'Vui lòng nhập tên hồ sơ!' : 'Please enter profile name!');
        return;
    }

    let profiles = getProfiles();

    if (currentEditingId === null) {
        // Lưu hồ sơ THÊM MỚI
        const newId = 'p' + Date.now();
        profiles.push({
            id: newId,
            name: name,
            avatar: selectedColor
        });
    } else {
        // Lưu hồ sơ CHỈNH SỬA
        profiles = profiles.map(p => {
            if (p.id === currentEditingId) {
                const updated = { ...p, name: name, avatar: selectedColor };
                
                // Nếu đang chỉnh sửa đúng hồ sơ hoạt động, cập nhật luôn hồ sơ hoạt động
                const active = getActiveProfile();
                if (active.id === p.id) {
                    setActiveProfile(updated);
                }
                return updated;
            }
            return p;
        });
    }

    saveProfiles(profiles);
    closeProfileModal();
    renderProfilesList();
}

// Xóa hồ sơ
function deleteProfile() {
    const profiles = getProfiles();
    const lang = getLanguage();

    if (profiles.length <= 1) {
        alert(lang === 'vi' ? 'Bạn phải giữ lại ít nhất một hồ sơ!' : 'You must keep at least one profile!');
        return;
    }

    if (!confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn xóa hồ sơ này?' : 'Are you sure you want to delete this profile?')) {
        return;
    }

    const updated = profiles.filter(p => p.id !== currentEditingId);
    
    // Nếu xóa trúng hồ sơ đang hoạt động, chuyển hồ sơ hoạt động sang cái đầu tiên
    const active = getActiveProfile();
    if (active.id === currentEditingId) {
        setActiveProfile(updated[0]);
    }

    saveProfiles(updated);
    closeProfileModal();
    renderProfilesList();
}

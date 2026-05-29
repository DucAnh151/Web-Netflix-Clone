/**
 * Toast Notification Module for Netflix Clone
 * Displays smooth, brief messages in the bottom right corner.
 * 
 * Hệ thống thông báo nhanh (Toast) cho Netflix Clone
 * Hiển thị các thông báo ngắn gọn, mượt mà ở góc dưới bên phải màn hình.
 */

function showToast(message) {
    // 1. Check or create the toast container
    // Kiểm tra hoặc tạo container chứa các toast
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Create the toast item
    // Tạo phần tử toast mới
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    
    // Check if FontAwesome is loaded, use appropriate close icon
    // Kiểm tra icon đóng
    toast.innerHTML = `
        <span class="toast-text">${message}</span>
        <button class="toast-close-btn" onclick="this.parentElement.remove()">&times;</button>
    `;

    // 3. Append and animate show
    // Thêm vào container và kích hoạt hiệu ứng hiển thị
    container.appendChild(toast);
    
    // Force a reflow to trigger transition
    // Buộc trình duyệt reflow để chạy hiệu ứng transition
    toast.offsetHeight; 
    toast.classList.add('show');

    // 4. Set auto remove timer (3 seconds)
    // Tự động đóng sau 3 giây
    const autoRemoveTimer = setTimeout(() => {
        closeToast(toast);
    }, 3000);

    // Allow manual close
    // Cho phép click nút đóng thủ công
    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            clearTimeout(autoRemoveTimer);
            closeToast(toast);
        };
    }
}

function closeToast(toast) {
    toast.classList.remove('show');
    toast.classList.add('hide');
    // Remove element after transition ends
    // Xóa phần tử sau khi kết thúc hiệu ứng chuyển động
    toast.addEventListener('transitionend', () => {
        toast.remove();
    });
}

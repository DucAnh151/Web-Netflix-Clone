// ===== TRẠNG THÁI TRANG TRỢ GIÚP =====
let hasWelcomeMessage = false;

window.onload = function () {
    // 1. Kiểm tra đăng nhập
    const user = checkAuth();
    if (!user) return;

    // 2. Hiển thị avatar của profile hoạt động
    const activeProfile = getActiveProfile();
    const helpAvatar = document.getElementById('helpAvatar');
    if (helpAvatar) {
        helpAvatar.textContent = activeProfile.name.charAt(0).toUpperCase();
        helpAvatar.style.backgroundColor = activeProfile.avatar || '#E50914';
    }

    // Ngôn ngữ
    translatePage();
};

function goBack() {
    window.location.href = '../trang_chu/trang_chu.html';
}

// ===== ĐIỀU KHIỂN ACCORDION FAQ =====
function toggleFAQ(element) {
    const item = element.parentElement;
    const answer = element.nextElementSibling;
    const isOpen = item.classList.contains('active');

    // Đóng tất cả các FAQ khác để giữ giao diện gọn gàng
    document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = '0px';
        }
    });

    // Toggle FAQ hiện tại
    if (isOpen) {
        item.classList.remove('active');
        answer.style.maxHeight = '0px';
    } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
    }
}

// ===== TÌM KIẾM FAQ THỜI GIAN THỰC =====
function filterFAQs() {
    const query = document.getElementById('helpSearchInput').value.trim().toLowerCase();
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionText = item.querySelector('.faq-question').textContent.toLowerCase();
        const answerText = item.querySelector('.faq-answer').textContent.toLowerCase();
        
        if (questionText.includes(query) || answerText.includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
            // Thu nhỏ nếu đang mở
            item.classList.remove('active');
            item.querySelector('.faq-answer').style.maxHeight = '0px';
        }
    });
}

// ===== HỘP THOẠI CHAT CHĂM SÓC KHÁCH HÀNG GIẢ LẬP =====
function openChatBox() {
    const chatWidget = document.getElementById('chatWidget');
    chatWidget.classList.add('show');
    
    // Gửi tin nhắn chào mừng đầu tiên từ chatbot nếu chưa gửi
    if (!hasWelcomeMessage) {
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            const lang = getLanguage();
            const welcomeText = lang === 'vi' 
                ? 'Xin chào! Tôi là chatbot tự động của Netflix. Tôi có thể hỗ trợ bạn các thông tin về: **Đổi mật khẩu**, **Ngôn ngữ**, **Danh sách phim**, **Gói cước dịch vụ**, hoặc **Giao diện**. Hãy nhập câu hỏi của bạn!'
                : 'Hello! I am the automated Netflix chatbot. I can help you with: **Password**, **Language**, **My List**, **Subscription Plan**, or **Theme**. How can I help you today?';
            appendBotMessage(welcomeText);
            hasWelcomeMessage = true;
        }, 800);
    }
}

function closeChatBox(e) {
    if (e) e.stopPropagation();
    document.getElementById('chatWidget').classList.remove('show');
}

function minimizeChat() {
    // Đơn giản là tắt chatbox khi click vào thanh tiêu đề
    document.getElementById('chatWidget').classList.remove('show');
}

// Sự kiện phím Enter
function handleChatKey(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
}

// Gửi tin nhắn từ người dùng
function sendChatMessage() {
    const input = document.getElementById('chatMessageInput');
    const text = input.value.trim();
    if (!text) return;

    // 1. Hiển thị tin nhắn của người dùng
    appendUserMessage(text);
    input.value = '';

    // 2. Phản hồi tự động của Bot sau 1 giây
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        const responseText = getBotResponse(text);
        appendBotMessage(responseText);
    }, 1000);
}

// Phân tích tin nhắn để chọn phản hồi phù hợp
function getBotResponse(query) {
    const q = query.toLowerCase();
    const lang = getLanguage();

    if (lang === 'vi') {
        if (q.includes('mật khẩu') || q.includes('pass')) {
            return 'Để đổi mật khẩu, bạn vào trang **Cài đặt** (trong avatar thả xuống góc phải) và điền mật khẩu cũ, mật khẩu mới trong phần **Đổi mật khẩu** rồi ấn **Lưu thay đổi**.';
        }
        if (q.includes('ngôn ngữ') || q.includes('tiếng anh') || q.includes('tiếng việt')) {
            return 'Bạn có thể đổi nhanh ngôn ngữ bằng nút **Duyệt tìm theo ngôn ngữ** trên thanh Menu chính hoặc chọn ngôn ngữ mặc định vĩnh viễn trong trang **Cài đặt**.';
        }
        if (q.includes('danh sách') || q.includes('yêu thích') || q.includes('my list')) {
            return 'Khi bấm vào một phim, bạn chọn **➕ Danh sách của tôi** trong bảng thông tin để thêm phim. Truy cập hàng phim yêu thích tại mục **Danh sách của tôi** trên menu.';
        }
        if (q.includes('gói') || q.includes('cước') || q.includes('premium')) {
            return 'Tài khoản của bạn đang chạy gói **Premium Ultra HD 4K**, cho phép xem trên tối đa 4 thiết bị cùng lúc với độ phân giải cao nhất.';
        }
        if (q.includes('giao diện') || q.includes('sáng') || q.includes('tối') || q.includes('theme')) {
            return 'Nhấp chọn biểu tượng ☀️ hoặc 🌙 ở góc phải thanh Menu để chuyển đổi nhanh giao diện Sáng / Tối bất kỳ lúc nào.';
        }
        return 'Cảm ơn bạn đã nhắn tin. Câu hỏi của bạn nằm ngoài phạm vi giải đáp tự động của bot. Bạn vui lòng liên hệ hotline **1800-1090** (miễn phí) để được hỗ trợ trực tiếp từ điện thoại viên nhé!';
    } else {
        // Tiếng Anh
        if (q.includes('password') || q.includes('pass')) {
            return 'To change your password, go to **Settings** page (from the avatar dropdown), enter your old and new password in the **Change Password** section, and click **Save Changes**.';
        }
        if (q.includes('language') || q.includes('english') || q.includes('vietnamese')) {
            return 'You can toggle the language by clicking the **Language** button on the main Menu bar or select your default language in the **Settings** page.';
        }
        if (q.includes('list') || q.includes('my list') || q.includes('favorite')) {
            return 'Open a movie details, then click **➕ My List** to save it. You can access your saved list anytime under the **My List** menu tab.';
        }
        if (q.includes('plan') || q.includes('premium') || q.includes('package')) {
            return 'Your account is on the **Premium Ultra HD 4K** plan, supporting up to 4 concurrent streams with HDR resolution.';
        }
        if (q.includes('theme') || q.includes('light') || q.includes('dark')) {
            return 'Click the ☀️ or 🌙 icon in the top right corner of the Menu to toggle between Light and Dark interface modes.';
        }
        return 'Thank you for reaching out. Your request is outside my automated capabilities. Please call our hotline at **1800-1090** (toll-free) for direct support.';
    }
}

// Chèn bong bóng chat
function appendUserMessage(text) {
    const body = document.getElementById('chatBody');
    const msg = document.createElement('div');
    msg.className = 'chat-msg user';
    
    const time = getFormattedTime();
    msg.innerHTML = `
        <div class="msg-bubble">${escapeHTML(text)}</div>
        <div class="msg-time">${time}</div>
    `;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
}

function appendBotMessage(text) {
    const body = document.getElementById('chatBody');
    const msg = document.createElement('div');
    msg.className = 'chat-msg bot';
    
    const time = getFormattedTime();
    msg.innerHTML = `
        <div class="msg-bubble">${formatMarkdown(text)}</div>
        <div class="msg-time">${time}</div>
    `;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
}

// Hiển thị hiệu ứng ba dấu chấm đang gõ
function showTypingIndicator() {
    const body = document.getElementById('chatBody');
    const indicator = document.createElement('div');
    indicator.className = 'chat-msg bot';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    body.appendChild(indicator);
    body.scrollTop = body.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// ===== TIỆN ÍCH PHỤ =====
function getFormattedTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Định dạng nhanh text dạng markdown đơn giản (**chữ đậm**)
function formatMarkdown(str) {
    return escapeHTML(str).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

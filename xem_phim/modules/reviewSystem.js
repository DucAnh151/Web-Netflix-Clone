/**
 * Reviews & Ratings System Module for Netflix Clone
 * Manages user comments, star rating inputs, local storage seeding/saving,
 * and unified rating calculation (5-star input mapped to 10-point scale).
 * 
 * Module Hệ thống Đánh giá & Bình luận cho Netflix Clone
 * Quản lý bình luận người dùng, chọn số sao, nạp/lưu dữ liệu LocalStorage,
 * và tính điểm thống nhất (đầu vào 5 sao quy đổi sang thang điểm 10).
 */

// Seeding initial comments data for films
// Mẫu bình luận ban đầu cho các phim (seed data)
const sampleReviews = [
    {
        name: 'Hoàng Long',
        avatar: '#e50909',
        stars: 5,
        comment: 'Phim cực kỳ xuất sắc! Cả phần hình ảnh, âm thanh lẫn diễn xuất đều tuyệt vời.',
        time: '2 ngày trước'
    },
    {
        name: 'Minh Thư',
        avatar: '#2e86de',
        stars: 4,
        comment: 'Nội dung rất hay, kỹ xảo hoành tráng nhưng nhịp phim hơi dài ở đoạn giữa.',
        time: '1 ngày trước'
    },
    {
        name: 'Quốc Bảo',
        avatar: '#10ac84',
        stars: 5,
        comment: 'Xem đi xem lại vẫn không chán. Quá đỉnh cho một bộ phim giải trí!',
        time: '4 giờ trước'
    }
];

/**
 * Get reviews list from Local Storage
 * Lấy danh sách đánh giá từ Local Storage
 */
function getReviews() {
    const key = `netflix_reviews_${currentFilmId}`;
    const data = localStorage.getItem(key);
    if (!data) {
        // Seed initial mock reviews
        // Gieo mẫu dữ liệu ban đầu
        localStorage.setItem(key, JSON.stringify(sampleReviews));
        return sampleReviews;
    }
    return JSON.parse(data);
}

/**
 * Save a new review to Local Storage
 * Lưu đánh giá mới vào Local Storage
 */
function saveReview(review) {
    const key = `netflix_reviews_${currentFilmId}`;
    const list = getReviews();
    list.unshift(review); // Prepend new review
    localStorage.setItem(key, JSON.stringify(list));
}

/**
 * Setup mouse events for the star rating selector (1-5 stars)
 * Gắn sự kiện tương tác chuột cho các nút chọn sao (1-5 sao)
 */
function setupStarRatingEvents() {
    const stars = document.querySelectorAll('.star-input-btn');
    stars.forEach(star => {
        star.addEventListener('mouseover', function () {
            const val = parseInt(this.getAttribute('data-value'));
            highlightStars(val, 'hovered');
        });

        star.addEventListener('mouseleave', function () {
            clearStarHighlight('hovered');
        });

        star.addEventListener('click', function () {
            selectedRating = parseInt(this.getAttribute('data-value'));
            highlightStars(selectedRating, 'active');
        });
    });
}

function highlightStars(val, className) {
    const stars = document.querySelectorAll('.star-input-btn');
    stars.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-value'));
        star.classList.toggle(className, starVal <= val);
    });
}

function clearStarHighlight(className) {
    const stars = document.querySelectorAll('.star-input-btn');
    stars.forEach(star => star.classList.remove(className));
}

/**
 * Render all reviews & update unified rating displays
 * Hiển thị danh sách nhận xét và tính điểm trung bình thống nhất
 */
function renderReviews() {
    const reviews = getReviews();
    const lang = getLanguage();
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    reviewsList.innerHTML = '';

    // Handle empty reviews
    // Trường hợp chưa có đánh giá nào
    if (reviews.length === 0) {
        reviewsList.innerHTML = `<div class="no-reviews-msg" data-translate="noReviewYet">${lang === 'vi' ? 'Chưa có đánh giá nào cho phim này. Hãy là người đầu tiên đánh giá!' : 'No reviews yet. Be the first to review!'}</div>`;
        document.getElementById('avgRatingScore').textContent = '0.0';
        document.getElementById('totalReviewsCount').textContent = '0';
        document.getElementById('avgStarsDisplay').innerHTML = '☆☆☆☆☆';
        return;
    }

    let totalStars = 0;
    reviews.forEach(rev => {
        totalStars += rev.stars;

        // Create comment block
        // Tạo thẻ bao bình luận
        const item = document.createElement('div');
        item.className = 'review-item';

        const header = document.createElement('div');
        header.className = 'review-item-header';

        const authorInfo = document.createElement('div');
        authorInfo.className = 'review-author-info';

        const avatar = document.createElement('div');
        avatar.className = 'review-avatar';
        avatar.style.backgroundColor = rev.avatar || '#555';
        avatar.textContent = rev.name ? rev.name.charAt(0).toUpperCase() : 'U';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'review-author-name';
        nameSpan.textContent = rev.name;

        authorInfo.appendChild(avatar);
        authorInfo.appendChild(nameSpan);

        const ratingStars = document.createElement('div');
        ratingStars.className = 'review-item-stars';
        ratingStars.textContent = '★'.repeat(rev.stars) + '☆'.repeat(5 - rev.stars);

        header.appendChild(authorInfo);
        header.appendChild(ratingStars);

        const timeDiv = document.createElement('div');
        timeDiv.className = 'review-time';
        timeDiv.textContent = rev.time;

        const commentText = document.createElement('p');
        commentText.className = 'review-comment-text';
        commentText.textContent = rev.comment;

        item.appendChild(header);
        item.appendChild(timeDiv);
        item.appendChild(commentText);
        reviewsList.appendChild(item);
    });

    // Unified Rating Calculation: Convert out-of-5 stars to out-of-10 score
    // Quy đổi điểm đánh giá trung bình từ hệ 5 sao sang hệ 10 điểm (nhân đôi)
    const avgScore = (totalStars * 2 / reviews.length).toFixed(1);
    document.getElementById('avgRatingScore').textContent = avgScore;
    document.getElementById('totalReviewsCount').textContent = reviews.length;

    // Convert average score back to out-of-5 stars visually
    // Quy đổi điểm hệ 10 ngược lại ra hệ 5 sao để hiển thị trực quan
    const roundedStars = Math.round(avgScore / 2);
    document.getElementById('avgStarsDisplay').textContent = '★'.repeat(roundedStars) + '☆'.repeat(5 - roundedStars);
}

/**
 * Handle new review form submission
 * Gửi đánh giá mới lên hệ thống
 */
function submitReview() {
    const commentEl = document.getElementById('reviewComment');
    const comment = commentEl.value.trim();
    const lang = getLanguage();

    if (selectedRating === 0) {
        alert(lang === 'vi' ? 'Vui lòng chọn số sao đánh giá!' : 'Please choose a star rating!');
        return;
    }

    if (!comment) {
        alert(lang === 'vi' ? 'Vui lòng nhập nhận xét!' : 'Please enter your comment!');
        return;
    }

    // Get active profile information for authorship
    // Lấy thông tin từ profile đang hoạt động để làm tên người viết
    const activeProfile = getActiveProfile();
    const newReview = {
        name: activeProfile.name || 'Người dùng',
        avatar: activeProfile.avatar || '#E50914',
        stars: selectedRating,
        comment: comment,
        time: lang === 'vi' ? 'Vừa xong' : 'Just now'
    };

    // Save and reset
    // Lưu vào Local Storage và đặt lại form
    saveReview(newReview);
    commentEl.value = '';
    selectedRating = 0;
    clearStarHighlight('active');

    // Reload comments view
    // Làm mới danh sách bình luận
    renderReviews();
}

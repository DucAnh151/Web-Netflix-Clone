// ===== KHỞI CHẠY TRANG XEM PHIM =====
let currentFilmId = '';
let selectedRating = 0;

window.onload = function () {
    // 1. Kiểm tra đăng nhập
    const user = checkAuth();
    if (!user) return;

    // Hiển thị avatar của profile hoạt động ở header
    const activeProfile = getActiveProfile();
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) {
        headerAvatar.textContent = activeProfile.name.charAt(0).toUpperCase();
        headerAvatar.style.backgroundColor = activeProfile.avatar || '#E50914';
    }

    // 2. Lấy ID phim từ URL query parameter
    const params = new URLSearchParams(window.location.search);
    currentFilmId = params.get('id');
    
    if (!currentFilmId) {
        window.location.href = '../trang_chu/trang_chu.html';
        return;
    }

    // 3. Khởi tạo dữ liệu trang phim
    initMoviePage();
    
    // Gắn sự kiện tương tác cho các nút chọn sao
    setupStarRatingEvents();
};

function goBack() {
    window.location.href = '../trang_chu/trang_chu.html';
}

// ===== TẢI THÔNG TIN PHIM & PHÁT VIDEO =====
function initMoviePage() {
    const film = listFilm.find(f => f.id === currentFilmId);
    if (!film) {
        window.location.href = '../trang_chu/trang_chu.html';
        return;
    }

    const lang = getLanguage();
    
    // Cập nhật tiêu đề trang
    const titleText = lang === 'vi' ? film.titleVi : film.titleEn;
    document.title = `Netflix - Xem ${titleText}`;

    // Cập nhật thông tin chi tiết phim
    document.getElementById('movieTitle').textContent = titleText;
    document.getElementById('movieRating').textContent = `⭐ ${film.rating}/10`;
    document.getElementById('movieYear').textContent = film.year;
    document.getElementById('movieDuration').textContent = film.duration;
    document.getElementById('movieViews').textContent = `👁 ${film.views} ${lang === 'vi' ? 'lượt xem' : 'views'}`;
    document.getElementById('movieDesc').textContent = lang === 'vi' ? film.descVi : film.descEn;

    document.getElementById('movieCast').textContent = lang === 'vi' ? film.castVi : film.castEn;
    document.getElementById('movieDirector').textContent = film.director;
    document.getElementById('movieCategory').textContent = lang === 'vi' ? film.categoryVi : film.categoryEn;

    // Thiết lập nút Danh sách của tôi
    const mylistBtn = document.getElementById('mylistBtn');
    updateMyListBtn(mylistBtn);
    mylistBtn.onclick = () => {
        toggleMyList(film.id);
        updateMyListBtn(mylistBtn);
    };

    // Thiết lập video player
    const videoContainer = document.getElementById('videoContainer');
    
    // Sử dụng video mẫu của dự án cho tất cả phim để trải nghiệm thật, nếu không có thì fallback sang youtube
    if (film.id) {
        videoContainer.innerHTML = `
            <video controls autoplay poster="${film.bannerImg}">
                <source src="../assets/video.mp4" type="video/mp4">
                Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
            </video>
        `;
    } else {
        videoContainer.innerHTML = `
            <iframe src="${film.videoUrl}?autoplay=1&rel=0" allowfullscreen allow="autoplay"></iframe>
        `;
    }

    // Render danh sách đề xuất
    renderRecommendations(film, lang);

    // Tải bình luận và đánh giá từ Local Storage
    renderReviews();
}

function updateMyListBtn(btn) {
    const lang = getLanguage();
    if (isInMyList(currentFilmId)) {
        btn.innerHTML = `➖ ${lang === 'vi' ? 'Xóa khỏi danh sách' : 'Remove from List'}`;
        btn.classList.add('in-list');
    } else {
        btn.innerHTML = `➕ ${lang === 'vi' ? 'Danh sách của tôi' : 'My List'}`;
        btn.classList.remove('in-list');
    }
}

// ===== RENDER ĐỀ XUẤT PHIM CÙNG THỂ LOẠI =====
function renderRecommendations(currentFilm, lang) {
    const slider = document.getElementById('recommendationsSlider');
    if (!slider) return;
    slider.innerHTML = '';

    // Lọc phim cùng thể loại
    let recommended = listFilm.filter(f => f.categoryVi === currentFilm.categoryVi && f.id !== currentFilm.id);
    
    // Nếu không đủ phim đề xuất cùng thể loại, lấy thêm phim khác loại
    if (recommended.length < 3) {
        listFilm.forEach(f => {
            if (f.id !== currentFilm.id && !recommended.find(r => r.id === f.id)) {
                recommended.push(f);
            }
        });
    }

    recommended.forEach(film => {
        const card = document.createElement('div');
        card.className = 'film-card';
        card.onclick = () => {
            // Chuyển sang phim mới bằng cách đổi query parameter và load lại thông tin
            window.location.href = `xem_phim.html?id=${film.id}`;
        };

        const img = document.createElement('img');
        img.src = film.thumbImg;
        img.alt = film.titleVi;
        img.draggable = false;

        const overlay = document.createElement('div');
        overlay.className = 'film-overlay';
        overlay.innerHTML = `<span>▶</span>`;

        const title = document.createElement('div');
        title.className = 'film-title';
        title.textContent = lang === 'vi' ? film.titleVi : film.titleEn;

        card.appendChild(img);
        card.appendChild(overlay);
        card.appendChild(title);
        slider.appendChild(card);
    });

    // Bật kéo ngang
    setupDragToScroll(slider);
}

// Điều khiển cuộn ngang bằng nút bấm
function scrollSlider(direction) {
    const slider = document.getElementById('recommendationsSlider');
    if (slider) {
        slider.scrollBy({ left: direction * 400, behavior: 'smooth' });
    }
}

// Kéo ngang cuộn
function setupDragToScroll(slider) {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
    });

    slider.style.cursor = 'grab';
}

// ===== TƯƠNG TÁC ĐÁNH GIÁ SAO (STARS SELECTION) =====
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

// ===== QUẢN LÝ ĐÁNH GIÁ & BÌNH LUẬN TRONG LOCAL STORAGE =====
// Mẫu bình luận ban đầu cho các phim (seeding data)
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

function getReviews() {
    const key = `netflix_reviews_${currentFilmId}`;
    const data = localStorage.getItem(key);
    if (!data) {
        // Gieo mẫu dữ liệu ban đầu
        localStorage.setItem(key, JSON.stringify(sampleReviews));
        return sampleReviews;
    }
    return JSON.parse(data);
}

function saveReview(review) {
    const key = `netflix_reviews_${currentFilmId}`;
    const list = getReviews();
    list.unshift(review); // Đưa đánh giá mới lên đầu danh sách
    localStorage.setItem(key, JSON.stringify(list));
}

// Hiển thị danh sách đánh giá & tính điểm trung bình
function renderReviews() {
    const reviews = getReviews();
    const lang = getLanguage();
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    reviewsList.innerHTML = '';

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

        // Tạo item bình luận
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

    // Tính điểm trung bình
    const avgScore = (totalStars / reviews.length).toFixed(1);
    document.getElementById('avgRatingScore').textContent = avgScore;
    document.getElementById('totalReviewsCount').textContent = reviews.length;

    // Dựng số sao hiển thị trung bình
    const roundedScore = Math.round(avgScore);
    document.getElementById('avgStarsDisplay').textContent = '★'.repeat(roundedScore) + '☆'.repeat(5 - roundedScore);
}

// Gửi bình luận mới
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

    // Lấy thông tin từ profile đang đăng nhập
    const activeProfile = getActiveProfile();
    const newReview = {
        name: activeProfile.name || 'Người dùng',
        avatar: activeProfile.avatar || '#E50914',
        stars: selectedRating,
        comment: comment,
        time: lang === 'vi' ? 'Vừa xong' : 'Just now'
    };

    // Lưu vào Local Storage
    saveReview(newReview);

    // Reset Form
    commentEl.value = '';
    selectedRating = 0;
    clearStarHighlight('active');

    // Load lại bình luận
    renderReviews();
}

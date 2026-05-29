/**
 * Main Controller for Netflix Watch Page
 * Coordinates initializations, authorization check, and loading modular scripts
 * using TMDB API integrations.
 * 
 * Trình Điều Khiển Chính của Trang Xem Phim Netflix
 * Điều phối khởi tạo dữ liệu, kiểm tra quyền đăng nhập, và tải thông tin phim từ TMDB API
 * thông qua các module con.
 */

// Shared global state variables (accessed by modular scripts)
// Biến trạng thái toàn cục dùng chung cho các module
let currentFilmId = '';
let selectedRating = 0;

window.onload = async function () {
    // 1. Authentication check
    // Kiểm tra thông tin đăng nhập
    const user = checkAuth();
    if (!user) return;

    // Display active profile avatar in header
    // Hiển thị hình đại diện hồ sơ đang xem ở header
    const activeProfile = getActiveProfile();
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) {
        headerAvatar.textContent = activeProfile.name.charAt(0).toUpperCase();
        headerAvatar.style.backgroundColor = activeProfile.avatar || '#E50914';
    }

    // 2. Retrieve film ID from URL parameters
    // Lấy ID phim từ tham số URL
    const params = new URLSearchParams(window.location.search);
    currentFilmId = params.get('id');
    
    if (!currentFilmId) {
        window.location.href = '../trang_chu/trang_chu.html';
        return;
    }

    // 3. Initialize watch page details and trigger modules asynchronously
    // Khởi tạo thông tin chi tiết phim bất đồng bộ và chạy các module
    await initMoviePage();
    
    // Bind mouse events for star selector inputs (handled in reviewSystem.js)
    // Thiết lập sự kiện bấm chọn sao đánh giá
    setupStarRatingEvents();
};

/**
 * Return back to home page
 * Quay trở lại trang chủ
 */
function goBack() {
    window.location.href = '../trang_chu/trang_chu.html';
}

/**
 * Fetch movie data asynchronously and populate UI elements
 * Tải dữ liệu phim bất đồng bộ và hiển thị lên giao diện
 */
async function initMoviePage() {
    let film;
    try {
        film = await TMDB.getDetails(currentFilmId);
    } catch (e) {
        console.warn("Watch page details API fetch error, fallback to static:", e);
        film = listFilm.find(f => f.id === currentFilmId);
    }

    if (!film) {
        window.location.href = '../trang_chu/trang_chu.html';
        return;
    }

    const lang = getLanguage();
    
    // Update document title
    // Cập nhật tiêu đề trình duyệt
    const titleText = lang === 'vi' ? film.titleVi : film.titleEn;
    document.title = `Netflix - Xem ${titleText}`;

    // Populate details text
    // Đổ dữ liệu vào các thẻ thông tin phim
    document.getElementById('movieTitle').textContent = titleText;
    document.getElementById('movieRating').textContent = `⭐ ${film.rating}/10`;
    document.getElementById('movieYear').textContent = film.year;
    document.getElementById('movieDuration').textContent = film.duration;
    document.getElementById('movieViews').textContent = `👁 ${film.views} ${lang === 'vi' ? 'lượt xem' : 'views'}`;
    document.getElementById('movieDesc').textContent = lang === 'vi' ? film.descVi : film.descEn;

    document.getElementById('movieCast').textContent = lang === 'vi' ? film.castVi : film.castEn;
    document.getElementById('movieDirector').textContent = film.director;
    document.getElementById('movieCategory').textContent = lang === 'vi' ? film.categoryVi : film.categoryEn;

    // Set My List button functionality
    // Cài đặt nút "Danh sách của tôi"
    const mylistBtn = document.getElementById('mylistBtn');
    updateMyListBtn(mylistBtn);
    mylistBtn.onclick = () => {
        const added = toggleMyList(film.id);
        updateMyListBtn(mylistBtn);
        
        // Show Toast Notification
        // Hiển thị thông báo Toast nhanh góc màn hình
        const filmName = lang === 'vi' ? film.titleVi : film.titleEn;
        if (typeof showToast === 'function') {
            const msg = added 
                ? (lang === 'vi' ? `Đã thêm "${filmName}" vào danh sách!` : `Added "${filmName}" to My List!`)
                : (lang === 'vi' ? `Đã xóa "${filmName}" khỏi danh sách!` : `Removed "${filmName}" from My List!`);
            showToast(msg);
        }
    };

    // Initialize Video Player (videoPlayer.js)
    // Khởi chạy trình phát video từ module videoPlayer.js
    initVideoPlayer(film);

    // Render similar recommendations (recommendations.js)
    // Tải và hiển thị danh mục phim đề xuất từ module recommendations.js
    renderRecommendations(film, lang);

    // Render user reviews (reviewSystem.js)
    // Tải danh sách đánh giá từ module reviewSystem.js
    renderReviews();
}

/**
 * Update UI style and text of My List button
 * Cập nhật giao diện và chữ hiển thị trên nút My List
 */
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

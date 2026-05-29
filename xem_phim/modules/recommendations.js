/**
 * Recommendations Module for Netflix Clone
 * Filters and renders similar movies using TMDB API or static fallbacks, 
 * and handles horizontal scroll logic (drag and button scroll).
 * 
 * Module Đề xuất Phim cho Netflix Clone
 * Lọc và hiển thị danh sách phim tương tự từ TMDB API hoặc tĩnh, quản lý cuộn ngang.
 */

// Category to Genre ID mapping
const categoryGenreMap = {
    'Hành động': 28, 'Action': 28,
    'Phiêu lưu': 12, 'Adventure': 12,
    'Hoạt hình': 16, 'Animation': 16, 'Anime': 16,
    'Hài hước': 35, 'Comedy': 35,
    'Hình sự': 80, 'Crime': 80,
    'Kinh dị': 27, 'Horror': 27,
    'Giật gân': 53, 'Thriller': 53,
    'Siêu anh hùng': 28, 'Superhero': 28,
    'Phim truyền hình': 10770, 'TV Movie': 10770
};

/**
 * Render similar movies based on category
 * Hiển thị các phim đề xuất cùng thể loại
 */
function renderRecommendations(currentFilm, lang) {
    const slider = document.getElementById('recommendationsSlider');
    if (!slider) return;
    slider.innerHTML = '';

    // Render 4 temporary skeleton card placeholders
    // Hiển thị 4 skeleton cards tạm thời
    for (let i = 0; i < 4; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        slider.appendChild(skeleton);
    }

    // Load actual recommended movies after 400ms skeleton time
    // Tải dữ liệu thật sau 400ms
    setTimeout(async () => {
        slider.innerHTML = '';

        let recommended = [];
        try {
            // Find corresponding TMDB Genre ID based on categories
            // Lọc thể loại ID tương ứng từ danh mục phim
            const genreId = categoryGenreMap[currentFilm.categoryVi] || categoryGenreMap[currentFilm.categoryEn] || 28;
            recommended = await TMDB.getByGenre(genreId, currentFilm.type);
        } catch (e) {
            console.warn("Recommendations API fetch error, fallback to static:", e);
            recommended = listFilm.filter(f => f.categoryVi === currentFilm.categoryVi && f.id !== currentFilm.id);
        }
        
        // Exclude currently playing film from suggestions list
        // Loại bỏ phim hiện tại khỏi danh mục gợi ý
        recommended = recommended.filter(f => f.id !== currentFilm.id);

        // Fallback to static list filtering on empty array
        if (recommended.length === 0) {
            recommended = listFilm.filter(f => f.id !== currentFilm.id);
        }

        // Render cards
        // Hiển thị danh sách thẻ phim
        recommended.forEach(film => {
            const card = document.createElement('div');
            card.className = 'film-card';
            card.onclick = () => {
                // Navigate to the new film detail watch page
                // Chuyển sang phim mới bằng cách đổi query parameter và load lại trang
                window.location.href = `xem_phim.html?id=${film.id}`;
            };

            const img = document.createElement('img');
            img.src = film.thumbImg;
            img.alt = film.titleVi;
            img.draggable = false; // Prevent browser default drag action

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

        // Enable drag to scroll for desktop users
        // Bật kéo ngang bằng chuột cho người dùng máy tính
        setupDragToScroll(slider);
    }, 400);
}

/**
 * Scroll slider horizontally using control buttons
 * Điều khiển cuộn ngang bằng nút bấm mũi tên
 */
function scrollSlider(direction) {
    const slider = document.getElementById('recommendationsSlider');
    if (slider) {
        slider.scrollBy({ left: direction * 400, behavior: 'smooth' });
    }
}

/**
 * Mouse drag to scroll helper
 * Thiết lập tính năng kéo cuộn bằng chuột
 */
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
        const walk = (x - startX) * 1.5; // Multiplier to increase scroll speed
        slider.scrollLeft = scrollLeft - walk;
    });

    slider.style.cursor = 'grab';
}

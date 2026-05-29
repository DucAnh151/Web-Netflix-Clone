// ===== KHỞI CHẠY HỆ THỐNG =====
window.onload = function () {
    // 1. Kiểm tra đăng nhập
    const user = checkAuth();
    if (!user) return;

    // Hiển thị thông tin người dùng từ profile
    updateUserProfileDisplay();

    // 2. Khởi tạo ngôn ngữ & sự kiện
    window.addEventListener('languagechanged', () => {
        renderPage();
    });
    
    window.addEventListener('mylistchanged', () => {
        if (window.location.hash === '#my-list') {
            renderPage();
        }
    });

    // 3. Theo dõi thay đổi URL hash để định tuyến tab
    window.addEventListener('hashchange', handleRouting);
    
    // Chạy định tuyến lần đầu
    handleRouting();
    
    // Gắn sự kiện tắt các dropdown khi click ra ngoài
    document.addEventListener('click', closeAllDropdowns);
};

// Cập nhật giao diện người dùng dựa trên hồ sơ hoạt động
function updateUserProfileDisplay() {
    const activeProfile = getActiveProfile();
    const name = activeProfile.name || 'Người dùng';
    const avatarCircle = document.getElementById('avatarCircle');
    const dropdownUser = document.getElementById('dropdownUser');
    
    if (avatarCircle) {
        avatarCircle.textContent = name.charAt(0).toUpperCase();
        avatarCircle.style.backgroundColor = activeProfile.avatar || '#E50914';
    }
    if (dropdownUser) {
        dropdownUser.textContent = name;
    }
}

// ===== ĐỊNH TUYẾN CHUYỂN TAB ĐỘNG =====
function handleRouting() {
    const hash = window.location.hash || '#all';
    
    // Cập nhật class active cho menu link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    let activeLink;
    if (hash === '#all') activeLink = document.getElementById('nav-all');
    else if (hash === '#tv-shows') activeLink = document.getElementById('nav-tv');
    else if (hash === '#movies') activeLink = document.getElementById('nav-movies');
    else if (hash === '#new') activeLink = document.getElementById('nav-new');
    else if (hash === '#my-list') activeLink = document.getElementById('nav-mylist');
    
    if (activeLink) activeLink.classList.add('active');

    // Reset thanh tìm kiếm
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.classList.remove('open');
    }

    renderPage();
}

// ===== RENDER TOÀN BỘ TRANG (BANNER & HÀNG PHIM) =====
function renderPage() {
    const hash = window.location.hash || '#all';
    const lang = getLanguage();
    
    // 1. Cập nhật Banner dựa trên Tab
    updateBannerForTab(hash, lang);
    
    // 2. Lọc và xây dựng các hàng phim
    const container = document.getElementById('filmListsContainer');
    if (!container) return;
    container.innerHTML = '';
    
    if (hash === '#my-list') {
        renderMyListTab(container, lang);
    } else if (hash === '#new') {
        renderNewAndPopularTab(container, lang);
    } else if (hash === '#tv-shows') {
        renderCategorizedTab(container, 'tv', lang);
    } else if (hash === '#movies') {
        renderCategorizedTab(container, 'movie', lang);
    } else {
        // Trang chủ (Tất cả)
        renderHomeTab(container, lang);
    }
}

// Cập nhật thông tin Banner chính
function updateBannerForTab(hash, lang) {
    const bannerEl = document.getElementById('bannerEl');
    const badgeEl = document.getElementById('bannerBadge');
    const titleEl = document.getElementById('bannerTitle');
    const viewsEl = document.getElementById('bannerViews');
    const ratingEl = document.getElementById('bannerRating');
    const yearEl = document.getElementById('bannerYear');
    const descEl = document.getElementById('bannerDesc');
    const playBtn = document.getElementById('bannerPlayBtn');
    const infoBtn = document.getElementById('bannerInfoBtn');

    if (!bannerEl) return;

    // Chọn bộ phim làm banner chính dựa vào tab
    let featuredFilm = listFilm[1]; // Mặc định Dragon Ball
    let badgeText = lang === 'vi' ? '🔥 #1 Đề cử tuần này' : '🔥 #1 Recommended This Week';

    if (hash === '#tv-shows') {
        featuredFilm = listFilm.find(f => f.id === 'naruto') || listFilm[2];
        badgeText = lang === 'vi' ? '📺 Phim truyền hình hot' : '📺 Hot TV Show';
    } else if (hash === '#movies') {
        featuredFilm = listFilm.find(f => f.id === 'marvel') || listFilm[0];
        badgeText = lang === 'vi' ? '🎬 Phim bom tấn ăn khách' : '🎬 Blockbuster Movie';
    } else if (hash === '#new') {
        featuredFilm = listFilm.find(f => f.id === 'mufasa') || listFilm[4];
        badgeText = lang === 'vi' ? '✨ Mới phát hành' : '✨ Newly Released';
    } else if (hash === '#my-list') {
        const myListIds = getMyList();
        if (myListIds.length > 0) {
            featuredFilm = listFilm.find(f => f.id === myListIds[0]);
            badgeText = lang === 'vi' ? '💖 Trong danh sách của bạn' : '💖 In Your List';
        }
    }

    // Đổ dữ liệu banner
    bannerEl.style.backgroundImage = `url('${featuredFilm.bannerImg}')`;
    if (badgeEl) badgeEl.textContent = badgeText;
    if (titleEl) titleEl.textContent = lang === 'vi' ? featuredFilm.titleVi : featuredFilm.titleEn;
    if (viewsEl) viewsEl.textContent = `👁 ${featuredFilm.views} ${lang === 'vi' ? 'lượt xem' : 'views'}`;
    if (ratingEl) ratingEl.textContent = `⭐ ${featuredFilm.rating}/10`;
    if (yearEl) yearEl.textContent = featuredFilm.year;
    if (descEl) descEl.textContent = lang === 'vi' ? featuredFilm.descVi : featuredFilm.descEn;

    // Gắn sự kiện các nút banner
    if (playBtn) {
        playBtn.innerHTML = `▶ ${lang === 'vi' ? 'Xem ngay' : 'Play'}`;
        playBtn.onclick = () => watchMovie(featuredFilm.id);
    }
    if (infoBtn) {
        infoBtn.innerHTML = `ℹ ${lang === 'vi' ? 'Thông tin' : 'More Info'}`;
        infoBtn.onclick = () => showMovieInfo(featuredFilm.id);
    }
}

// RENDER TAB: Trang chủ (Tất cả hàng phim)
function renderHomeTab(container, lang) {
    const sections = [
        { titleVi: 'Đề cử cho bạn', titleEn: 'Recommended for You', filter: () => true },
        { titleVi: 'Phim Kinh dị', titleEn: 'Horror Movies', filter: f => f.categoryVi === 'Kinh dị' },
        { titleVi: 'Phim Siêu anh hùng', titleEn: 'Superhero Movies', filter: f => f.categoryVi === 'Siêu anh hùng' },
        { titleVi: 'Hoạt hình Nhật Bản', titleEn: 'Anime', filter: f => f.categoryVi === 'Hoạt hình' }
    ];

    sections.forEach(sec => {
        const films = listFilm.filter(sec.filter);
        if (films.length > 0) {
            createMovieRow(container, lang === 'vi' ? sec.titleVi : sec.titleEn, films, lang);
        }
    });
}

// RENDER TAB: Lọc theo TV Show hoặc Movie
function renderCategorizedTab(container, type, lang) {
    const films = listFilm.filter(f => f.type === type);
    const title = type === 'tv' 
        ? (lang === 'vi' ? 'Danh sách Phim truyền hình' : 'TV Shows List')
        : (lang === 'vi' ? 'Danh sách Phim lẻ bom tấn' : 'Blockbuster Movies');
        
    createMovieRow(container, title, films, lang);
    
    // Thêm hàng theo các thể loại con
    const categories = [...new Set(films.map(f => f.categoryVi))];
    categories.forEach(cat => {
        const catFilms = films.filter(f => f.categoryVi === cat);
        const catTitle = lang === 'vi' ? cat : (catFilms[0].categoryEn || cat);
        createMovieRow(container, catTitle, catFilms, lang);
    });
}

// RENDER TAB: Mới & Phổ biến (Sắp xếp theo năm phát hành giảm dần)
function renderNewAndPopularTab(container, lang) {
    const sortedFilms = [...listFilm].sort((a, b) => b.year - a.year);
    const title = lang === 'vi' ? 'Mới phát hành gần đây' : 'Newly Released';
    createMovieRow(container, title, sortedFilms, lang);

    // Hàng xem nhiều nhất
    const popularFilms = [...listFilm].sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
    const popTitle = lang === 'vi' ? 'Thịnh hành nhất' : 'Popular & Trending';
    createMovieRow(container, popTitle, popularFilms, lang);
}

// RENDER TAB: Danh sách của tôi
function renderMyListTab(container, lang) {
    const myListIds = getMyList();
    const films = listFilm.filter(f => myListIds.includes(f.id));
    const title = lang === 'vi' ? 'Danh sách của tôi' : 'My List';

    if (films.length === 0) {
        const titleEl = document.createElement('h2');
        titleEl.className = 'loai-phim';
        titleEl.textContent = title;
        container.appendChild(titleEl);

        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-list-msg';
        emptyMsg.textContent = lang === 'vi' ? 'Danh sách của bạn đang trống. Hãy thêm phim vào danh sách yêu thích!' : 'Your list is empty. Add some movies to get started!';
        container.appendChild(emptyMsg);
    } else {
        createMovieRow(container, title, films, lang);
    }
}

// Hàm phụ tạo hàng phim Slider hoàn chỉnh có nút bấm cuộn trái/phải và drag chuột
function createMovieRow(parentContainer, titleText, films, lang) {
    const section = document.createElement('div');
    section.className = 'film-section';

    const h2 = document.createElement('h2');
    h2.className = 'loai-phim';
    h2.textContent = titleText;
    section.appendChild(h2);

    const wrapper = document.createElement('div');
    wrapper.className = 'slider-container-wrapper';

    // Nút cuộn Trái
    const btnLeft = document.createElement('button');
    btnLeft.className = 'slider-btn slider-btn-left';
    btnLeft.innerHTML = '‹';
    btnLeft.onclick = () => {
        filmListDiv.scrollBy({ left: -600, behavior: 'smooth' });
    };

    // Nút cuộn Phải
    const btnRight = document.createElement('button');
    btnRight.className = 'slider-btn slider-btn-right';
    btnRight.innerHTML = '›';
    btnRight.onclick = () => {
        filmListDiv.scrollBy({ left: 600, behavior: 'smooth' });
    };

    const filmListDiv = document.createElement('div');
    filmListDiv.className = 'menu_phim';

    // Đổ phim vào hàng
    films.forEach(film => {
        const card = document.createElement('div');
        card.className = 'film-card';
        card.onclick = () => showMovieInfo(film.id);

        const img = document.createElement('img');
        img.className = 'img';
        img.src = film.thumbImg;
        img.alt = film.titleVi;
        img.draggable = false; // Ngăn chặn drag ảnh mặc định của trình duyệt

        const overlay = document.createElement('div');
        overlay.className = 'film-overlay';
        overlay.innerHTML = `<span>▶</span>`;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'film-title';
        titleDiv.textContent = lang === 'vi' ? film.titleVi : film.titleEn;

        card.appendChild(img);
        card.appendChild(overlay);
        card.appendChild(titleDiv);
        filmListDiv.appendChild(card);
    });

    wrapper.appendChild(btnLeft);
    wrapper.appendChild(filmListDiv);
    wrapper.appendChild(btnRight);
    section.appendChild(wrapper);
    parentContainer.appendChild(section);

    // Kéo ngang qua lại để lựa chọn (Mouse Drag to Scroll)
    setupDragToScroll(filmListDiv);
}

// Cài đặt tính năng kéo cuộn bằng chuột
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
        const walk = (x - startX) * 1.5; // Tăng tốc độ cuộn
        slider.scrollLeft = scrollLeft - walk;
    });

    // Cho thiết bị cảm ứng
    slider.style.cursor = 'grab';
}

// ===== TÌM KIẾM PHIM =====
let searchTimer = null;
function toggleSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.classList.toggle('open');
    if (input.classList.contains('open')) {
        input.focus();
    }
}

function handleSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        const query = document.getElementById('searchInput').value.trim().toLowerCase();
        const container = document.getElementById('filmListsContainer');
        if (!container) return;

        if (!query) {
            renderPage();
            return;
        }

        const lang = getLanguage();
        // Lọc phim theo tiêu đề
        const results = listFilm.filter(film => {
            const title = (lang === 'vi' ? film.titleVi : film.titleEn).toLowerCase();
            const desc = (lang === 'vi' ? film.descVi : film.descEn).toLowerCase();
            return title.includes(query) || desc.includes(query);
        });

        container.innerHTML = '';
        const title = lang === 'vi' ? `Kết quả tìm kiếm cho: "${query}"` : `Search results for: "${query}"`;
        
        if (results.length === 0) {
            const h2 = document.createElement('h2');
            h2.className = 'loai-phim';
            h2.textContent = title;
            container.appendChild(h2);

            const noResults = document.createElement('div');
            noResults.className = 'empty-list-msg';
            noResults.textContent = lang === 'vi' ? 'Không tìm thấy phim phù hợp.' : 'No matching movies found.';
            container.appendChild(noResults);
        } else {
            createMovieRow(container, title, results, lang);
        }
    }, 300);
}

// ===== DROPDOWN NGÔN NGỮ & BELL & AVATAR =====
function toggleDropdown(e) {
    e.stopPropagation();
    document.getElementById('dropdownMenu').classList.toggle('show');
    document.querySelector('.avatar-wrapper').classList.toggle('open');
    
    // Đóng dropdown khác
    document.getElementById('langDropdown').classList.remove('show');
    document.getElementById('bellPopover').classList.remove('show');
}

function toggleLangDropdown(e) {
    e.stopPropagation();
    document.getElementById('langDropdown').classList.toggle('show');
    
    // Đóng dropdown khác
    document.getElementById('dropdownMenu').classList.remove('show');
    document.querySelector('.avatar-wrapper').classList.remove('open');
    document.getElementById('bellPopover').classList.remove('show');
}

function toggleBell(e) {
    e.stopPropagation();
    document.getElementById('bellPopover').classList.toggle('show');
    
    // Đóng dropdown khác
    document.getElementById('dropdownMenu').classList.remove('show');
    document.querySelector('.avatar-wrapper').classList.remove('open');
    document.getElementById('langDropdown').classList.remove('show');
}

function changeLang(lang, e) {
    e.preventDefault();
    setLanguage(lang);
    document.getElementById('langDropdown').classList.remove('show');
}

function closeAllDropdowns(e) {
    const avatarWrapper = document.querySelector('.avatar-wrapper');
    if (avatarWrapper && !avatarWrapper.contains(e.target)) {
        document.getElementById('dropdownMenu').classList.remove('show');
        avatarWrapper.classList.remove('open');
    }
    
    const langWrapper = document.querySelector('.lang-dropdown-wrapper');
    if (langWrapper && !langWrapper.contains(e.target)) {
        document.getElementById('langDropdown').classList.remove('show');
    }
    
    const bellWrapper = document.querySelector('.bell-wrapper');
    if (bellWrapper && !bellWrapper.contains(e.target)) {
        document.getElementById('bellPopover').classList.remove('show');
    }
}

// ===== ĐĂNG XUẤT =====
function doLogout() {
    sessionStorage.removeItem('netflix_user');
    localStorage.removeItem('netflix_remember');
    window.location.href = '../login/login.html';
}

// ===== XEM PHIM (CHUYỂN TRANG) =====
function watchMovie(filmId) {
    window.location.href = `../xem_phim/xem_phim.html?id=${filmId}`;
}

// ===== MODAL CHI TIẾT PHIM NETFLIX =====
function showMovieInfo(filmId) {
    const film = listFilm.find(f => f.id === filmId);
    if (!film) return;

    const lang = getLanguage();

    // 1. Cập nhật nội dung modal
    document.getElementById('modalTitle').textContent = lang === 'vi' ? film.titleVi : film.titleEn;
    document.getElementById('modalBanner').style.backgroundImage = `url('${film.bannerImg}')`;
    document.getElementById('modalRating').textContent = `⭐ ${film.rating}`;
    document.getElementById('modalYear').textContent = film.year;
    document.getElementById('modalDuration').textContent = film.duration;
    document.getElementById('modalDesc').textContent = lang === 'vi' ? film.descVi : film.descEn;
    
    document.getElementById('modalCast').textContent = lang === 'vi' ? film.castVi : film.castEn;
    document.getElementById('modalDirector').textContent = film.director;
    document.getElementById('modalCategory').textContent = lang === 'vi' ? film.categoryVi : film.categoryEn;

    // 2. Thiết lập các nút chức năng trong modal
    const playBtn = document.getElementById('modalPlayBtn');
    playBtn.innerHTML = `▶ ${lang === 'vi' ? 'Xem ngay' : 'Play'}`;
    playBtn.onclick = () => watchMovie(film.id);

    const myListBtn = document.getElementById('modalMyListBtn');
    updateMyListBtnState(myListBtn, film.id, lang);
    myListBtn.onclick = () => {
        const added = toggleMyList(film.id);
        updateMyListBtnState(myListBtn, film.id, lang);
    };

    // 3. Render các phim đề xuất cùng thể loại
    const similarGrid = document.getElementById('modalSimilarGrid');
    similarGrid.innerHTML = '';
    
    const similarFilms = listFilm.filter(f => f.categoryVi === film.categoryVi && f.id !== film.id);
    if (similarFilms.length === 0) {
        // Nếu không có phim cùng thể loại thì đề xuất phim khác
        listFilm.filter(f => f.id !== film.id).slice(0, 3).forEach(f => similarFilms.push(f));
    }

    similarFilms.slice(0, 3).forEach(f => {
        const card = document.createElement('div');
        card.className = 'similar-card';
        card.onclick = () => {
            // Xem chi tiết phim được đề xuất trực tiếp trên modal
            showMovieInfo(f.id);
        };

        const img = document.createElement('img');
        img.className = 'similar-img';
        img.src = f.thumbImg;

        const info = document.createElement('div');
        info.className = 'similar-info';

        const meta = document.createElement('div');
        meta.className = 'similar-meta';
        meta.innerHTML = `<span class="meta-rating">⭐ ${f.rating}</span><span class="meta-year">${f.year}</span>`;

        const title = document.createElement('div');
        title.style.fontWeight = '700';
        title.style.fontSize = '13px';
        title.style.marginBottom = '6px';
        title.style.whiteSpace = 'nowrap';
        title.style.overflow = 'hidden';
        title.style.textOverflow = 'ellipsis';
        title.textContent = lang === 'vi' ? f.titleVi : f.titleEn;

        const desc = document.createElement('div');
        desc.className = 'similar-desc';
        desc.textContent = lang === 'vi' ? f.descVi : f.descEn;

        info.appendChild(title);
        info.appendChild(meta);
        info.appendChild(desc);
        card.appendChild(img);
        card.appendChild(info);
        similarGrid.appendChild(card);
    });

    // Hiển thị modal
    document.getElementById('infoModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function updateMyListBtnState(btn, filmId, lang) {
    if (isInMyList(filmId)) {
        btn.innerHTML = `➖ ${lang === 'vi' ? 'Xóa khỏi danh sách' : 'Remove from List'}`;
    } else {
        btn.innerHTML = `➕ ${lang === 'vi' ? 'Danh sách của tôi' : 'My List'}`;
    }
}

function closeInfoModalBtn() {
    document.getElementById('infoModal').classList.remove('show');
    document.body.style.overflow = '';
}

function closeInfoModal(e) {
    if (e.target === document.getElementById('infoModal')) {
        closeInfoModalBtn();
    }
}

// Đóng modal bằng ESC
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeInfoModalBtn();
});

// ===== ẨN MENU KHI CUỘN =====
let lastScroll = 0;
window.addEventListener('scroll', function () {
    const menu = document.getElementById('mainMenu');
    if (!menu) return;
    const scrollY = window.scrollY;
    if (scrollY > lastScroll && scrollY > 100) {
        menu.style.transform = 'translateY(-100%)';
    } else {
        menu.style.transform = 'translateY(0)';
    }
    lastScroll = scrollY;
});
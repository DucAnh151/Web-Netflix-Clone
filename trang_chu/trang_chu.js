/**
 * Main Controller for Netflix Home Page
 * Handles layout routing, rendering movies via TMDB API or local fallback,
 * search autocomplete, quick profile switcher, details modal, and trailers.
 * 
 * Trình Điều Khiển Chính của Trang Chủ Netflix
 * Quản lý định tuyến tab, hiển thị danh mục phim từ TMDB API hoặc dữ liệu dự phòng,
 * tìm kiếm gợi ý nhanh, chuyển đổi profile nhanh, modal chi tiết và trailer.
 */

// Genre map to resolve similar movies for modal recommendations
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

// ===== SYSTEM INITIALIZATION =====
// ===== KHỞI CHẠY HỆ THỐNG =====
window.onload = function () {
    // 1. Authentication check
    const user = checkAuth();
    if (!user) return;

    // Display active profile avatar and switcher dropdown
    updateUserProfileDisplay();
    renderQuickProfileSwitcher();

    // 2. Event Listeners for settings & lists modifications
    window.addEventListener('languagechanged', () => {
        renderPage();
    });
    
    window.addEventListener('mylistchanged', () => {
        if (window.location.hash === '#my-list') {
            renderPage();
        }
    });

    window.addEventListener('profilechanged', () => {
        updateUserProfileDisplay();
        renderQuickProfileSwitcher();
        renderPage();
        
        // Show Quick Toast notification on profile switch
        const activeProfile = getActiveProfile();
        if (typeof showToast === 'function') {
            const lang = getLanguage();
            const msg = lang === 'vi' 
                ? `Đã chuyển sang hồ sơ ${activeProfile.name}` 
                : `Switched to profile ${activeProfile.name}`;
            showToast(msg);
        }
    });

    // 3. Setup dynamic tab routing based on URL Hash
    window.addEventListener('hashchange', handleRouting);
    handleRouting();
    
    // Auto-close dropdowns on clicking out
    document.addEventListener('click', closeAllDropdowns);
};

/**
 * Update Header Avatar and Dropdown User name
 * Cập nhật avatar và tên người dùng ở Header
 */
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

/**
 * Render list of other profiles for quick switching in the header dropdown
 * Hiển thị danh sách các hồ sơ khác để chuyển đổi nhanh ở Header
 */
function renderQuickProfileSwitcher() {
    const listContainer = document.getElementById('dropdownProfilesList');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    const profiles = getProfiles();
    const active = getActiveProfile();
    
    profiles.forEach(p => {
        if (p.id !== active.id) {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'dropdown-item';
            item.style.padding = '8px 16px';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '10px';
            
            item.onclick = (e) => {
                e.preventDefault();
                setActiveProfile(p);
            };
            
            item.innerHTML = `
                <div class="avatar-circle-small" style="background-color: ${p.avatar || '#E50914'}">${p.name.charAt(0).toUpperCase()}</div>
                <span>${p.name}</span>
            `;
            listContainer.appendChild(item);
        }
    });
}

// ===== TAB ROUTING =====
function handleRouting() {
    const hash = window.location.hash || '#all';
    
    // Toggle active class on links
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

    // Reset search bar on tab changes
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.classList.remove('open');
    }

    renderPage();
}

// ===== RENDER PAGE SECTIONS =====
function renderPage() {
    const hash = window.location.hash || '#all';
    const lang = getLanguage();
    
    // 1. Load main tab banner
    updateBannerForTab(hash, lang);
    
    // 2. Fetch and render movie sliders
    const container = document.getElementById('filmListsContainer');
    if (!container) return;
    
    // Render placeholders
    renderSkeletons(container);
    
    // Simulated load delay to highlight skeleton transitions
    setTimeout(async () => {
        container.innerHTML = '';
        if (hash === '#my-list') {
            await renderMyListTab(container, lang);
        } else if (hash === '#new') {
            await renderNewAndPopularTab(container, lang);
        } else if (hash === '#tv-shows') {
            await renderCategorizedTab(container, 'tv', lang);
        } else if (hash === '#movies') {
            await renderCategorizedTab(container, 'movie', lang);
        } else {
            await renderHomeTab(container, lang);
        }
    }, 400);
}

/**
 * Render skeleton loading row blocks
 */
function renderSkeletons(container) {
    container.innerHTML = '';
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    
    for (let r = 0; r < 3; r++) {
        const section = document.createElement('div');
        section.className = 'film-section';
        
        const titlePlaceholder = document.createElement('div');
        titlePlaceholder.style.width = '180px';
        titlePlaceholder.style.height = '20px';
        titlePlaceholder.style.marginBottom = '14px';
        titlePlaceholder.style.borderRadius = '4px';
        titlePlaceholder.style.animation = isLight 
            ? 'skeleton-loading-light 1s linear infinite alternate' 
            : 'skeleton-loading 1s linear infinite alternate';
        section.appendChild(titlePlaceholder);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'slider-container-wrapper';
        
        const filmListDiv = document.createElement('div');
        filmListDiv.className = 'menu_phim';
        
        for (let c = 0; c < 6; c++) {
            const card = document.createElement('div');
            card.className = 'skeleton-card';
            filmListDiv.appendChild(card);
        }
        
        wrapper.appendChild(filmListDiv);
        section.appendChild(wrapper);
        container.appendChild(section);
    }
}

/**
 * Update Home page main Banner details asynchronously
 */
async function updateBannerForTab(hash, lang) {
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

    // Load trending or popular movies list as candidates
    let candidates = [];
    let badgeText = lang === 'vi' ? '🔥 #1 Đề cử tuần này' : '🔥 #1 Recommended This Week';

    try {
        if (hash === '#tv-shows') {
            candidates = await TMDB.getPopularTVShows();
            badgeText = lang === 'vi' ? '📺 Phim truyền hình hot' : '📺 Hot TV Show';
        } else if (hash === '#movies') {
            candidates = await TMDB.getPopularMovies();
            badgeText = lang === 'vi' ? '🎬 Phim bom tấn ăn khách' : '🎬 Blockbuster Movie';
        } else if (hash === '#new') {
            candidates = await TMDB.getTrending();
            badgeText = lang === 'vi' ? '✨ Mới phát hành' : '✨ Newly Released';
        } else if (hash === '#my-list') {
            const myListIds = getMyList();
            if (myListIds.length > 0) {
                const firstId = myListIds[0];
                const detail = await TMDB.getDetails(firstId);
                candidates = [detail];
                badgeText = lang === 'vi' ? '💖 Trong danh sách của bạn' : '💖 In Your List';
            }
        }
    } catch (e) {
        console.warn("Banner API fetch error, fallback to static:", e);
    }

    // Default Fallback to static movies if array is empty
    if (candidates.length === 0) {
        candidates = listFilm;
    }

    const featuredFilm = candidates[0] || listFilm[0];

    // Populate Banner elements
    bannerEl.style.backgroundImage = `url('${featuredFilm.bannerImg}')`;
    if (badgeEl) badgeEl.textContent = badgeText;
    if (titleEl) titleEl.textContent = lang === 'vi' ? featuredFilm.titleVi : featuredFilm.titleEn;
    if (viewsEl) viewsEl.textContent = `👁 ${featuredFilm.views} ${lang === 'vi' ? 'lượt xem' : 'views'}`;
    if (ratingEl) ratingEl.textContent = `⭐ ${featuredFilm.rating}/10`;
    if (yearEl) yearEl.textContent = featuredFilm.year;
    if (descEl) descEl.textContent = lang === 'vi' ? featuredFilm.descVi : featuredFilm.descEn;

    if (playBtn) {
        playBtn.innerHTML = `▶ ${lang === 'vi' ? 'Xem ngay' : 'Play'}`;
        playBtn.onclick = () => watchMovie(featuredFilm.id);
    }
    if (infoBtn) {
        infoBtn.innerHTML = `ℹ ${lang === 'vi' ? 'Thông tin' : 'More Info'}`;
        infoBtn.onclick = () => showMovieInfo(featuredFilm.id);
    }
}

// RENDER TAB: Home
async function renderHomeTab(container, lang) {
    // 1. Render Continue Watching row
    const continueWatchingFilms = getContinueWatchingFilms();
    if (continueWatchingFilms.length > 0) {
        const title = lang === 'vi' ? 'Tiếp tục xem' : 'Continue Watching';
        createMovieRow(container, title, continueWatchingWatchingWithProgress(continueWatchingFilms), lang);
    }

    // 2. Fetch TMDB lists and populate categories
    try {
        const trending = await TMDB.getTrending();
        if (trending.length > 0) {
            createMovieRow(container, lang === 'vi' ? 'Đề cử cho bạn' : 'Recommended for You', trending, lang);
        }

        const action = await TMDB.getByGenre(28, 'movie'); // Genre ID 28 is Action
        if (action.length > 0) {
            createMovieRow(container, lang === 'vi' ? 'Phim Hành động' : 'Action Movies', action, lang);
        }

        const horror = await TMDB.getByGenre(27, 'movie'); // Genre ID 27 is Horror
        if (horror.length > 0) {
            createMovieRow(container, lang === 'vi' ? 'Phim Kinh dị' : 'Horror Movies', horror, lang);
        }

        const animation = await TMDB.getByGenre(16, 'movie'); // Genre ID 16 is Animation
        if (animation.length > 0) {
            createMovieRow(container, lang === 'vi' ? 'Hoạt hình chọn lọc' : 'Featured Animation', animation, lang);
        }
    } catch (error) {
        console.error("TMDB render tab error:", error);
    }
}

// RENDER TAB: Categories Movie/TV
async function renderCategorizedTab(container, type, lang) {
    const films = type === 'tv' ? await TMDB.getPopularTVShows() : await TMDB.getPopularMovies();
    const title = type === 'tv' 
        ? (lang === 'vi' ? 'Danh sách Phim truyền hình phổ biến' : 'Popular TV Shows')
        : (lang === 'vi' ? 'Danh sách Phim lẻ phổ biến' : 'Popular Movies');
        
    createMovieRow(container, title, films, lang);
}

// RENDER TAB: New & Popular
async function renderNewAndPopularTab(container, lang) {
    const trending = await TMDB.getTrending();
    const title = lang === 'vi' ? 'Mới & Phổ biến' : 'New & Popular';
    createMovieRow(container, title, trending, lang);
}

// RENDER TAB: My List
async function renderMyListTab(container, lang) {
    const myListIds = getMyList();
    const films = [];
    
    for (const id of myListIds) {
        try {
            const detail = await TMDB.getDetails(id);
            if (detail) films.push(detail);
        } catch (e) {
            console.warn("My List fetch detail warning:", e);
        }
    }
    
    const title = lang === 'vi' ? 'Danh sách của tôi' : 'My List';

    if (films.length === 0) {
        const titleEl = document.createElement('h2');
        titleEl.className = 'loai-phim';
        titleEl.textContent = title;
        container.appendChild(titleEl);

        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-list-msg';
        emptyMsg.textContent = lang === 'vi' 
            ? 'Danh sách của bạn đang trống. Hãy thêm phim vào danh sách yêu thích!' 
            : 'Your list is empty. Add some movies to get started!';
        container.appendChild(emptyMsg);
    } else {
        createMovieRow(container, title, films, lang);
    }
}

/**
 * Help map continue watching list items to correct progress percent attributes
 */
function continueWatchingWatchingWithProgress(continueWatchingFilms) {
    const progressList = getWatchProgressList();
    return continueWatchingFilms.map(film => {
        const prog = progressList.find(p => p.filmId === film.id);
        if (prog) {
            return { ...film, progressPercent: prog.progressPercent };
        }
        return film;
    });
}

function getContinueWatchingFilms() {
    const progressList = getWatchProgressList();
    const films = [];
    progressList.forEach(item => {
        // Find inside listFilm (static)
        let film = listFilm.find(f => f.id === item.filmId);
        
        // If not found in static listFilm, it might be a TMDB movie, so we construct a shell object
        // The detailed details will fetch when they click Info Modal
        if (!film && item.filmId.includes('_')) {
            const parts = item.filmId.split('_');
            const type = parts[0];
            const tmdbId = parts[1];
            film = {
                id: item.filmId,
                tmdbId: tmdbId,
                type: type,
                titleVi: `Phim đã lưu (${tmdbId})`,
                titleEn: `Saved Film (${tmdbId})`,
                bannerImg: '../assets/netflix.jpg',
                thumbImg: '../assets/netflix.jpg'
            };
        }
        
        if (film) {
            films.push(film);
        }
    });
    return films;
}

// ===== SLIDER CREATOR AND MOUNTING =====
function createMovieRow(parentContainer, titleText, films, lang) {
    const section = document.createElement('div');
    section.className = 'film-section';

    const h2 = document.createElement('h2');
    h2.className = 'loai-phim';
    h2.textContent = titleText;
    section.appendChild(h2);

    const wrapper = document.createElement('div');
    wrapper.className = 'slider-container-wrapper';

    // Scroll Left Button
    const btnLeft = document.createElement('button');
    btnLeft.className = 'slider-btn slider-btn-left';
    btnLeft.innerHTML = '‹';
    btnLeft.onclick = () => {
        filmListDiv.scrollBy({ left: -600, behavior: 'smooth' });
    };

    // Scroll Right Button
    const btnRight = document.createElement('button');
    btnRight.className = 'slider-btn slider-btn-right';
    btnRight.innerHTML = '›';
    btnRight.onclick = () => {
        filmListDiv.scrollBy({ left: 600, behavior: 'smooth' });
    };

    const filmListDiv = document.createElement('div');
    filmListDiv.className = 'menu_phim';

    // Render each film card
    films.forEach(film => {
        const card = document.createElement('div');
        card.className = 'film-card';
        card.onclick = () => showMovieInfo(film.id);

        const img = document.createElement('img');
        img.className = 'img';
        img.src = film.thumbImg;
        img.alt = film.titleVi;
        img.draggable = false;

        const overlay = document.createElement('div');
        overlay.className = 'film-overlay';
        overlay.innerHTML = `<span>▶</span>`;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'film-title';
        titleDiv.textContent = lang === 'vi' ? film.titleVi : film.titleEn;

        card.appendChild(img);
        card.appendChild(overlay);
        card.appendChild(titleDiv);

        // Append Red Progress Bar if watched progress exists
        if (film.progressPercent !== undefined) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-bar-container';
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-bar-fill';
            progressFill.style.width = `${film.progressPercent}%`;
            progressContainer.appendChild(progressFill);
            card.appendChild(progressContainer);
        }

        filmListDiv.appendChild(card);
    });

    wrapper.appendChild(btnLeft);
    wrapper.appendChild(filmListDiv);
    wrapper.appendChild(btnRight);
    section.appendChild(wrapper);
    parentContainer.appendChild(section);

    setupDragToScroll(filmListDiv);
}

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

// ===== SEARCH CONTROLLER WITH DEBOUNCE AND AUTOCOMPLETE =====
let searchTimer = null;
function toggleSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.classList.toggle('open');
    if (input.classList.contains('open')) {
        input.focus();
    }
}

async function handleSearch() {
    clearTimeout(searchTimer);
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const autocomplete = document.getElementById('searchAutocomplete');
    if (!autocomplete) return;

    if (!query) {
        autocomplete.classList.remove('show');
        renderPage();
        return;
    }

    searchTimer = setTimeout(async () => {
        const lang = getLanguage();
        // Fetch Search Results from TMDB API
        const results = await TMDB.search(query);

        autocomplete.innerHTML = '';
        if (results.length === 0) {
            autocomplete.innerHTML = `<div class="autocomplete-no-match">${lang === 'vi' ? 'Không tìm thấy phim phù hợp' : 'No matching movies found'}</div>`;
        } else {
            results.slice(0, 5).forEach(film => { // Limit autocomplete list to 5 items
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.onclick = (e) => {
                    e.stopPropagation();
                    showMovieInfo(film.id);
                    autocomplete.classList.remove('show');
                    document.getElementById('searchInput').value = '';
                };

                item.innerHTML = `
                    <img class="autocomplete-thumb" src="${film.thumbImg}" alt="${film.titleVi}">
                    <span class="autocomplete-title">${lang === 'vi' ? film.titleVi : film.titleEn}</span>
                `;
                autocomplete.appendChild(item);
            });
        }
        autocomplete.classList.add('show');

        // Bind Enter key to render full page search results
        const input = document.getElementById('searchInput');
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                autocomplete.classList.remove('show');
                performFullSearch(query, results, lang);
            }
        };
    }, 300);
}

function performFullSearch(query, results, lang) {
    const container = document.getElementById('filmListsContainer');
    if (!container) return;

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
}

// ===== HEADER DROPDOWN HANDLERS =====
function toggleDropdown(e) {
    e.stopPropagation();
    document.getElementById('dropdownMenu').classList.toggle('show');
    document.querySelector('.avatar-wrapper').classList.toggle('open');
    
    document.getElementById('langDropdown').classList.remove('show');
    document.getElementById('bellPopover').classList.remove('show');
}

function toggleLangDropdown(e) {
    e.stopPropagation();
    document.getElementById('langDropdown').classList.toggle('show');
    
    document.getElementById('dropdownMenu').classList.remove('show');
    document.querySelector('.avatar-wrapper').classList.remove('open');
    document.getElementById('bellPopover').classList.remove('show');
}

function toggleBell(e) {
    e.stopPropagation();
    document.getElementById('bellPopover').classList.toggle('show');
    
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

    const searchWrapper = document.querySelector('.search-wrapper');
    if (searchWrapper && !searchWrapper.contains(e.target)) {
        const autocomplete = document.getElementById('searchAutocomplete');
        if (autocomplete) autocomplete.classList.remove('show');
    }
}

// SIGN OUT
function doLogout() {
    sessionStorage.removeItem('netflix_user');
    localStorage.removeItem('netflix_remember');
    window.location.href = '../login/login.html';
}

// REDIRECT TO WATCH PAGE
function watchMovie(filmId) {
    window.location.href = `../xem_phim/xem_phim.html?id=${filmId}`;
}

// ===== NETFLIX-STYLE MOVIE INFO MODAL =====
async function showMovieInfo(filmId) {
    const lang = getLanguage();
    
    // Fetch details asynchronously from TMDB (or static fallback)
    const film = await TMDB.getDetails(filmId);
    if (!film) return;

    // 1. Populate details into Info Modal elements
    document.getElementById('modalTitle').textContent = lang === 'vi' ? film.titleVi : film.titleEn;
    document.getElementById('modalBanner').style.backgroundImage = `url('${film.bannerImg}')`;
    document.getElementById('modalRating').textContent = `⭐ ${film.rating}`;
    document.getElementById('modalYear').textContent = film.year;
    document.getElementById('modalDuration').textContent = film.duration;
    document.getElementById('modalDesc').textContent = lang === 'vi' ? film.descVi : film.descEn;
    
    document.getElementById('modalCast').textContent = lang === 'vi' ? film.castVi : film.castEn;
    document.getElementById('modalDirector').textContent = film.director;
    document.getElementById('modalCategory').textContent = lang === 'vi' ? film.categoryVi : film.categoryEn;

    // 2. Play and My List Buttons
    const playBtn = document.getElementById('modalPlayBtn');
    playBtn.innerHTML = `▶ ${lang === 'vi' ? 'Xem ngay' : 'Play'}`;
    playBtn.onclick = () => watchMovie(film.id);

    const trailerBtn = document.getElementById('modalTrailerBtn');
    if (trailerBtn) {
        trailerBtn.innerHTML = `🎬 ${lang === 'vi' ? 'Xem Trailer' : 'Watch Trailer'}`;
        trailerBtn.onclick = () => {
            const trailerModal = document.getElementById('trailerModal');
            const container = document.getElementById('trailerVideoContainer');
            if (trailerModal && container) {
                container.innerHTML = `<iframe src="${film.videoUrl}?autoplay=1&rel=0" style="width:100%; height:100%; border:none;" allowfullscreen allow="autoplay"></iframe>`;
                trailerModal.classList.add('show');
            }
        };
    }

    const myListBtn = document.getElementById('modalMyListBtn');
    updateMyListBtnState(myListBtn, film.id, lang);
    myListBtn.onclick = () => {
        const added = toggleMyList(film.id);
        updateMyListBtnState(myListBtn, film.id, lang);
        
        // Show Toast quick notification
        const filmName = lang === 'vi' ? film.titleVi : film.titleEn;
        if (typeof showToast === 'function') {
            const msg = added 
                ? (lang === 'vi' ? `Đã thêm "${filmName}" vào danh sách!` : `Added "${filmName}" to My List!`)
                : (lang === 'vi' ? `Đã xóa "${filmName}" khỏi danh sách!` : `Removed "${filmName}" from My List!`);
            showToast(msg);
        }
    };

    // 3. Render recommendations category list inside modal
    const similarGrid = document.getElementById('modalSimilarGrid');
    similarGrid.innerHTML = '';
    
    let similarFilms = [];
    try {
        const genreId = categoryGenreMap[film.categoryVi] || categoryGenreMap[film.categoryEn] || 28;
        similarFilms = await TMDB.getByGenre(genreId, film.type);
    } catch (e) {
        similarFilms = listFilm;
    }

    if (similarFilms.length === 0) {
        similarFilms = listFilm;
    }

    // Limit modal similar suggestions to 3 items
    similarFilms.slice(0, 3).forEach(f => {
        const card = document.createElement('div');
        card.className = 'similar-card';
        card.onclick = () => {
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

    document.getElementById('infoModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function updateMyListBtnState(btn, filmId, lang) {
    if (isInMyList(filmId)) {
        btn.innerHTML = `➖ ${lang === 'vi' ? 'Xóa khỏi danh sách' : 'Remove from List'}`;
        btn.classList.add('in-list');
    } else {
        btn.innerHTML = `➕ ${lang === 'vi' ? 'Danh sách của tôi' : 'My List'}`;
        btn.classList.remove('in-list');
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

function closeTrailerModalBtn() {
    const trailerModal = document.getElementById('trailerModal');
    if (trailerModal) trailerModal.classList.remove('show');
    const container = document.getElementById('trailerVideoContainer');
    if (container) container.innerHTML = '';
}

function closeTrailerModal(e) {
    if (e.target === document.getElementById('trailerModal')) {
        closeTrailerModalBtn();
    }
}

// Close Modal on ESC key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeInfoModalBtn();
        closeTrailerModalBtn();
    }
});

// ===== DYNAMIC MENU OFFSET ON SCROLL =====
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
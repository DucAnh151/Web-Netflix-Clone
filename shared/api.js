/**
 * TMDB API Integration Module for Netflix Clone
 * Integrates TMDB (The Movie Database) movies, TV shows, search, and trailers.
 * Automatically wraps TMDB API responses into the local listFilm schema.
 * Supports automatic fallback to static listFilm from movies.js on errors.
 * 
 * Module Tích Hợp API TMDB cho Netflix Clone
 * Kết nối danh sách phim, tìm kiếm, trailer từ TMDB API.
 * Tự động ánh xạ cấu trúc dữ liệu từ TMDB sang cấu trúc listFilm cũ.
 * Tự động chuyển về dữ liệu tĩnh (movies.js) nếu API lỗi hoặc không có mạng.
 */

// TMDB configurations
const TMDB_API_KEY = '841804ee933a30364d0084f67c29fb91'; // Public TMDB API Key for demo purposes
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Genre ID to Vietnamese mapping
// Bảng quy đổi Thể loại ID sang tên Tiếng Việt
const genreMapVi = {
    28: 'Hành động',
    12: 'Phiêu lưu',
    16: 'Hoạt hình',
    35: 'Hài hước',
    80: 'Hình sự',
    99: 'Tài liệu',
    18: 'Chính kịch',
    10751: 'Gia đình',
    14: 'Kỳ ảo',
    36: 'Lịch sử',
    27: 'Kinh dị',
    10402: 'Nhạc phim',
    9648: 'Bí ẩn',
    10749: 'Lãng mạn',
    878: 'Khoa học viễn tưởng',
    10770: 'Phim truyền hình',
    53: 'Giật gân',
    10752: 'Chiến tranh',
    37: 'Miền tây',
    10759: 'Hành động & Phiêu lưu',
    10762: 'Trẻ em',
    10765: 'Khoa học viễn tưởng & Kỳ ảo',
    10768: 'Chiến tranh & Chính trị'
};

function mapGenresToCategoryVi(genreIds) {
    if (!genreIds || genreIds.length === 0) return 'Phim';
    return genreMapVi[genreIds[0]] || 'Phim';
}

/**
 * Maps standard TMDB list item to the local listFilm format
 * Ánh xạ dữ liệu danh sách TMDB sang cấu trúc listFilm cũ
 */
function mapTMDBMovie(item, type = 'movie') {
    const year = new Date(item.release_date || item.first_air_date || Date.now()).getFullYear();
    const bannerImg = item.backdrop_path 
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` 
        : '../assets/netflix.jpg';
    const thumbImg = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : '../assets/netflix.jpg';
        
    const rating = item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 7.0;
    
    return {
        id: `${type}_${item.id}`, // Prepend type to ensure unique string IDs (e.g. movie_299534)
        tmdbId: item.id,
        type: type,
        titleVi: item.title || item.name,
        titleEn: item.original_title || item.original_name || item.title || item.name,
        descVi: item.overview || 'Chưa có mô tả tiếng Việt từ TMDB.',
        descEn: item.overview || 'No English overview available from TMDB.',
        year: year,
        views: `${Math.floor(item.popularity / 100 || 1)}M`, // Mock popularity as views
        rating: rating,
        duration: type === 'tv' ? 'N/A' : '120 phút',
        castVi: 'Đang tải...',
        castEn: 'Loading...',
        director: 'Đang tải...',
        videoUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c', // Fallback default trailer
        bannerImg: bannerImg,
        thumbImg: thumbImg,
        categoryVi: mapGenresToCategoryVi(item.genre_ids),
        categoryEn: 'Action & Adventure'
    };
}

/**
 * Maps detailed TMDB item (with credits, videos) to the local listFilm format
 * Ánh xạ dữ liệu chi tiết TMDB (kèm credit, video) sang cấu trúc listFilm cũ
 */
function mapTMDBDetails(details, type) {
    const year = new Date(details.release_date || details.first_air_date || Date.now()).getFullYear();
    const bannerImg = details.backdrop_path 
        ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` 
        : '../assets/netflix.jpg';
    const thumbImg = details.poster_path 
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}` 
        : '../assets/netflix.jpg';
        
    // Cast & Crew mapping
    let cast = 'N/A';
    let director = 'N/A';
    if (details.credits) {
        if (details.credits.cast && details.credits.cast.length > 0) {
            cast = details.credits.cast.slice(0, 5).map(c => c.name).join(', ');
        }
        if (details.credits.crew) {
            const dirObj = details.credits.crew.find(c => c.job === 'Director');
            if (dirObj) director = dirObj.name;
        }
    }

    // Trailer video selection
    let videoUrl = 'https://www.youtube.com/embed/TcMBFSGVi1c'; // default fallback
    if (details.videos && details.videos.results) {
        const trailer = details.videos.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        if (trailer) {
            videoUrl = `https://www.youtube.com/embed/${trailer.key}`;
        }
    }

    const rating = details.vote_average ? parseFloat(details.vote_average.toFixed(1)) : 7.0;
    const duration = details.runtime 
        ? `${details.runtime} phút` 
        : (details.number_of_seasons ? `${details.number_of_seasons} mùa` : 'N/A');

    return {
        id: `${type}_${details.id}`,
        tmdbId: details.id,
        type: type,
        titleVi: details.title || details.name,
        titleEn: details.original_title || details.original_name || details.title || details.name,
        descVi: details.overview || 'Chưa có mô tả tiếng Việt từ TMDB.',
        descEn: details.overview || 'No English overview available.',
        year: year,
        views: `${Math.floor(details.popularity / 100 || 1)}M`,
        rating: rating,
        duration: duration,
        castVi: cast,
        castEn: cast,
        director: director,
        videoUrl: videoUrl,
        bannerImg: bannerImg,
        thumbImg: thumbImg,
        categoryVi: details.genres && details.genres.length > 0 ? details.genres[0].name : 'Phim',
        categoryEn: details.genres && details.genres.length > 0 ? details.genres[0].name : 'Phim'
    };
}

/**
 * Fetch movies from TMDB API
 * Tải danh sách phim từ TMDB API
 */
async function fetchFromTMDB(endpoint, params = {}) {
    const urlParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        ...params
    });
    const url = `${TMDB_BASE_URL}${endpoint}?${urlParams.toString()}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`TMDB HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`TMDB API call failed at ${endpoint}:`, error);
        throw error;
    }
}

/**
 * PUBLIC API METHODS
 */
const TMDB = {
    // 1. Fetch Trending movies and tv shows
    async getTrending() {
        try {
            const data = await fetchFromTMDB('/trending/all/week', { language: 'vi-VN' });
            return data.results.map(item => mapTMDBMovie(item, item.media_type));
        } catch (e) {
            return listFilm; // fallback to static movies list
        }
    },

    // 2. Fetch Popular Movies
    async getPopularMovies() {
        try {
            const data = await fetchFromTMDB('/movie/popular', { language: 'vi-VN' });
            return data.results.map(item => mapTMDBMovie(item, 'movie'));
        } catch (e) {
            return listFilm.filter(f => f.type === 'movie');
        }
    },

    // 3. Fetch Popular TV Shows
    async getPopularTVShows() {
        try {
            const data = await fetchFromTMDB('/tv/popular', { language: 'vi-VN' });
            return data.results.map(item => mapTMDBMovie(item, 'tv'));
        } catch (e) {
            return listFilm.filter(f => f.type === 'tv');
        }
    },

    // 4. Fetch Movies/TV Shows by Genre ID
    async getByGenre(genreId, type = 'movie') {
        try {
            const data = await fetchFromTMDB(`/discover/${type}`, { 
                language: 'vi-VN',
                with_genres: genreId
            });
            return data.results.map(item => mapTMDBMovie(item, type));
        } catch (e) {
            return listFilm.filter(f => f.type === type);
        }
    },

    // 5. Search Movies and TV Shows (Autosuggest & Page search)
    async search(query) {
        if (!query) return [];
        try {
            const data = await fetchFromTMDB('/search/multi', { 
                language: 'vi-VN',
                query: query 
            });
            // Filter only movies and tv shows, skip persons
            return data.results
                .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
                .map(item => mapTMDBMovie(item, item.media_type));
        } catch (e) {
            // Fallback search static list
            const q = query.toLowerCase();
            return listFilm.filter(film => {
                return film.titleVi.toLowerCase().includes(q) || 
                       film.titleEn.toLowerCase().includes(q);
            });
        }
    },

    // 6. Fetch Movie or TV details with credits & video trailers
    async getDetails(id) {
        // Parse unique ID (format: movie_299534 or tv_12345)
        const parts = id.split('_');
        const type = parts.length > 2 ? parts[0] : (listFilm.find(f => f.id === id)?.type || 'movie');
        const tmdbId = parts.length > 1 ? parts[1] : id;

        // If ID is not numeric (static local IDs like 'marvel'), return local movie
        if (isNaN(tmdbId)) {
            const localMovie = listFilm.find(f => f.id === id);
            return localMovie || listFilm[0];
        }

        try {
            const data = await fetchFromTMDB(`/${type}/${tmdbId}`, { 
                language: 'vi-VN',
                append_to_response: 'videos,credits'
            });
            return mapTMDBDetails(data, type);
        } catch (e) {
            // Fallback to local movies
            const localMovie = listFilm.find(f => f.id === id);
            return localMovie || listFilm[0];
        }
    }
};

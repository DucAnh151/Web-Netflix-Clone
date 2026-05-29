/**
 * Video Player Module for Netflix Clone
 * Handles rendering the video player, autoplay policies, watch progress tracking,
 * and presenting a custom interactive overlay to resume watching.
 * 
 * Module Trình phát Video cho Netflix Clone
 * Quản lý hiển thị trình phát, chính sách phát tự động (autoplay), theo dõi tiến trình
 * xem phim và hiển thị hộp thoại tùy chỉnh để xem tiếp từ vị trí cũ.
 */

function initVideoPlayer(film) {
    const videoContainer = document.getElementById('videoContainer');
    if (!videoContainer) return;

    // Use project sample video if film has an ID, fallback to YouTube
    // Sử dụng video mẫu nếu phim có ID hợp lệ, ngược lại sử dụng link Youtube nhúng
    if (film.id) {
        // Added 'muted' to comply with browser autoplay policies
        // Thêm 'muted' để hỗ trợ tự động phát (autoplay) theo chính sách của trình duyệt
        videoContainer.innerHTML = `
            <video id="mainVideo" controls autoplay muted poster="${film.bannerImg}">
                <source src="../assets/video.mp4" type="video/mp4">
                Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
            </video>
        `;

        const video = document.getElementById('mainVideo');
        setupProgressTracking(video, film.id);
    } else {
        // Append autoplay=1 and mute=1 to bypass browser autoplay blocks
        // Thêm autoplay=1 và mute=1 để tự động phát iframe YouTube
        videoContainer.innerHTML = `
            <iframe src="${film.videoUrl}?autoplay=1&mute=1&rel=0" allowfullscreen allow="autoplay"></iframe>
        `;
    }
}

/**
 * Setup tracking events on the native HTML5 <video> element
 * Thiết lập các sự kiện theo dõi tiến trình xem của thẻ <video>
 */
function setupProgressTracking(video, filmId) {
    let lastSavedTime = 0;

    // 1. Check for saved watch progress once metadata is loaded
    // Kiểm tra tiến trình xem khi đã tải xong dữ liệu cấu trúc (metadata)
    video.addEventListener('loadedmetadata', () => {
        const progress = getMovieProgress(filmId);
        // Only prompt to resume if watch progress is substantial (> 5 seconds)
        // Chỉ nhắc nhở xem tiếp nếu đã xem qua 5 giây đầu
        if (progress && progress.currentTime > 5) {
            showResumeOverlay(video, progress);
        }
    });

    // 2. Save progress periodically on time updates (throttled to every 2 seconds)
    // Lưu lại tiến trình xem sau mỗi 2 giây thay đổi thời gian phát
    video.addEventListener('timeupdate', () => {
        const currentTime = video.currentTime;
        const duration = video.duration;

        if (currentTime - lastSavedTime >= 2 || lastSavedTime === 0) {
            saveWatchProgress(filmId, currentTime, duration);
            lastSavedTime = currentTime;
        }
    });

    // 3. Clear progress if video finishes playing completely
    // Xóa tiến trình xem khi video phát hết hoàn toàn
    video.addEventListener('ended', () => {
        removeWatchProgress(filmId);
    });
}

/**
 * Render custom overlay to offer resuming watch progress
 * Hiển thị giao diện hộp thoại hỏi xem tiếp từ vị trí cũ
 */
function showResumeOverlay(video, progress) {
    const playerWrapper = document.querySelector('.player-wrapper');
    if (!playerWrapper) return;

    // Format seconds to standard MM:SS
    // Định dạng giây sang phút:giây (ví dụ: 02:45)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const overlay = document.createElement('div');
    overlay.id = 'resumeOverlay';
    overlay.className = 'resume-overlay';
    
    const lang = getLanguage();
    const timeStr = formatTime(progress.currentTime);

    overlay.innerHTML = `
        <p>${lang === 'vi' 
            ? `Bạn có muốn xem tiếp từ vị trí phút ${timeStr}?` 
            : `Would you like to resume watching from ${timeStr}?`}</p>
        <div class="resume-buttons">
            <button class="btn-resume" id="btnResumeConfirm">${lang === 'vi' ? 'Xem tiếp' : 'Resume'}</button>
            <button class="btn-resume-cancel" id="btnResumeCancel">${lang === 'vi' ? 'Bắt đầu lại' : 'Restart'}</button>
        </div>
    `;

    playerWrapper.appendChild(overlay);

    const btnResumeConfirm = document.getElementById('btnResumeConfirm');
    const btnResumeCancel = document.getElementById('btnResumeCancel');

    btnResumeConfirm.onclick = () => {
        video.currentTime = progress.currentTime;
        // Unmute the audio since autoplay had it muted
        // Bật lại âm thanh do cơ chế autoplay tắt tiếng ban đầu
        video.muted = false;
        video.play();
        overlay.remove();
    };

    btnResumeCancel.onclick = () => {
        // Start from beginning and unmute
        // Phát lại từ đầu và bật tiếng
        video.currentTime = 0;
        video.muted = false;
        video.play();
        removeWatchProgress(progress.filmId);
        overlay.remove();
    };

    // Auto dismiss after 8 seconds of inactivity
    // Tự động đóng hộp thoại sau 8 giây nếu không phản hồi
    setTimeout(() => {
        if (document.getElementById('resumeOverlay')) {
            overlay.remove();
        }
    }, 8000);
}

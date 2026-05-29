# Netflix Clone - Premium Frontend Intern Portfolio

A high-fidelity, modern movie streaming web application inspired by Netflix, engineered using HTML5, CSS3, and Vanilla JavaScript. This project is optimized to serve as a robust portfolio piece for a Frontend Developer Intern, demonstrating strong architectural structure, professional API integration, local storage state persistence, and polished UI/UX aesthetics.

[Demo Trực Tuyến / Live Demo](https://your-netflix-clone.vercel.app) *(Deploy via Vercel/Netlify)*

---

## 🌟 Tính Năng Nổi Bật / Key Features

### 1. Tích hợp TMDB API & Cơ chế Dự phòng (TMDB API & Automated Fallback)
* **Real-time Movie Data:** Kết nối trực tiếp với **The Movie Database (TMDB) API** để fetch danh sách phim Đề cử (Trending), Phim chiếu rạp (Popular), Phim truyền hình (TV Shows) và lọc phim theo Thể loại (Genres).
* **Automated Fallback:** Tự động chuyển đổi sang cơ sở dữ liệu tĩnh cục bộ (`movies.js`) trong trường hợp lỗi API Key hoặc mất kết nối mạng, đảm bảo ứng dụng không bao giờ bị sập.
* **Credits & Trailer Fetching:** Tự động lấy danh sách diễn viên (Cast), đạo diễn (Director) thực tế và liên kết trailer YouTube nhúng trực tiếp.

### 2. Tìm kiếm gợi ý & Trễ phím (Search Autocomplete & Debouncing)
* **Autocomplete Dropdown:** Hiển thị danh sách kết quả gợi ý nhanh (bao gồm ảnh poster nhỏ và tiêu đề) ngay dưới ô nhập liệu khi người dùng gõ từ khóa.
* **Performance Debouncing:** Áp dụng kỹ thuật **Debounce (trễ 300ms)** giúp giảm số lượng yêu cầu gọi API liên tục khi gõ phím, tối ưu hóa hiệu năng đường truyền.

### 3. Tiếp tục xem & Thanh tiến trình (Continue Watching & Watch Progress)
* **Watch Progress Bar:** Tự động theo dõi tiến trình xem phim (sử dụng các sự kiện `timeupdate`, `loadedmetadata` và `ended` của HTML5 Video Player) để lưu trữ phần trăm đã xem vào LocalStorage.
* **Continue Watching Row:** Hiển thị một hàng phim cá nhân hóa "Tiếp tục xem" ngay trên trang chủ của từng hồ sơ với thanh màu đỏ hiển thị tỷ lệ đã xem.
* **Auto-Resume Modal:** Khi mở lại phim đang xem dở, hiển thị hộp thoại hỏi người dùng có muốn tiếp tục xem từ phút trước đó hay không.

### 4. Chuyển đổi hồ sơ nhanh (Quick Profile Switcher)
* **Multi-profile Support:** Hỗ trợ quản lý và phân tách dữ liệu cho nhiều hồ sơ khác nhau (User 1, Kid, Dad, Mom).
* **Header Quick Switch:** Cho phép chuyển đổi nhanh hồ sơ trực tiếp thông qua Dropdown ở Header. Dữ liệu Danh sách yêu thích (My List) và Phim đang xem dở sẽ tự động làm mới theo hồ sơ được chọn.

### 5. Trải nghiệm người dùng cao cấp (Premium UI/UX)
* **Skeleton Loading:** Hiệu ứng tải trang dạng khung xương chuyển động mượt mà giúp cải thiện đáng kể chỉ số Cảm nhận thời gian tải trang (Perceived Performance).
* **Toast Notifications:** Các thông báo Toast góc màn hình tự biến mất khi thêm/xóa phim vào Danh sách yêu thích thành công.
* **Drag-to-Scroll Sliders:** Cho phép kéo vuốt ngang các hàng phim bằng chuột trên máy tính hoặc vuốt chạm trên thiết bị di động.
* **Responsive Layout:** Tối ưu hóa hiển thị hoàn hảo trên mọi kích thước màn hình từ điện thoại di động (320px) đến màn hình máy tính lớn.

---

## 📂 Cấu Trúc Thư Mục / Directory Structure

Mã nguồn được tổ chức theo cấu trúc module rõ ràng, phân tách trách nhiệm (Separation of Concerns), giúp dễ bảo trì và mở rộng:

```text
netflix/
├── assets/                  # Tệp tin đa phương tiện (Ảnh nền, Logo, Video mẫu)
├── shared/                  # Thư viện và Tiện ích dùng chung toàn trang
│   ├── api.js               # Lớp API giao tiếp với TMDB, quản lý mapping và fallback
│   ├── common.js            # Quản lý ngôn ngữ, theme, auth, profiles và LocalStorage
│   ├── movies.js            # Danh sách phim tĩnh dùng để hiển thị dự phòng (fallback data)
│   ├── toast.js             # Mã nguồn Logic hiển thị Toast Notification
│   └── toast.css            # Style giao diện Toast Notification
├── trang_chu/               # Trang chủ dự án
│   ├── trang_chu.html
│   ├── trang_chu.css        # Hệ thống layout chính và responsive mobile
│   └── trang_chu.js         # Quản lý sự kiện, autocomplete, banner và tab routing
├── xem_phim/                # Trang xem chi tiết phim và phát video
│   ├── modules/             # Các thành phần chức năng được tách nhỏ (Modular Design)
│   │   ├── videoPlayer.js   # Quản lý player, autoplay policy, watch progress & resume overlay
│   │   ├── reviewSystem.js  # Hệ thống đánh giá sao, bình luận và quy đổi thang điểm 10
│   │   └── recommendations.js # Lọc phim tương tự và điều khiển slider kéo chuột
│   ├── xem_phim.html
│   ├── xem_phim.css
│   └── xem_phim.js          # Trình điều khiển chính (Controller) nạp dữ liệu và điều phối
└── README.md
```

---

## 🛠️ Công Nghệ Sử Dụng / Technologies Used

* **HTML5:** Cấu trúc tài liệu ngữ nghĩa (Semantic HTML5 elements).
* **CSS3:** Sử dụng CSS Variables cho giao diện Sáng/Tối (Dark/Light mode), Flexbox, Grid, Keyframes Animations và Responsive Media Queries.
* **Vanilla JavaScript (ES6+):** Lập trình hướng cấu trúc, Async/Await APIs, DOM Manipulation, và Custom Events.
* **The Movie Database (TMDB) API:** Tích hợp dữ liệu phim toàn cầu.
* **LocalStorage & SessionStorage:** Lưu trữ trạng thái ứng dụng phía client.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử / Installation & Setup

Dự án sử dụng thuần Frontend tĩnh, không cần cài đặt dependencies phức tạp hay build tool, giúp bạn dễ dàng chạy và demo trực tiếp:

1. **Tải dự án về máy:**
   ```bash
   git clone https://github.com/yourusername/netflix-clone.git
   cd netflix-clone
   ```

2. **Chạy thử dự án:**
   * Bạn chỉ cần mở tệp `login/login.html` hoặc `trang_chu/trang_chu.html` trực tiếp trên trình duyệt.
   * Để trải nghiệm tốt nhất các tính năng chuyển trang và cookie/localstorage, nên sử dụng tiện ích mở rộng **Live Server** trong VS Code để tạo một web server cục bộ tại cổng `http://127.0.0.1:5500`.

3. **Cài đặt TMDB API Key của riêng bạn (Tùy chọn):**
   * Mở tệp `shared/api.js`.
   * Thay thế giá trị của hằng số `TMDB_API_KEY` bằng API Key cá nhân của bạn được đăng ký miễn phí tại [The Movie Database](https://www.themoviedb.org/).

---

## ☁️ Hướng Dẫn Deploy Lên Mạng / Deployment Instructions

### Deploy Lên Vercel hoặc Netlify (Hoàn toàn miễn phí):
1. Đẩy mã nguồn dự án lên một kho chứa GitHub công khai hoặc riêng tư.
2. Truy cập [Vercel](https://vercel.com/) hoặc [Netlify](https://www.netlify.com/) và đăng nhập bằng tài khoản GitHub.
3. Chọn **New Project** và nhập kho chứa `netflix-clone` của bạn.
4. Đối với dự án tĩnh thuần túy này, giữ nguyên cấu trúc mặc định và nhấn **Deploy**.
5. Nhận đường dẫn demo trực tuyến và gắn vào CV của bạn!

---

## 📄 Bản Quyền / License

Dự án được xây dựng dưới giấy phép MIT License. Bạn có thể tự do sao chép và phát triển thêm để phục vụ mục đích học tập và xây dựng portfolio cá nhân.

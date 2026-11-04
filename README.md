# Portfolio CV - Lê Xuân Hưng

Website portfolio cá nhân giới thiệu Lê Xuân Hưng, các kỹ năng, dự án tiêu biểu và thông tin liên hệ. Giao diện được xây dựng theo hướng responsive, ưu tiên trải nghiệm trên màn hình nhỏ.

## Chức năng

- Giới thiệu cá nhân và định hướng Frontend Developer.
- Hiển thị các kỹ năng và dự án dưới dạng thẻ.
- Điều hướng đến các phần Giới thiệu, Kỹ năng, Dự án và Liên hệ.
- Bố cục tự điều chỉnh theo kích thước màn hình.
- Cung cấp email và các kênh liên hệ được hiển thị trên trang.

Đây là website tĩnh: hiện không có backend, biểu mẫu gửi dữ liệu hay chức năng tải thông tin từ API.

## Công nghệ

- HTML5.
- CSS3, bao gồm Flexbox, CSS Grid, custom properties và media queries.
- Không cần framework, thư viện JavaScript hay trình quản lý gói để chạy website.

## Yêu cầu môi trường

### Chạy trực tiếp

- Trình duyệt hiện đại như Chrome, Firefox, Edge hoặc Safari.
- Không bắt buộc cài Node.js hay công cụ build.
- Có thể dùng Python 3 để chạy máy chủ tĩnh cục bộ; nếu không có Python, có thể mở trực tiếp `index.html`.

### Chạy bằng Docker

- Docker Engine hoặc Docker Desktop đang hoạt động.
- Kết nối Internet lần đầu để tải image `nginx:alpine` (nếu image chưa có trên máy).

## Cài đặt

Tải hoặc clone mã nguồn về máy. Nếu dùng Git:

```bash
git clone https://github.com/hunglx13/CV.git
cd CV
```

Không cần cài đặt dependencies. Giữ nguyên cấu trúc thư mục để các ảnh và tệp CSS được tải đúng:

```text
index.html
assets/
  css/styles.css
  img/
```

## Cấu hình và tùy chỉnh

- Nội dung, tiêu đề trang và thông tin liên hệ nằm trong `index.html`.
- Giao diện, màu sắc và breakpoint responsive nằm trong `assets/css/styles.css`.
- Ảnh nằm trong `assets/img/`. Khi thay ảnh, cập nhật đường dẫn `src` tương ứng trong `index.html`.
- Email hiện tại là `lexuanhung130908@gmail.com`.
- Liên kết GitHub và LinkedIn trong HTML hiện có `href="#"` (placeholder). Hãy thay bằng URL hồ sơ thật nếu muốn các liên kết này mở đúng trang.
- Các đường dẫn tới ảnh và CSS là đường dẫn tương đối; nên giữ nguyên cấu trúc thư mục khi triển khai.

## Chạy thử

### Windows

Mở PowerShell tại thư mục dự án, sau đó chạy máy chủ tĩnh bằng Python:

```powershell
py -m http.server 8000
```

Mở <http://localhost:8000> trong trình duyệt. Dừng máy chủ bằng `Ctrl+C`.

Nếu không cài Python, mở `index.html` trực tiếp bằng trình duyệt.

### macOS

Mở Terminal tại thư mục dự án:

```bash
python3 -m http.server 8000
```

Mở <http://localhost:8000> trong trình duyệt. Dừng máy chủ bằng `Ctrl+C`.

Nếu không cài Python, mở `index.html` trực tiếp bằng trình duyệt:

```bash
open index.html
```

### Linux

Mở Terminal tại thư mục dự án:

```bash
python3 -m http.server 8000
```

Mở <http://localhost:8000> trong trình duyệt. Dừng máy chủ bằng `Ctrl+C`.

Nếu không cài Python, có thể mở `index.html` trực tiếp bằng trình duyệt hoặc chạy `xdg-open index.html` trên môi trường desktop có hỗ trợ.

## Chạy bằng Docker

Các lệnh bên dưới phục vụ thư mục dự án bằng Nginx trên cổng `8080`. Chạy lệnh tại thư mục chứa `index.html`.

### Windows (PowerShell)

```powershell
docker run --rm -d --name cv-portfolio -p 8080:80 -v "$($PWD.Path):/usr/share/nginx/html:ro" nginx:alpine
```

### macOS và Linux

```bash
docker run --rm -d --name cv-portfolio -p 8080:80 -v "$PWD:/usr/share/nginx/html:ro" nginx:alpine
```

Mở <http://localhost:8080> để xem trang. Để dừng và tự động xóa container:

```bash
docker stop cv-portfolio
```

Nếu cổng `8080` đã được sử dụng, đổi phần `-p 8080:80` thành một cổng trống khác, ví dụ `-p 8081:80`, rồi truy cập cổng mới tương ứng.

## Thông tin liên hệ

- **Tác giả:** Lê Xuân Hưng
- **Email:** [lexuanhung130908@gmail.com](mailto:lexuanhung130908@gmail.com)
- **GitHub:** [github.com/hunglx13](https://github.com/hunglx13)
- **LinkedIn:** linkedin.com/in/lexuanhung

Lưu ý: đường dẫn GitHub và LinkedIn được hiển thị trong trang hiện chưa gắn URL hồ sơ (đang dùng `href="#"`). Cập nhật các liên kết này trong `index.html` trước khi phát hành.
## Kiểm thử (unit tests)

Bộ test dùng **Node.js built-in test runner** (`node:test` + `node:assert/strict`), không cần framework ngoài cho các suite cốt lõi.

```powershell
npm run test:install   # chỉ khi máy chưa có node_modules (hoặc: npm install)
npm test               # markup, asset, CSS, DOM
npm run test:all       # + 7 test trình duyệt thật (Playwright/Chromium)
```

| File | Phạm vi |
| --- | --- |
| `tests/index.html.test.js` | metadata, landmark, thứ tự heading, menu, id duy nhất |
| `tests/assets.test.js` | CSS/ảnh tồn tại trên đĩa, anchor nội trang, placeholder `href="#"`, liên kết liên hệ, thẻ dự án |
| `tests/styles.test.js` | design token, reset, layout (Flexbox/Grid), media query mobile-first, focus-visible, reduced-motion, class HTML ↔ CSS |
| `tests/dom.test.js` | render trong jsdom: nội dung hiển thị, điều hướng anchor, bề mặt accessibility (tự skip nếu thiếu jsdom) |
| `tests/browser.test.js` | Chromium thật ở 375/800/1366px: số cột grid, hướng hero, không tràn ngang, console/request lỗi (tự skip nếu thiếu Playwright) |

Các suite phụ thuộc gói ngoài sẽ **skip** kèm lý do rõ ràng khi môi trường chưa cài, để `npm test` luôn chạy được trên checkout sạch.

# Portfolio CV - Lê Xuân Hưng

Trang portfolio cá nhân giới thiệu Lê Xuân Hưng, các kỹ năng Frontend, một số dự án tiêu biểu và thông tin liên hệ. Đây là website tĩnh được xây dựng bằng HTML và CSS, có thể chạy trực tiếp trên trình duyệt hoặc phục vụ bằng máy chủ web.

## Chức năng

- Giới thiệu cá nhân và định hướng Frontend Developer.
- Hiển thị các kỹ năng: HTML5, CSS3, JavaScript, Responsive Design, Git/GitHub và Figma/Wireframe.
- Trưng bày các dự án minh họa cùng hình ảnh và công nghệ liên quan.
- Điều hướng nhanh đến phần Giới thiệu, Kỹ năng, Dự án và Liên hệ.
- Giao diện responsive cho điện thoại, máy tính bảng và máy tính.
- Cung cấp liên kết email và hồ sơ cá nhân.

## Công nghệ sử dụng

- **HTML5**: cấu trúc nội dung và các vùng ngữ nghĩa.
- **CSS3**: giao diện, Flexbox, CSS Grid và bố cục responsive.
- **JavaScript**: được nêu trong phần kỹ năng/dự án; phiên bản hiện tại không cần bước biên dịch JavaScript để chạy trang.
- **Nginx (Docker)**: tùy chọn để phục vụ website trong container.

## Yêu cầu môi trường

### Chạy trực tiếp hoặc bằng máy chủ cục bộ

- Trình duyệt hiện đại như Chrome, Firefox, Edge hoặc Safari.
- Không cần cài Node.js, npm hay thư viện dự án.
- Python 3 chỉ cần thiết nếu muốn chạy máy chủ HTTP cục bộ theo hướng dẫn bên dưới.

### Chạy bằng Docker

- Docker Engine trên Linux, hoặc Docker Desktop trên Windows/macOS.
- Docker daemon đang hoạt động và có thể tải image `nginx:alpine` ở lần chạy đầu tiên.

## Cài đặt

Tải mã nguồn về máy và mở thư mục dự án:

```bash
git clone https://github.com/hunglx13/CV.git
cd CV
```

Nếu đã có mã nguồn, chuyển đến thư mục chứa `index.html` và `README.md`. Không cần cài thêm gói phụ thuộc.

## Cấu hình

Dự án hiện không có tệp cấu hình môi trường, máy chủ API hay biến môi trường cần thiết. Nội dung trang và thông tin liên hệ được khai báo trực tiếp trong `index.html`; kiểu dáng và breakpoint responsive nằm trong `assets/css/styles.css`; hình ảnh nằm trong `assets/img/`.

Khi thay đổi hình ảnh, hãy cập nhật đường dẫn tương ứng trong `index.html` và giữ nguyên cấu trúc thư mục tương đối để các ảnh hiển thị chính xác.

## Chạy thử

### Mở trực tiếp

Mở tệp `index.html` bằng trình duyệt. Cách này phù hợp để xem nhanh giao diện; dùng máy chủ cục bộ bên dưới nếu muốn kiểm tra trang qua HTTP.

### Windows (PowerShell)

Mở PowerShell tại thư mục dự án, sau đó chạy:

```powershell
py -m http.server 8000
```

Nếu lệnh `py` không có trên máy, thử:

```powershell
python -m http.server 8000
```

### macOS

Mở Terminal tại thư mục dự án và chạy:

```bash
python3 -m http.server 8000
```

### Linux

Mở Terminal tại thư mục dự án và chạy:

```bash
python3 -m http.server 8000
```

Trên Windows, macOS hoặc Linux, mở trình duyệt tại [http://localhost:8000](http://localhost:8000). Dừng máy chủ bằng `Ctrl+C` trong cửa sổ terminal.

## Chạy bằng Docker

Các lệnh sau gắn thư mục dự án vào Nginx ở chế độ chỉ đọc và ánh xạ cổng `8080` trên máy sang cổng `80` trong container. Chạy lệnh tại thư mục chứa `index.html`.

### Windows (PowerShell)

Đảm bảo Docker Desktop đang chạy, sau đó thực hiện:

```powershell
docker run --rm -d --name portfolio-cv -p 8080:80 --mount "type=bind,source=$((Get-Location).Path),target=/usr/share/nginx/html,readonly" nginx:alpine
```

### macOS

Đảm bảo Docker Desktop đang chạy, sau đó thực hiện:

```bash
docker run --rm -d --name portfolio-cv -p 8080:80 --mount "type=bind,source=$(pwd),target=/usr/share/nginx/html,readonly" nginx:alpine
```

### Linux

Đảm bảo Docker Engine đang chạy, sau đó thực hiện:

```bash
docker run --rm -d --name portfolio-cv -p 8080:80 --mount "type=bind,source=$(pwd),target=/usr/share/nginx/html,readonly" nginx:alpine
```

Sau khi container khởi động, truy cập [http://localhost:8080](http://localhost:8080). Dừng container bằng:

```bash
docker stop portfolio-cv
```

## Thông tin liên hệ

- **Tác giả:** Lê Xuân Hưng
- **Email:** [lexuanhung130908@gmail.com](mailto:lexuanhung130908@gmail.com)
- **GitHub:** [github.com/hunglx13](https://github.com/hunglx13)
- **LinkedIn:** [linkedin.com/in/lexuanhung](https://www.linkedin.com/in/lexuanhung/)
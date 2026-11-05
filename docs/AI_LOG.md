# AI Change Log

Ghi lại tại đây mỗi khi có thay đổi lớn ảnh hưởng đến chức năng, giao diện, cấu trúc dự án hoặc cách vận hành. Mỗi mục cần nêu ngày, nội dung thay đổi và các phần liên quan; không ghi các chỉnh sửa nhỏ về định dạng hoặc sửa lỗi chính tả.

## Mẫu ghi nhận

### YYYY-MM-DD — Tên thay đổi

- **Nội dung:** Tóm tắt thay đổi và lý do thực hiện.
- **Tệp/khu vực:** Các tệp hoặc phần chức năng bị ảnh hưởng.
- **Kiểm tra:** Cách xác nhận thay đổi hoạt động đúng.

## Nhật ký

### 2026-11-05 — Khởi tạo AI Change Log

- **Nội dung:** Tạo quy ước ghi lại các thay đổi lớn của dự án trong tệp này.
- **Tệp/khu vực:** `docs/AI_LOG.md`.
- **Kiểm tra:** Xác nhận nội dung nhật ký đã được tạo.

### 2026-11-05 — Bổ sung báo cáo kiểm thử trước bàn giao

- **Nội dung:** Soạn báo cáo kiểm thử cho sáu nhóm tiêu chí bàn giao, ghi rõ các mục chưa có minh chứng và các liên kết placeholder cần xử lý.
- **Tệp/khu vực:** `docs/test_report.md`.
- **Kiểm tra:** Đối chiếu báo cáo với README và mã nguồn; chạy `git diff --check`.

### 2026-11-05 — Quy định minh chứng ảnh responsive

- **Nội dung:** Bổ sung yêu cầu chụp ảnh thực tế cho viewport mobile, tablet và desktop, kèm tên tệp, kích thước gợi ý và trạng thái minh chứng còn thiếu.
- **Tệp/khu vực:** `docs/test_report.md`, `docs/screenshots/`.
- **Kiểm tra:** Xác nhận báo cáo không ghi nhận ảnh chưa được chụp là minh chứng; chạy `git diff --check`.

### 2026-11-05 — Bổ sung ảnh chụp kiểm thử responsive

- **Nội dung:** Chụp trang thực tế tại viewport mobile 390 × 844, tablet 768 × 1024 và desktop 1440 × 900; cập nhật trạng thái và liên kết minh chứng trong báo cáo.
- **Tệp/khu vực:** `docs/screenshots/responsive-mobile-390x844.png`, `docs/screenshots/responsive-tablet-768x1024.png`, `docs/screenshots/responsive-desktop-1440x900.png`, `docs/test_report.md`.
- **Kiểm tra:** Xem lại ba ảnh; xác nhận không tràn ngang và tất cả ảnh trên trang tải hoàn tất ở cả ba viewport; chạy `git diff --check`.

### 2026-11-05 — Chấm điểm rubric A2.2

- **Nội dung:** Bổ sung điểm tạm tính, căn cứ đánh giá và ưu tiên cải thiện cho năm tiêu chí A2.2; ghi rõ GitHub Pages và demo chưa có minh chứng để xác minh.
- **Tệp/khu vực:** `docs/test_report.md`.
- **Kiểm tra:** Đối chiếu README, AI_LOG, release note, báo cáo kiểm thử và lịch sử Git local; xác nhận tổng điểm theo trọng số là 45/100; chạy `git diff --check`.

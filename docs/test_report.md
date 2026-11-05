# BÁO CÁO KIỂM THỬ SẢN PHẨM

## 1. Thông tin chung

| Thông tin | Chi tiết |
|---|---|
| **Tên dự án** | Portfolio CV - Lê Xuân Hưng |
| **Phiên bản** | v1.0 |
| **Ngày kiểm thử/đánh giá** | 05/11/2026 |
| **Người thực hiện** | Chưa cập nhật |
| **Người đánh giá** | Chưa cập nhật |
| **Phạm vi** | Website portfolio tĩnh: nội dung, điều hướng, giao diện responsive, tài nguyên, cấu hình và hướng dẫn bàn giao |
| **Cơ sở đánh giá** | Đối chiếu mã nguồn/tài liệu và kiểm tra trực tiếp giao diện trong trình duyệt tích hợp tại ba viewport responsive; các kiểm thử khác được ghi rõ nếu chưa có minh chứng |

> **Lưu ý:** Đã chụp ảnh toàn trang ở ba viewport responsive và kiểm tra tràn ngang/tải ảnh tại các kích thước này. Chưa có kết quả kiểm thử đa trình duyệt, bàn phím, hiệu năng hoặc triển khai thực tế; không xem các hạng mục đó là đã kiểm thử thành công.

### Quy ước trạng thái

- **Đạt:** Đã kiểm tra và có minh chứng đáp ứng tiêu chí.
- **Chưa đạt:** Đã xác định kết quả không đáp ứng tiêu chí.
- **Cần cải thiện:** Chưa đủ minh chứng để kết luận, hoặc cần bổ sung/hoàn thiện trước khi bàn giao.

## 2. Bảng tổng quan trạng thái

| # | Nhóm tiêu chí | Trạng thái | Tóm tắt |
|---|---|---|---|
| 1 | Tính đúng đắn và mức độ đáp ứng yêu cầu chức năng | Cần cải thiện | Có các mục nội dung và điều hướng chính; một số liên kết đang là `#` thay vì đích sử dụng được. |
| 2 | Giao diện, trải nghiệm người dùng và khả năng tương thích | Cần cải thiện | Đã chụp và kiểm tra responsive ở mobile/tablet/desktop; kiểm thử đa trình duyệt, bàn phím và tương phản vẫn cần bổ sung. |
| 3 | Khả năng vận hành, xử lý lỗi và hiệu năng cơ bản | Cần cải thiện | Có hướng dẫn chạy tĩnh và Docker; chưa thực hiện kiểm tra HTTP, lỗi tải tài nguyên hoặc đo hiệu năng. |
| 4 | Bảo mật, quản lý cấu hình và dữ liệu | Cần cải thiện | Không thấy luồng backend/API theo mô tả dự án; cần rà soát thông tin công khai và cấu hình trên bản triển khai. |
| 5 | Chất lượng mã nguồn, cấu trúc repository và tài liệu bàn giao | Cần cải thiện | Có cấu trúc HTML/CSS và README; cần xử lý liên kết placeholder, rà soát nội dung và hoàn tất thông tin đánh giá. |
| 6 | Khả năng triển khai, kiểm thử và cung cấp minh chứng | Cần cải thiện | Đã có ảnh responsive; chưa có minh chứng cho chạy local/Docker, hiệu năng và triển khai thực tế. |

## 3. Nội dung kiểm thử chi tiết

### 3.1. Tính đúng đắn và mức độ đáp ứng yêu cầu chức năng

| Hạng mục kiểm tra | Trạng thái | Ghi chú/Minh chứng |
|---|---|---|
| Hiển thị phần Giới thiệu, Kỹ năng, Dự án và Liên hệ | Đạt | Các khu vực có trong `index.html`, với các ID `about`, `skills`, `projects`, `contact`. Đánh giá theo mã nguồn; cần kiểm tra thêm trên trình duyệt. |
| Điều hướng từ menu đến đúng khu vực | Cần cải thiện | Menu dùng liên kết neo đến các ID tương ứng trong trang. Chưa chạy thao tác điều hướng trên trình duyệt để xác nhận. |
| Nút “Xem dự án” và “Liên hệ tôi” dẫn đến đúng khu vực | Cần cải thiện | Mã nguồn khai báo liên kết `#projects` và `#contact`; cần kiểm tra hành vi cuộn và vị trí tiêu đề khi header sticky. |
| Liên kết chi tiết của từng dự án mở đúng đích | **Chưa đạt** | Các nút “Xem chi tiết” trong thẻ dự án đang dùng `href="#"`; chưa dẫn tới trang hoặc nội dung chi tiết. |
| Liên kết GitHub và LinkedIn mở đúng hồ sơ | **Chưa đạt** | Hai liên kết hồ sơ trong phần Liên hệ đang dùng `href="#"`, dù văn bản hiển thị địa chỉ hồ sơ. |
| Liên kết email mở trình soạn thư | Cần cải thiện | Có khai báo `mailto:lexuanhung130908@gmail.com`; chưa kiểm tra bằng ứng dụng email thực tế. |
| Ảnh đại diện và ảnh các dự án tải đúng | Cần cải thiện | Mã nguồn tham chiếu tài nguyên trong `assets/img/`; cần xác nhận không lỗi 404 khi mở trực tiếp và khi phục vụ qua HTTP/Docker. |
| Nội dung hiển thị đúng, không có nội dung mẫu hoặc sai lệch | Cần cải thiện | Cần chủ dự án duyệt lại mô tả dự án, chính tả, thông tin sản phẩm và thông tin liên hệ trước bàn giao. |

### 3.2. Giao diện, trải nghiệm người dùng và khả năng tương thích

| Hạng mục kiểm tra | Trạng thái | Ghi chú/Minh chứng |
|---|---|---|
| Bố cục ở màn hình điện thoại, máy tính bảng và máy tính | Đạt | Đã xem trang tại viewport CSS 390 × 844, 768 × 1024 và 1440 × 900. Ảnh chụp toàn trang ở phần minh chứng bên dưới. |
| Không xuất hiện cuộn ngang hoặc thành phần bị tràn | Đạt | Tại cả ba viewport, `document.documentElement.scrollWidth` bằng `clientWidth`; quan sát ảnh không thấy nội dung bị cắt ngang. |
| Menu, nút và liên kết dễ nhận biết, thao tác được | Cần cải thiện | Có trạng thái `hover`/`focus-visible` cho liên kết menu; cần kiểm tra điều hướng bằng chuột, bàn phím và thiết bị cảm ứng. |
| Màu chữ, độ tương phản và khả năng đọc | Cần cải thiện | Cần đánh giá trực quan và kiểm tra tương phản trên nền thực tế, đặc biệt ở các màu chữ được cấu hình trong CSS. |
| Nội dung có thứ bậc tiêu đề và vùng ngữ nghĩa | Đạt | Mã nguồn có `header`, `nav`, `main`, `section`, `article` và tiêu đề phân cấp; cần kiểm tra bằng trình đọc màn hình nếu thuộc phạm vi nghiệm thu. |
| Ảnh có văn bản thay thế | Đạt | Các ảnh trong phần giới thiệu/dự án có thuộc tính `alt` trong mã nguồn; cần xác nhận mô tả thay thế phù hợp với nội dung ảnh. |
| Tương thích Chrome, Edge, Firefox và Safari | Cần cải thiện | README nêu trình duyệt hiện đại là môi trường hỗ trợ; chưa có ma trận chạy thử theo trình duyệt/phiên bản. |
| Trải nghiệm khi phóng to trang và dùng bàn phím | Cần cải thiện | Chưa có minh chứng kiểm tra zoom, thứ tự focus, focus dễ nhận biết và khả năng thao tác không dùng chuột. |

#### Minh chứng ảnh kiểm thử responsive

Ảnh được chụp từ trang chạy thực tế trong trình duyệt tích hợp, ở các viewport CSS bên dưới. Đây là ảnh chụp toàn trang, lưu trong `docs/screenshots/`.

| Thiết bị/viewport | Kích thước (CSS px) | Minh chứng | Kết quả |
|---|---:|---|---|
| Mobile | 390 × 844 | [responsive-mobile-390x844.png](screenshots/responsive-mobile-390x844.png) | Đạt; nội dung xếp dọc, không tràn ngang |
| Tablet | 768 × 1024 | [responsive-tablet-768x1024.png](screenshots/responsive-tablet-768x1024.png) | Đạt; bố cục hiển thị trong chiều rộng viewport, không tràn ngang |
| Desktop | 1440 × 900 | [responsive-desktop-1440x900.png](screenshots/responsive-desktop-1440x900.png) | Đạt; bố cục desktop và lưới dự án hiển thị, không tràn ngang |

Tại cả ba lần chụp, các ảnh trên trang đã tải hoàn tất. Kết quả này chỉ xác nhận bố cục ở các viewport đã nêu; không thay thế kiểm thử trên thiết bị vật lý hoặc các trình duyệt khác.

### 3.3. Khả năng vận hành, xử lý lỗi và hiệu năng cơ bản

| Hạng mục kiểm tra | Trạng thái | Ghi chú/Minh chứng |
|---|---|---|
| Mở trang trực tiếp hoặc qua máy chủ HTTP theo README | Cần cải thiện | README cung cấp hướng dẫn `py -m http.server 8000`/`python -m http.server 8000`; chưa ghi nhận lần chạy thực tế. |
| Tải trang và các tài nguyên tĩnh thành công | Cần cải thiện | Chưa có log Network hoặc ảnh chụp chứng minh HTML, CSS và hình ảnh tải thành công, không có lỗi 404. |
| Hành vi khi thiếu ảnh hoặc đường dẫn tài nguyên sai | Cần cải thiện | Chưa kiểm tra tình huống lỗi hoặc xác nhận có cách phát hiện lỗi tải tài nguyên. |
| Trang hoạt động khi JavaScript không chạy | Đạt | Theo README, trang hiện là website tĩnh HTML/CSS và không cần bước biên dịch JavaScript; xác nhận thêm bằng thử nghiệm tắt JavaScript trên trình duyệt. |
| Thời gian tải và kích thước tài nguyên ở mức phù hợp | Cần cải thiện | Chưa đo bằng Lighthouse, DevTools hoặc công cụ tương đương; cần kiểm tra kích thước ảnh và chỉ số tải trang trên môi trường mục tiêu. |
| Giao diện ổn định sau tải, không có lỗi nghiêm trọng trên Console | Cần cải thiện | Chưa có kết quả kiểm tra Console hoặc kiểm thử thao tác đầy đủ. |

### 3.4. Bảo mật, quản lý cấu hình và dữ liệu

| Hạng mục kiểm tra | Trạng thái | Ghi chú/Minh chứng |
|---|---|---|
| Không để lộ mật khẩu, token hoặc khóa bí mật trong repository | Cần cải thiện | Chưa có kết quả rà soát toàn bộ repository/commit bằng kiểm tra phù hợp; cần xác nhận trước khi công khai hoặc bàn giao. |
| Cấu hình môi trường và thông tin triển khai | Đạt | README nêu dự án không có biến môi trường hay cấu hình backend/API cần thiết; xác nhận lại nếu bổ sung dịch vụ hoặc môi trường triển khai. |
| Thu thập, lưu trữ và truyền dữ liệu người dùng | Đạt | Theo phạm vi mô tả hiện tại, trang tĩnh không có backend, API hoặc cơ sở dữ liệu. Kiểm tra lại nếu có thêm biểu mẫu, analytics hoặc dịch vụ bên thứ ba. |
| Thông tin cá nhân được công khai đúng chủ đích | Cần cải thiện | Trang công khai email và liên kết hồ sơ; chủ dự án cần xác nhận các thông tin này được phép công bố và chính xác. |
| Liên kết ngoài và giao thức triển khai | Cần cải thiện | Cần xác minh đích liên kết ngoài thực tế và dùng HTTPS trên môi trường bàn giao công khai. |
| Chính sách header bảo mật và cấu hình máy chủ | Cần cải thiện | Chưa kiểm tra cấu hình Nginx/hosting hoặc các HTTP security headers; xác định theo môi trường triển khai cụ thể. |

### 3.5. Chất lượng mã nguồn, cấu trúc repository và tài liệu bàn giao

| Hạng mục kiểm tra | Trạng thái | Ghi chú/Minh chứng |
|---|---|---|
| Cấu trúc tách nội dung, kiểu dáng và tài nguyên | Đạt | Repository có `index.html`, `assets/css/styles.css` và `assets/img/`. |
| HTML có khai báo ngôn ngữ, viewport và metadata cơ bản | Đạt | `index.html` có `lang="vi"`, charset UTF-8, viewport, description và title. |
| Đường dẫn tài nguyên chạy ổn định trên môi trường triển khai | Cần cải thiện | Đường dẫn tương đối được dùng trong mã nguồn; cần kiểm tra dưới đúng document root và sau khi triển khai. |
| Liên kết placeholder và nội dung chưa hoàn thiện được xử lý | **Chưa đạt** | Các liên kết `href="#"` ở nút dự án và hồ sơ mạng xã hội cần được thay bằng đích thực tế hoặc trình bày như nội dung không tương tác. |
| Nội dung và văn bản hiển thị được rà soát | Cần cải thiện | Cần duyệt lại chính tả, tính nhất quán, mô tả dự án và thông tin cá nhân trên trang. |
| README mô tả cài đặt, chạy local, Docker và cấu hình | Đạt | README có hướng dẫn chạy trực tiếp/HTTP, Docker và nêu rõ yêu cầu môi trường, cấu hình. Chưa thực thi theo hướng dẫn để xác nhận. |
| Tài liệu release note và báo cáo kiểm thử được cập nhật | Cần cải thiện | Có `docs/RELEASENOTE.md`; cần bổ sung người thực hiện, kết quả chạy thử và minh chứng vào báo cáo này trước khi ký bàn giao. |
| Mã nguồn sạch, nhất quán và không có cảnh báo đáng kể | Cần cải thiện | Chưa chạy validator HTML/CSS, linter hoặc kiểm tra chất lượng tự động. |

### 3.6. Khả năng triển khai, kiểm thử và cung cấp minh chứng

| Hạng mục kiểm tra | Trạng thái | Ghi chú/Minh chứng |
|---|---|---|
| Chạy từ thư mục mã nguồn bằng máy chủ HTTP | Cần cải thiện | Có hướng dẫn trong README; cần ghi hệ điều hành, lệnh chạy, URL và kết quả truy cập thực tế. |
| Build/chạy website bằng Docker theo README | Cần cải thiện | README có lệnh chạy Nginx với image `nginx:alpine`; chưa xác nhận Docker daemon, khả năng tải image, khởi động container và truy cập cổng 8080. |
| Trang hoạt động sau khi triển khai lên môi trường bàn giao | Cần cải thiện | Chưa cung cấp URL môi trường staging/production hoặc kết quả kiểm tra sau triển khai. |
| Kiểm thử được lặp lại theo checklist | Cần cải thiện | Cần điền ngày, môi trường, phiên bản trình duyệt, kết quả từng ca và người thực hiện để có thể đối chiếu. |
| Minh chứng kiểm thử có thể truy xuất | Cần cải thiện | Chưa đính kèm ảnh chụp, log Console/Network, kết quả đo hiệu năng hoặc log Docker. Lưu minh chứng vào thư mục được thống nhất và ghi đường dẫn tại đây. |
| Kết quả kiểm thử được xác nhận trước bàn giao | Cần cải thiện | Chưa có xác nhận của người đánh giá/chủ dự án và chưa có kết luận nghiệm thu cuối cùng. |

## 4. Đánh giá tổng kết và đề xuất

### Nhận định chung

Sản phẩm có phạm vi là website portfolio tĩnh, cấu trúc chính gồm giới thiệu, kỹ năng, dự án và liên hệ. Repository có hướng dẫn chạy local/Docker và mã nguồn có bố cục responsive được khai báo. Tuy nhiên, báo cáo hiện chưa kèm kết quả kiểm thử thực thi trên trình duyệt hoặc môi trường triển khai, vì vậy chưa đủ cơ sở để xác nhận toàn bộ tiêu chí bàn giao.

**Kết luận hiện tại: Chưa đủ điều kiện xác nhận sẵn sàng bàn giao.** Đây là kết luận theo trạng thái minh chứng trong báo cáo, không thay thế cho kết quả nghiệm thu sau khi hoàn tất các bước dưới đây.

### Vấn đề cần xử lý trước bàn giao

1. Thay các liên kết `href="#"` của thẻ dự án, GitHub và LinkedIn bằng URL/nội dung đích hợp lệ; nếu chưa có đích, bỏ kiểu hiển thị như liên kết có thể bấm.
2. Rà soát và xác nhận chính tả, nội dung mô tả dự án, email và thông tin cá nhân được công khai.
3. Chạy thử trên kích thước mobile/tablet/desktop và các trình duyệt trong phạm vi hỗ trợ; kiểm tra điều hướng, bàn phím, ảnh và lỗi Console/Network.
4. Thực thi hướng dẫn chạy local và Docker; lưu kết quả truy cập, log hoặc ảnh minh chứng.
5. Kiểm tra hiệu năng cơ bản, đường dẫn tài nguyên, HTTPS và cấu hình máy chủ trên đúng môi trường bàn giao.
6. Hoàn tất thông tin người thực hiện/đánh giá, cập nhật trạng thái từng checklist dựa trên bằng chứng, rồi ghi quyết định nghiệm thu cuối cùng.

### Xác nhận

| Vai trò | Họ tên | Ngày | Kết quả/Chữ ký |
|---|---|---|---|
| Người thực hiện kiểm thử | Chưa cập nhật | Chưa cập nhật | Chưa xác nhận |
| Người đánh giá/QA | Chưa cập nhật | Chưa cập nhật | Chưa xác nhận |
| Đại diện bàn giao | Chưa cập nhật | Chưa cập nhật | Chưa xác nhận |
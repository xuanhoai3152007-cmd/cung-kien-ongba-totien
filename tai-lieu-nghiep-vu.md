# Tài liệu nghiệp vụ

## Dự án: Lịch cúng và quản lý đồ lễ truyền thống Việt Nam

### 1. Mục tiêu

Ứng dụng giúp người dùng tra cứu lịch cúng, lập kế hoạch và chuẩn bị đồ
lễ cho cúng gia tiên, ngày giỗ, mùng 1, ngày rằm, lễ Tết và cúng chúng
sinh/cô hồn. Phong tục có thể khác nhau theo vùng miền và từng gia đình;
nội dung chỉ mang tính tham khảo.

### 2. Vai trò

-   **Khách:** xem lịch mẫu, hướng dẫn và danh sách lễ vật công khai.
-   **Người dùng:** tạo lịch cá nhân, tùy chỉnh checklist, ghi chú và
    theo dõi tiến độ.
-   **Admin:** quản lý mẫu nghi lễ, lễ vật, bài hướng dẫn, tài khoản và
    nhật ký quản trị theo quyền.

### 3. Chức năng chính

1.  Trang chủ và các dịp cúng sắp tới.
2.  Lịch cúng dạng tháng/danh sách, lọc theo loại nghi lễ.
3.  Trang chi tiết nghi lễ, ngày âm/dương, thời gian tham khảo và ghi
    chú.
4.  Checklist đồ lễ: thêm/bỏ món, số lượng, đơn vị, ghi chú, đánh dấu đã
    chuẩn bị.
5.  Tạo/sửa/xóa kế hoạch cá nhân.
6.  Quản lý bài hướng dẫn và nội dung bởi admin.
7.  Nhắc lịch nếu hệ thống hỗ trợ.

### 4. Quy trình người dùng

1.  Chọn dịp cúng từ lịch hoặc mẫu.
2.  Kiểm tra ngày, thời gian và ghi chú phong tục.
3.  Tạo kế hoạch, tạo checklist từ mẫu.
4.  Điều chỉnh món và số lượng.
5.  Đánh dấu món đã chuẩn bị.
6.  Hoàn tất kế hoạch và lưu ghi chú cho lần sau.

### 5. Quy trình admin

1.  Đăng nhập và kiểm tra quyền.
2.  Tạo/sửa mẫu nghi lễ, lễ vật hoặc bài viết.
3.  Lưu bản nháp, bổ sung nguồn tham khảo.
4.  Gửi duyệt hoặc xuất bản nếu có quyền.
5.  Hệ thống ghi nhật ký thao tác.

### 6. Quy tắc nghiệp vụ

-   Mẫu đồ lễ là gợi ý, không phải danh sách bắt buộc.
-   Lễ mặn, vàng mã và giờ cúng cụ thể là tùy chọn theo phong tục.
-   Không gộp mặc định lễ chúng sinh với lễ trên bàn thờ gia tiên.
-   Không tự đoán ngày dương từ ngày âm; ngày chưa xác minh phải ghi
    "Cần xác nhận".
-   Nội dung nghi lễ cần trung lập, tôn trọng khác biệt vùng miền.
-   Nhắc nhở an toàn với lửa/nhang và thu gom rác sau lễ.
-   Xóa kế hoạch cá nhân không được xóa mẫu dùng chung.

### 7. Dữ liệu chính

-   **Mẫu nghi lễ:** tên, danh mục, mô tả, quy tắc ngày, thời gian gợi
    ý, danh sách lễ vật, trạng thái xuất bản.
-   **Kế hoạch cá nhân:** người sở hữu, tên dịp, ngày âm/dương, trạng
    thái xác minh, giờ, checklist, ghi chú, trạng thái.
-   **Lễ vật:** tên, danh mục, đơn vị, số lượng gợi ý, mô tả và ghi chú
    tùy chọn.
-   **Bài hướng dẫn:** tiêu đề, nội dung, nguồn, người biên tập, trạng
    thái xuất bản.

### 8. Yêu cầu phi chức năng

-   Responsive, dễ đọc, có thể sử dụng bằng bàn phím.
-   Bảo vệ dữ liệu cá nhân và phân quyền.
-   Xử lý lỗi rõ ràng, có sao lưu nếu dùng backend.
-   Nội dung có thể cập nhật mà không cần sửa giao diện.

### 9. Tiêu chí nghiệm thu

-   Người dùng xem lịch và mẫu lễ vật.
-   Checklist có thể chỉnh sửa và lưu lại.
-   Admin quản lý nội dung theo quyền.
-   Ngày âm/dương chưa xác minh có cảnh báo.
-   Giao diện dùng được trên điện thoại và máy tính.
-   Lỗi dữ liệu, mạng và quyền truy cập có thông báo phù hợp.

### 10. Giới hạn

Tài liệu là đặc tả đề xuất, không phải quy định nghi lễ bắt buộc hay
lịch âm chính thức. Nội dung cần được rà soát trước khi xuất bản.

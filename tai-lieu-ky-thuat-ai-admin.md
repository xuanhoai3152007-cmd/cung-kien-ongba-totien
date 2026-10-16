# Tài liệu kỹ thuật AI phía Admin

## Dự án: Lịch cúng và quản lý đồ lễ Việt Nam

## 1. Mục tiêu

Xây dựng khu vực quản trị để quản lý mẫu nghi lễ, lễ vật, bài hướng dẫn,
người dùng và nhật ký. AI có thể hỗ trợ tạo bản nháp, nhưng nội dung
phải được con người kiểm duyệt trước khi xuất bản.

## 2. Kiến trúc đề xuất

-   Admin UI: React, có `AdminLayout` riêng.
-   Backend: REST API có xác thực và phân quyền.
-   Cơ sở dữ liệu: PostgreSQL hoặc hệ quản trị quan hệ tương đương.
-   Lưu ảnh: dịch vụ lưu trữ có kiểm soát quyền.
-   AI: gọi qua backend; không đặt API key mô hình trong trình duyệt.
-   Audit log: ghi các thao tác quản trị quan trọng.

Đây là kiến trúc tham khảo, không có nghĩa backend đã được triển khai.

## 3. Vai trò và quyền

-   `super_admin`: quản lý cấu hình và tài khoản quản trị.
-   `content_admin`: biên tập, duyệt và xuất bản nội dung.
-   `catalog_admin`: quản lý danh mục nghi lễ và lễ vật.
-   `support`: quyền hỗ trợ giới hạn, không tự cấp quyền hoặc xuất bản.
-   `user`: chỉ quản lý dữ liệu cá nhân.

Nguyên tắc: - Cấp quyền tối thiểu cần thiết. - Backend kiểm tra quyền
trên từng endpoint. - Ẩn nút ở giao diện không thay thế kiểm tra quyền
máy chủ. - Không cho admin thường tự nâng quyền. - Ghi log các thao tác
cấp quyền, xuất bản, xóa và đổi trạng thái tài khoản.

## 4. Màn hình Admin

### Dashboard

-   Tổng số mẫu nghi lễ, lễ vật và bài viết.
-   Số bản nháp, chờ duyệt và đã xuất bản.
-   Hoạt động gần đây, nội dung thiếu nguồn hoặc ngày chưa xác minh.

### Quản lý mẫu nghi lễ

-   Tìm kiếm, lọc, phân trang.
-   Tạo/sửa tên, mô tả, danh mục, quy tắc lịch, thời gian tham khảo.
-   Trạng thái `draft`, `pending_review`, `published`, `archived`.
-   Xem trước trước khi xuất bản.

### Quản lý lễ vật

-   Tên, danh mục, đơn vị, số lượng gợi ý, mô tả và ghi chú tùy chọn.
-   Liên kết lễ vật với một hoặc nhiều mẫu nghi lễ.

### Quản lý bài hướng dẫn

-   Tiêu đề, slug, nội dung, nguồn tham khảo, người biên tập.
-   Gửi duyệt, xuất bản, lưu trữ.
-   Nội dung đã xuất bản khi sửa đổi quan trọng nên được duyệt lại.

### Quản lý người dùng

-   Tìm kiếm với dữ liệu tối thiểu cần thiết.
-   Khóa/mở tài khoản theo quyền.
-   Không bao giờ hiển thị mật khẩu hoặc bí mật xác thực.

### Nhật ký

-   Người thực hiện, hành động, tài nguyên, thời điểm và kết quả.
-   Không ghi mật khẩu, token hay dữ liệu nhạy cảm.
-   Admin thông thường không được sửa/xóa nhật ký.

## 5. Mô hình dữ liệu gợi ý

-   `admin_users`: id, email, display_name, status, timestamps.
-   `roles`, `permissions`: định nghĩa vai trò/quyền.
-   `ritual_templates`: tên, slug, category, description, lunar_rule,
    default_time, status, người tạo/cập nhật, published_at.
-   `offerings`: tên, category, unit, default_quantity, optional,
    status.
-   `ritual_template_offerings`: liên kết mẫu nghi lễ và lễ vật, số
    lượng, ghi chú, thứ tự.
-   `guide_articles`: title, slug, body, sources, status, author,
    reviewer, published_at.
-   `audit_logs`: actor, action, resource_type, resource_id, result,
    metadata, created_at.

Cần thêm khóa ngoại, chỉ mục, ràng buộc và chính sách lưu trữ theo hệ
thống thực tế.

## 6. API Admin đề xuất

-   `GET /api/admin/dashboard`
-   `GET/POST /api/admin/ritual-templates`
-   `GET/PATCH /api/admin/ritual-templates/:id`
-   `POST /api/admin/ritual-templates/:id/publish`
-   `POST /api/admin/ritual-templates/:id/archive`
-   `GET/POST /api/admin/offerings`
-   `PATCH /api/admin/offerings/:id`
-   `GET/POST /api/admin/articles`
-   `PATCH /api/admin/articles/:id`
-   `POST /api/admin/articles/:id/submit-review`
-   `POST /api/admin/articles/:id/publish`
-   `GET /api/admin/users`
-   `PATCH /api/admin/users/:id/status`
-   `GET /api/admin/audit-logs`

Đây là các endpoint minh họa; backend cần xác thực, phân quyền, validate
dữ liệu và ghi log.

## 7. Quy trình duyệt nội dung

1.  Biên tập viên tạo bản nháp.
2.  Bổ sung nguồn và ghi chú khác biệt phong tục.
3.  Gửi duyệt.
4.  Người duyệt kiểm tra độ chính xác, an toàn và quyền sử dụng hình
    ảnh.
5.  Xuất bản hoặc trả lại kèm lý do.
6.  Lưu người duyệt và thời gian.
7.  Nội dung AI sinh ra luôn là bản nháp cho đến khi được duyệt.

Ngày âm/dương và các khẳng định hướng dẫn phải được kiểm tra độc lập,
không coi đầu ra AI là sự thật mặc định.

## 8. Tích hợp AI an toàn

-   Gọi mô hình qua backend service.
-   Lưu API key trong biến môi trường máy chủ/secret manager.
-   Chỉ gửi dữ liệu cần thiết, tránh dữ liệu cá nhân.
-   Giới hạn độ dài đầu vào, tần suất và chi phí.
-   Không cho AI tự quyết định quyền truy cập hoặc tự xuất bản.
-   Kiểm tra prompt injection trong nội dung đầu vào.
-   Ghi nhận nguồn và người duyệt cho nội dung được AI hỗ trợ.

## 9. Bảo mật và vận hành

-   MFA được khuyến nghị cho admin.
-   HTTPS ở môi trường triển khai.
-   Rate limit đăng nhập và endpoint nhạy cảm.
-   Cookie session dùng `HttpOnly`, `Secure`, `SameSite` nếu phù hợp.
-   Chống CSRF khi dùng cookie xác thực.
-   Kiểm tra loại/kích thước file tải lên.
-   Sao lưu định kỳ và thử khôi phục.
-   Không trả stack trace trong lỗi production.
-   Tách môi trường development, staging và production; dùng migration
    có phiên bản.

## 10. Kiểm thử

-   Chưa đăng nhập nhận 401; không đủ quyền nhận 403.
-   CRUD nội dung tuân thủ quyền và trạng thái.
-   Dữ liệu sai bị từ chối.
-   Thao tác quan trọng tạo audit log.
-   Kiểm thử phân trang, tìm kiếm, tải file và quy trình duyệt.
-   Đảm bảo AI không tự xuất bản nội dung.

## 11. Tiêu chí nghiệm thu

-   Trang Admin yêu cầu đăng nhập.
-   Quyền được kiểm tra ở backend.
-   Có thể tạo, sửa, duyệt, xuất bản và lưu trữ nội dung theo quyền.
-   Nhật ký ghi nhận thao tác quan trọng.
-   Không lộ secret hoặc dữ liệu cá nhân không cần thiết.
-   Có hướng dẫn cấu hình, triển khai và phục hồi dữ liệu.

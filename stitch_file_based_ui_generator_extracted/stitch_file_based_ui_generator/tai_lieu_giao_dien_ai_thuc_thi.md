# Tài liệu giao diện AI thực thi

## Dự án: Lịch cúng và quản lý đồ lễ Việt Nam

### 1. Mục tiêu

Đặc tả giao diện để AI hỗ trợ tạo mã frontend. Mã do AI sinh phải được
chạy thử, kiểm tra và rà soát trước khi phát hành.

### 2. Phong cách

-   Trang nhã, ấm áp, tôn trọng phong tục.
-   Màu gợi ý: nền kem/trắng ngà, chữ nâu đậm, điểm nhấn đỏ gạch.
-   Tránh hiệu ứng nhấp nháy, hình ảnh gây sợ hãi và ngôn ngữ hù dọa.
-   Thiết kế mobile-first, chữ dễ đọc, tương phản tốt.

### 3. Điều hướng

Header: logo "Lịch Cúng Việt"; menu Trang chủ, Lịch cúng, Đồ lễ, Hướng
dẫn; khu vực tài khoản. Footer: giới thiệu, quyền riêng tư, liên hệ và
ghi chú phong tục mang tính tham khảo.

### 4. Màn hình

#### Trang chủ

-   Tiêu đề: "Chủ động chuẩn bị ngày lễ, giữ gìn nếp nhà".
-   Nút "Xem lịch cúng", "Tạo kế hoạch".
-   Thẻ nhóm: Gia tiên, Mùng 1 & ngày rằm, Ngày giỗ, Chúng sinh/cô hồn,
    Lễ truyền thống.
-   Danh sách dịp sắp tới và trạng thái chuẩn bị.

#### Lịch cúng

-   Chuyển tháng trước/sau; xem dạng tháng hoặc danh sách.
-   Lọc theo loại nghi lễ.
-   Hiển thị ngày âm, ngày dương đã xác minh, tên dịp và trạng thái.
-   Ngày chưa xác minh phải có nhãn cảnh báo.

#### Chi tiết nghi lễ

-   Tên, mô tả, ngày/giờ tham khảo, ghi chú phong tục.
-   Checklist đồ lễ và nút "Tạo kế hoạch", "Sao chép checklist", "Thêm
    vào lịch".

#### Checklist đồ lễ

-   Mỗi dòng gồm tên món, số lượng, đơn vị, ghi chú, checkbox.
-   Cho phép thêm, sửa, bỏ món.
-   Có tiến độ hoàn thành và bộ lọc tất cả/chưa chuẩn bị/đã chuẩn bị.

#### Hướng dẫn

-   Danh sách bài viết theo chủ đề.
-   Trang đọc hiển thị nguồn, ngày cập nhật và ghi chú phong tục.
-   Nội dung AI chưa kiểm duyệt không được trình bày như hướng dẫn chính
    thức.

#### Admin

-   Dashboard, quản lý mẫu nghi lễ, lễ vật, bài hướng dẫn, tài khoản và
    nhật ký.
-   Layout quản trị riêng; chỉ hiển thị chức năng phù hợp quyền.

### 5. Thành phần dùng chung

`Header`, `Footer`, `EventCard`, `CalendarView`, `CategoryFilter`,
`OfferingChecklist`, `ChecklistItem`, `StatusBadge`, `ConfirmDialog`,
`LoadingState`, `EmptyState`, `ErrorMessage`.

### 6. Trạng thái và tương tác

-   Loading: skeleton hoặc spinner có nhãn.
-   Empty: giải thích ngắn và nút hành động.
-   Error: thông báo dễ hiểu và nút thử lại.
-   Success: thông báo inline/toast.
-   Form lỗi: chỉ rõ trường sai, giữ lại dữ liệu đã nhập.
-   Xóa dữ liệu phải xác nhận.
-   Không chỉ dùng màu để biểu thị trạng thái.

### 7. Responsive

-   Điện thoại: một cột, nút dễ chạm, menu thu gọn.
-   Tablet: một hoặc hai cột tùy nội dung.
-   Desktop: nội dung có chiều rộng tối đa hợp lý.
-   Checklist dùng được bằng bàn phím và màn hình cảm ứng.

### 8. Chỉ dẫn cho AI

1.  Đọc cấu trúc dự án trước khi tạo/sửa file.
2.  Tái sử dụng component và quy ước hiện có.
3.  Không khai báo trùng biến, component hoặc route.
4.  Tách dữ liệu mẫu khỏi giao diện.
5.  Không tự bịa ngày dương cho ngày âm.
6.  Thêm loading/empty/error/success state.
7.  Không đưa API key hoặc secret vào frontend.
8.  Chạy lint, test và build; báo rõ file đã sửa và kết quả kiểm tra.

### 9. Tiêu chí hoàn thành

Giao diện nhất quán, điều hướng hoạt động, checklist tương tác được,
form có xác thực, responsive và có ghi chú về khác biệt phong tục.

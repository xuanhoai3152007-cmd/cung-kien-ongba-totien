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
-   Không tự đoán ngày dương từ ngày âm. Kết quả chuyển đổi lịch cần
    ghi rõ phương pháp tham khảo và yêu cầu đối chiếu lịch chính thức.
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
-   Ngày âm/dương tính theo thuật toán có ghi rõ tính tham khảo và cần
    đối chiếu lịch chính thức.
-   Giao diện dùng được trên điện thoại và máy tính.
-   Lỗi dữ liệu, mạng và quyền truy cập có thông báo phù hợp.

### 10. Giới hạn

Tài liệu là đặc tả đề xuất, không phải quy định nghi lễ bắt buộc hay
lịch âm chính thức. Nội dung cần được rà soát trước khi xuất bản.

### 11. Tài khoản và dữ liệu hiện tại

-   Tài khoản được xác thực bằng Supabase Auth; hồ sơ và ngày giỗ gia
    đình được lưu trong PostgreSQL của Supabase.
-   Row Level Security giới hạn hồ sơ và ngày giỗ theo tài khoản đang
    đăng nhập. Khóa `service_role` chỉ được dùng cục bộ cho công cụ di
    chuyển, không đưa vào frontend.
-   Danh sách dự toán lễ vật, checklist và lịch sử hoàn thành ngày lễ
    vẫn lưu trong `localStorage` của trình duyệt.
-   Mật khẩu băm từ cơ sở dữ liệu SQLite cũ không thể chuyển trực tiếp
    sang Supabase Auth. Người dùng cũ cần đăng ký Supabase bằng email
    hiện có trước khi nhập hồ sơ và ngày giỗ từ SQLite.
-   Ngày giỗ chỉ lưu ngày/tháng âm lịch do người dùng cung cấp; ngày
    dương được gắn vào lịch theo phép tính âm lịch UTC+7 và cần đối
    chiếu lịch chính thức trước khi sử dụng. Ngày giỗ lặp mỗi năm âm
    lịch, không tự lặp vào tháng nhuận.
-   Tùy chọn nhắc ngày giỗ mới chỉ được lưu, chưa có dịch vụ gửi thông
    báo.
-   Ứng dụng không cung cấp tính năng mua bán, nhận đơn, thanh toán hoặc
    giao hàng.

### 12. Tham khảo giá và dự toán lễ vật

-   Danh sách lễ vật chỉ phục vụ tham khảo giá dự kiến và lập dự toán;
    người dùng có thể thay đổi số lượng hoặc bỏ món. Không cần đăng nhập
    để sử dụng danh sách này.
-   Giá hiển thị là ước tính mẫu theo đơn vị, không phải báo giá của cửa
    hàng cụ thể. Giá thực tế thay đổi theo nơi bán, thời điểm và quy cách;
    cần xác nhận trực tiếp trước khi mua.
-   Ứng dụng không gửi danh sách tới người bán, không tạo đơn hàng, không
    xử lý thanh toán hoặc giao hàng.
-   Người dùng có thể nhập tên khu vực hoặc chủ động cho phép trình duyệt
    lấy vị trí hiện tại để mở tìm kiếm địa điểm trên Google Maps. Vị trí
    chỉ được gửi tới dịch vụ bản đồ khi người dùng bấm liên kết; ứng dụng
    không lưu tọa độ hoặc cung cấp danh sách cửa hàng xác minh riêng.

### 13. Tra cứu ngày lễ

-   Danh sách ngày lễ có thể tìm theo tên/mô tả, lọc theo loại và vùng
    miền; gồm các dịp lễ vừa, lễ lớn và ngày lễ gia đình tham khảo. Mỗi
    kết quả mở trang chi tiết để xem gợi ý chuẩn bị.
-   Dữ liệu mẫu gồm các ngày lễ âm lịch phổ biến như vía Thần Tài, Hàn
    Thực, Phật Đản, Đoan Ngọ, Vu Lan, Thất Tịch và lễ tiễn ông Công ông
    Táo; ngày tương ứng trên dương lịch được tính theo năm.
-   Checklist được lưu riêng theo từng dịp trong trình duyệt; tiến độ có
    thể thay đổi hoặc khôi phục về gợi ý ban đầu.
-   Lịch tháng hiển thị ngày âm tính theo phương pháp thiên văn với múi
    giờ Việt Nam UTC+7 và gắn các ngày lễ mẫu vào ngày dương tương ứng.
    Kết quả tính toán vẫn cần đối chiếu lịch chính thức trước khi sử dụng.
-   Nội dung ngày lễ và checklist là gợi ý tham khảo; người dùng tự điều
    chỉnh theo phong tục gia đình.

### 14. Hiển thị lịch âm trên lịch tháng

-   Mỗi ô ngày dương hiển thị ngày âm tương ứng; tháng nhuận có ký hiệu
    riêng để phân biệt.
-   Các ngày lễ có ngày âm định sẵn được đánh dấu trên ô ngày dương tính
    được trong năm đang xem; ngày rằm lặp theo ngày 15 âm lịch mỗi tháng.
-   Phép tính dùng múi giờ UTC+7 và có giới hạn năm hỗ trợ 1800–2199.
    Đây là kết quả tính toán thiên văn tham khảo, không phải xác nhận từ
    cơ quan phát hành lịch chính thức.

### 15. Gợi ý văn khấn theo vùng miền

-   Trang chi tiết ngày lễ có mẫu lời khấn tham khảo, có thể chuyển giữa
    miền Bắc, miền Trung và miền Nam.
-   Mẫu dùng lời văn gợi ý chung theo từng dịp; không phải văn bản nghi lễ
    bắt buộc. Người dùng tự điều chỉnh cách xưng, lễ vật và nghi thức theo
    phong tục, tín ngưỡng của gia đình.

### 16. Lịch sử ngày lễ hoàn thành

-   Tại trang chi tiết ngày lễ, người dùng có thể xác nhận dịp lễ đã hoàn
    thành; mỗi ngày lễ chỉ được ghi nhận một lần trong cùng ngày.
-   Lịch sử lưu tên dịp và thời điểm xác nhận trong `localStorage` của
    trình duyệt, hiển thị mới nhất trước. Dữ liệu chỉ có trên thiết bị
    hiện tại, không đồng bộ máy chủ.

### 17. Hướng dẫn theo vùng miền và tín ngưỡng

-   Trang hướng dẫn có thể lọc các chủ đề chuẩn bị chung, miền Bắc, miền
    Trung, miền Nam, Phật giáo, Thiên Chúa giáo, an toàn và tra cứu lịch.
-   Mỗi bài cung cấp các bước thực hành và lưu ý khác biệt; đây là gợi ý
    tổ chức, không quy định mâm lễ hoặc nghi thức bắt buộc cho một vùng
    hay cộng đồng.
-   Hướng dẫn Phật giáo và Kitô giáo nhắc người dùng xác nhận lịch, giờ
    và nghi thức với chùa, giáo xứ, hội thánh hoặc tổ chức địa phương.
    Ngày Kitô giáo trên ứng dụng tham khảo lịch Gregorian phương Tây và
    có thể khác giữa các giáo hội. Nội dung ứng dụng không thay thế lịch
    phụng vụ hay hướng dẫn của người phụ trách.
-   Trang chủ hiển thị một số bài nổi bật; có thể mở bài theo chủ đề hoặc
    truy cập toàn bộ hướng dẫn.

### 17. Ngày lễ theo tôn giáo

-   Danh sách ngày lễ có thể lọc theo Phật giáo, Thiên Chúa giáo hoặc
    ngày lễ dân gian và truyền thống; trang chi tiết phân biệt các dịp
    theo cộng đoàn tôn giáo.
-   Lịch mẫu bổ sung một số ngày Phật giáo theo ngày âm và các ngày Kitô
    giáo tiêu biểu theo lịch dương hoặc ngày Phục Sinh.
-   Ngày Phục Sinh được tính theo lịch Gregorian; lịch phụng vụ và ngày
    cử hành có thể khác giữa các giáo hội. Ngày lễ Phật giáo cũng có thể
    khác theo truyền thống. Luôn đối chiếu lịch chính thức của cộng đoàn
    trước khi tham dự hoặc lên kế hoạch.

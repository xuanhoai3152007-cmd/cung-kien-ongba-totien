# Widget nhắc lịch Cúng Kiến cho iPhone

Đây là ứng dụng iOS SwiftUI riêng kèm WidgetKit extension; website React/Vercel không thể tự cài widget iPhone. Ứng dụng đăng nhập Supabase bằng public anon/publishable key, chỉ đọc ngày giỗ của tài khoản hiện tại qua RLS, chuyển lịch âm Việt Nam thành ngày dương gần nhất và lưu bản xem nhanh vào App Group. Access/refresh token được giữ trong iOS Keychain; widget không nhận token và chỉ đọc dữ liệu đã đồng bộ.

Widget hiện **ngày giỗ gia đình** (ô nhỏ: một ngày tiếp theo; ô vừa: tối đa hai ngày). Trên ứng dụng, chọn **Đồng bộ lịch** sau khi thay đổi ngày giỗ ở website. WidgetKit do iOS quyết định thời điểm làm mới; ứng dụng yêu cầu kiểm tra lại khoảng sau nửa đêm và iOS có thể trì hoãn. Đây là widget hiển thị lịch, chưa gửi thông báo đẩy hay thông báo cục bộ.

## Tạo và chạy trên Mac

Yêu cầu macOS, Xcode 15 trở lên, tài khoản Apple để cài lên iPhone; cần XcodeGen để tạo project:

```sh
brew install xcodegen
cd ios
cp Config.example.xcconfig Config.xcconfig
```

Mở `Config.xcconfig`, điền Project URL và **public anon/publishable key** của đúng project Supabase (cùng project với website). Không dùng `service_role` key. Sau đó:

```sh
xcodegen generate
open CungKienReminders.xcodeproj
```

Trong Xcode:

1. Chọn cả target `CungKienReminders` và `CungKienWidgetExtension`, vào **Signing & Capabilities** và chọn Team của bạn.
2. Với **cả hai target**, bật capability **App Groups** và chọn/tạo đúng `group.vn.cungkien.reminders`. Nếu bundle ID hoặc App Group đã được dùng, đổi chúng nhất quán trong `project.yml`, cả hai file `.entitlements` và `Shared/AnniversarySchedule.swift`.
3. Chọn scheme `CungKienReminders`, build/run trên iPhone hoặc Simulator. Đăng nhập bằng tài khoản website; ngày giỗ phải được lưu trong Supabase.
4. Trên iPhone, nhấn giữ màn hình chính → **Sửa → Thêm tiện ích** → tìm **Cúng Kiến** → chọn ô nhỏ hoặc ô vừa. Chạm widget để mở ứng dụng và đồng bộ.

Nếu Supabase bật xác nhận email, xác nhận tài khoản trước. Bảng `public.anniversaries` và policy RLS phải được cài như migration `supabase/migrations/20261113000000_initial_schema.sql`; không cần tạo endpoint hay thêm khóa bí mật mới.

## Cập nhật mã

Chạy lại `xcodegen generate` sau khi đổi `project.yml`. `Config.xcconfig` và project Xcode sinh ra đã được Git ignore; không commit file cấu hình cục bộ. Key trong ứng dụng iOS là khóa public như key của website, không phải secret. Đăng xuất sẽ xóa session Keychain và dữ liệu lịch đã cache dùng cho widget.

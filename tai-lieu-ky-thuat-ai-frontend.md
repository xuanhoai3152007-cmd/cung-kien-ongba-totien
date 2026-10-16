# Tài liệu kỹ thuật AI phía Frontend

## Dự án: Lịch cúng và quản lý đồ lễ Việt Nam

## 1. Mục tiêu

Xây dựng web client để xem lịch, nội dung nghi lễ, checklist và kế hoạch
cá nhân; kết nối API, xử lý trạng thái giao diện và đảm bảo trải nghiệm
responsive.

## 2. Công nghệ đề xuất

-   React + Vite; JavaScript hoặc TypeScript.
-   React Router nếu có nhiều trang.
-   Fetch API hoặc Axios.
-   CSS Modules, CSS thuần hoặc Tailwind CSS.
-   Vitest + React Testing Library.
-   ESLint/Prettier.

Tái sử dụng stack hiện có của dự án nếu đã được cấu hình; không cài thư
viện mới nếu không cần thiết.

## 3. Cấu trúc thư mục tham khảo

``` text
src/
  components/
    layout/Header.jsx
    layout/Footer.jsx
    calendar/CalendarView.jsx
    calendar/EventCard.jsx
    checklist/OfferingChecklist.jsx
    checklist/ChecklistItem.jsx
    common/LoadingState.jsx
    common/ErrorState.jsx
  pages/
    HomePage.jsx
    CalendarPage.jsx
    EventDetailPage.jsx
    MyPlansPage.jsx
    GuidePage.jsx
  services/
    apiClient.js
    eventService.js
    offeringService.js
  hooks/useLocalStorage.js
  utils/dateFormat.js
  styles/global.css
  App.jsx
  main.jsx
```

## 4. Route đề xuất

-   `/` --- Trang chủ.
-   `/lich-cung` --- Lịch cúng.
-   `/nghi-le/:id` --- Chi tiết nghi lễ.
-   `/ke-hoach` --- Kế hoạch cá nhân.
-   `/ke-hoach/:id` --- Chi tiết kế hoạch.
-   `/huong-dan` và `/huong-dan/:slug` --- Hướng dẫn.

Các route riêng tư phải được bảo vệ ở frontend để cải thiện trải nghiệm,
nhưng backend vẫn phải kiểm tra quyền.

## 5. Mô hình dữ liệu

``` ts
type EventCategory =
  | "gia_tien" | "mung_mot" | "ram"
  | "ngay_gio" | "chung_sinh"
  | "le_truyen_thong" | "custom";

type EventStatus = "not_started" | "in_progress" | "completed";

type ChecklistItem = {
  id: string;
  offeringId?: string;
  name: string;
  quantity?: number;
  unit?: string;
  checked: boolean;
  note?: string;
  optional: boolean;
};

type EventPlan = {
  id: string;
  title: string;
  category: EventCategory;
  lunarDate?: { day: number; month: number; year: number };
  solarDate?: string; // YYYY-MM-DD
  dateVerified: boolean;
  time?: string; // HH:mm
  status: EventStatus;
  notes?: string;
  checklist: ChecklistItem[];
};
```

## 6. Quản lý trạng thái

-   Dữ liệu máy chủ đi qua service/hook thống nhất.
-   Trạng thái form tách khỏi trạng thái giao diện.
-   Luôn xử lý loading, empty, error và success.
-   localStorage chỉ dùng cho tùy chọn hoặc bản nháp không nhạy cảm.
-   Nếu backend hỗ trợ phiên bản dữ liệu, tránh ghi đè cập nhật mới hơn.

## 7. API client

-   Cấu hình URL gốc bằng `VITE_API_BASE_URL`.
-   Không đặt secret trong biến `VITE_*` vì chúng có thể được đóng gói
    vào trình duyệt.
-   Chuẩn hóa xử lý HTTP 401, 403, 404 và 5xx.
-   Kiểm tra kiểu dữ liệu trước khi hiển thị.
-   Không hiển thị stack trace nội bộ cho người dùng.

Ví dụ tối giản:

``` js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) throw new Error("Chưa cấu hình API URL");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Vui lòng đăng nhập");
    if (response.status === 403) throw new Error("Bạn không có quyền");
    throw new Error("Không thể hoàn tất yêu cầu");
  }

  if (response.status === 204) return null;
  return response.json();
}
```

Điều chỉnh xác thực, cookie và CSRF theo thiết kế backend thực tế.

## 8. Xử lý ngày âm/dương

-   Tách xử lý lịch vào module riêng.
-   Dùng thư viện hoặc API lịch âm có tài liệu và được kiểm thử.
-   Xác định múi giờ `Asia/Ho_Chi_Minh`.
-   Kiểm thử tháng nhuận, giao thừa và ranh giới năm.
-   `dateVerified` chỉ được bật sau khi kiểm chứng.
-   Không dùng phép cộng/trừ ngày đơn giản để suy ra ngày âm.

## 9. Form và bảo mật

-   Xác thực tiêu đề, ngày, giờ, số lượng và danh mục.
-   Gắn `label` cho input, hỗ trợ bàn phím.
-   Không lưu mật khẩu, khóa bí mật hoặc token nhạy cảm trong
    localStorage.
-   Không tin vai trò do client tự gửi.
-   Tránh XSS; không dùng `dangerouslySetInnerHTML` với nội dung chưa
    làm sạch.
-   Không ghi dữ liệu cá nhân vào console ở production.

## 10. Kiểm thử

-   Unit: định dạng ngày, xác thực form, cập nhật checklist.
-   Component: EventCard, ChecklistItem, trạng thái lỗi và loading.
-   E2E: mở lịch, tạo kế hoạch, cập nhật checklist, tải lại trang.
-   Kiểm tra giao diện ở kích thước điện thoại và desktop.

## 11. Tiêu chí hoàn thành

-   Build thành công, không có lỗi console nghiêm trọng.
-   Route và điều hướng hoạt động.
-   Checklist và form hoạt động đúng.
-   Ngày chưa xác minh có cảnh báo.
-   Không có secret trong bundle.
-   Có `.env.example` và hướng dẫn chạy dự án.

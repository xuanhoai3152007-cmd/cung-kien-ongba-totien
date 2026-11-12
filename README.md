# Cúng Kiến Tâm Linh

Ứng dụng React/Vite tra cứu lịch cúng, ngày lễ, hướng dẫn và tham khảo giá lễ vật. Tài khoản dùng **Supabase Auth**; hồ sơ và ngày giỗ gia đình được lưu trong **Supabase PostgreSQL**, có Row Level Security (RLS) để mỗi tài khoản chỉ truy cập dữ liệu của mình.

## Cấu hình Supabase

1. Tạo một project trên Supabase.
2. Trong Supabase Dashboard, mở **SQL Editor**, chạy lần lượt toàn bộ nội dung của [migration dữ liệu tài khoản](./supabase/migrations/20261113000000_initial_schema.sql) rồi [migration nội dung và quyền admin](./supabase/migrations/20261113001000_admin_content.sql). File đầu tạo hồ sơ, ngày giỗ, trigger đăng ký và RLS cá nhân; file thứ hai tạo danh mục nội dung công khai, quyền ghi dành riêng cho admin.
3. Vào **Project Settings → API** và lấy Project URL cùng `anon`/publishable key.
4. Sao chép `.env.example` thành `.env.local`, rồi điền hai giá trị:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
   ```

   Chỉ dùng khóa `anon`/publishable ở frontend. **Không bao giờ đặt `service_role` key trong biến `VITE_*`, mã nguồn hoặc file được commit.**

5. Cài package và chạy ứng dụng:

   ```sh
   npm install
   npm run dev
   ```

   Không cần chạy backend Express riêng nữa. Nếu bật xác nhận email trong Supabase Auth, người dùng cần bấm liên kết gửi qua email trước khi đăng nhập. Trong **Authentication → URL Configuration**, đặt Site URL và cho phép URL callback local `http://localhost:5173/**` cùng các domain production của bạn.

## Đưa website lên Vercel

1. Đẩy source code lên GitHub, bảo đảm file `.env.local` không được commit (`.gitignore` đã bỏ qua file này). Không commit khóa `service_role`.
2. Vào [vercel.com/new](https://vercel.com/new), đăng nhập bằng GitHub, chọn **Import** cho repository này rồi bấm **Deploy**. Cấu hình trong `vercel.json` đã chọn Vite, lệnh `npm run build`, thư mục output `dist`, rewrite cho SPA và một số security headers.
3. Trước lần deploy đầu tiên (hoặc thêm sau ở **Project → Settings → Environment Variables**), khai báo các biến cho **Production** và **Preview**:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Project URL trong Supabase → Project Settings → API |
   | `VITE_SUPABASE_ANON_KEY` | `anon`/publishable key cùng trang |

   Sau khi thêm hoặc sửa biến, phải **Redeploy** để Vite đưa cấu hình vào build mới. Chỉ đưa khóa công khai `anon`/publishable vào hai biến này; không khai báo `service_role` trên Vercel.

4. Sau khi Vercel cấp domain, ví dụ `https://your-project.vercel.app`, mở Supabase → **Authentication → URL Configuration**:
   - Đặt **Site URL** thành domain production Vercel.
   - Thêm domain production và URL Preview cần dùng vào **Redirect URLs** (ví dụ `https://your-project.vercel.app/**` và `https://your-project-git-branch-your-team.vercel.app/**`).
   - Nếu có domain riêng, thêm domain đó và đặt nó làm Site URL khi sẵn sàng.
5. Mở website production, đăng ký/đăng nhập, thử lưu ngày giỗ và xem lại trang sau khi reload. Admin cần chạy migrations và cấp email trong `admin_allowlist` như hướng dẫn bên trên.

## Cấp quyền quản trị nội dung

1. Đăng ký tài khoản ứng dụng bằng email muốn cấp quyền admin và xác nhận email nếu Supabase bật xác nhận.
2. Trong Supabase **SQL Editor**, chạy lệnh sau với email chính xác của tài khoản:

   ```sql
   insert into public.admin_allowlist (email)
   values (lower('admin@example.com'))
   on conflict (email) do nothing;
   ```

3. Đăng xuất rồi đăng nhập lại ứng dụng. Tài khoản được cấp quyền sẽ thấy mục **Quản trị** trên thanh điều hướng.

Để thu hồi quyền, xóa email khỏi `public.admin_allowlist`. Không đưa quyền admin vào metadata mà người dùng tự cập nhật được. RLS và hàm `is_current_user_admin()` kiểm tra allowlist trực tiếp ở database; ẩn đường dẫn trong giao diện không phải lớp bảo vệ duy nhất.

Trang **Quản trị** cho phép thêm, sửa và xóa nội dung do admin quản lý:

- Ngày lễ: ngày âm/dương cố định, ngày âm lặp hàng tháng, hoặc ngày tính theo lễ Phục Sinh.
- Lễ vật: giá tham khảo, đơn vị, nhóm, vùng miền và kiểu minh họa.
- Văn khấn: nội dung riêng cho từng ngày lễ và vùng miền; nội dung này thay phần gợi ý mặc định tương ứng.

Nội dung gốc đang có sẵn trong ứng dụng vẫn được giữ nguyên; nội dung mới do admin thêm sẽ được đọc từ các bảng Supabase.

## Cấu trúc dữ liệu

- `auth.users`: tài khoản và xác thực do Supabase quản lý.
- `public.profiles`: hồ sơ, vùng miền và tùy chọn nhắc ngày giỗ.
- `public.anniversaries`: ngày giỗ của gia đình.
- `public.admin_allowlist`: danh sách email có quyền quản trị.
- `public.holidays`, `public.catalog_products`, `public.prayers`: nội dung ngày lễ, lễ vật và văn khấn do admin quản lý.

RLS giới hạn việc đọc/sửa hồ sơ và ngày giỗ theo `auth.uid()`. Dự toán lễ vật, checklist và lịch sử hoàn thành ngày lễ vẫn được lưu trong trình duyệt, không nằm trong Supabase.

## Chuyển dữ liệu từ SQLite cũ

Mật khẩu băm trong SQLite không thể chuyển trực tiếp thành mật khẩu Supabase Auth. Người dùng cũ cần đăng ký và xác nhận tài khoản Supabase với **cùng email** trước khi chạy công cụ nhập dữ liệu.

1. Sao chép `.env.migrate.example` thành `.env.migrate`.
2. Điền `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` và `DATABASE_PATH` trỏ tới file SQLite cũ (mặc định `data/cung-kien.sqlite`).
3. Chỉ giữ service-role key trong file riêng tư `.env.migrate`; file này đã được Git ignore. Không chia sẻ khóa đó hoặc commit file.
4. Chạy:

   ```sh
   npm run migrate:sqlite
   ```

Script ghép tài khoản theo email, nhập hồ sơ và ngày giỗ, đồng thời giữ ID ngày giỗ cũ để có thể chạy lại an toàn. Người chưa có tài khoản Supabase tương ứng sẽ được bỏ qua; họ cần đăng ký/xác nhận email rồi chạy lại script. Hãy sao lưu SQLite trước khi di chuyển và không xóa bản gốc cho đến khi kiểm tra dữ liệu trên Supabase.

## Kiểm tra

```sh
npm run lint
npm run typecheck:migration
npm run build
```

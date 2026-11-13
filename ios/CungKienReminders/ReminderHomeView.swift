import SwiftUI
import WidgetKit

@MainActor
final class ReminderViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var session: SupabaseSession?
    @Published var items: [ScheduleItem] = ScheduleCache.load()
    @Published var errorMessage: String?

    func restoreSession() async {
        do {
            session = try SessionKeychain.load()
            if session != nil {
                await refresh()
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let newSession = try await SupabaseClient.shared.signIn(
                email: email.trimmingCharacters(in: .whitespacesAndNewlines),
                password: password
            )
            try SessionKeychain.save(newSession)
            session = newSession
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func refresh() async {
        guard let currentSession = session else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let (newSession, records) = try await SupabaseClient.shared.loadAnniversaries(using: currentSession)
            try SessionKeychain.save(newSession)
            let newItems = VietnameseLunarCalendar.upcomingItems(from: records)
            try ScheduleCache.save(records)
            self.session = newSession
            items = newItems
            WidgetCenter.shared.reloadAllTimelines()
        } catch {
            let originalError = error.localizedDescription
            do {
                if try SessionKeychain.load() == nil {
                    session = nil
                    items = []
                    try ScheduleCache.save([])
                    WidgetCenter.shared.reloadAllTimelines()
                }
            } catch {
                errorMessage = error.localizedDescription
                return
            }
            errorMessage = originalError
        }
    }

    func signOut() {
        SessionKeychain.clear()
        session = nil
        items = []
        errorMessage = nil
        do {
            try ScheduleCache.save([])
            WidgetCenter.shared.reloadAllTimelines()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct ReminderHomeView: View {
    @EnvironmentObject private var model: ReminderViewModel

    var body: some View {
        NavigationStack {
            Group {
                if model.session == nil {
                    SignInView()
                } else {
                    scheduleList
                }
            }
            .navigationTitle("Nhắc lịch Cúng Kiến")
            .toolbar {
                if model.session != nil {
                    ToolbarItem(placement: .topBarTrailing) {
                        Menu {
                            Button("Đồng bộ ngay", systemImage: "arrow.clockwise") {
                                Task { await model.refresh() }
                            }
                            Button("Đăng xuất", systemImage: "rectangle.portrait.and.arrow.right", role: .destructive) {
                                model.signOut()
                            }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                }
            }
            .task { await model.restoreSession() }
            .alert("Có lỗi xảy ra", isPresented: errorPresented) {
                Button("Đóng", role: .cancel) { model.errorMessage = nil }
            } message: {
                Text(model.errorMessage ?? "")
            }
        }
        .tint(Color(red: 0.55, green: 0.27, blue: 0.12))
    }

    private var scheduleList: some View {
        List {
            Section {
                Text("Dữ liệu ngày giỗ được đồng bộ từ tài khoản Cúng Kiến của bạn. Widget hiển thị bản đồng bộ gần nhất.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Ngày giỗ sắp tới") {
                if model.items.isEmpty {
                    ContentUnavailableView(
                        "Chưa có ngày giỗ",
                        systemImage: "calendar",
                        description: Text("Thêm ngày giỗ trên website rồi chạm Đồng bộ ngay.")
                    )
                } else {
                    ForEach(model.items.prefix(8)) { item in
                        VStack(alignment: .leading, spacing: 5) {
                            HStack {
                                Text(item.title).font(.headline)
                                Spacer()
                                Text(ReminderDateFormat.countdown(to: item.solarDate))
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(.brown)
                            }
                            Text("\(item.relationship) · \(ReminderDateFormat.solarDate(item.solarDate))")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Text("Ngày \(item.lunarDay)/\(item.lunarMonth) âm lịch")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }

            Section {
                Button {
                    Task { await model.refresh() }
                } label: {
                    HStack {
                        if model.isLoading { ProgressView().padding(.trailing, 4) }
                        Text(model.isLoading ? "Đang đồng bộ..." : "Đồng bộ lịch")
                    }
                    .frame(maxWidth: .infinity)
                }
                .disabled(model.isLoading)
            }
        }
        .refreshable { await model.refresh() }
    }

    private var errorPresented: Binding<Bool> {
        Binding(
            get: { model.errorMessage != nil },
            set: { if !$0 { model.errorMessage = nil } }
        )
    }
}

private struct SignInView: View {
    @EnvironmentObject private var model: ReminderViewModel
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        Form {
            Section {
                Text("Đăng nhập để đưa các ngày giỗ gia đình đã lưu lên widget màn hình chính.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                SecureField("Mật khẩu", text: $password)
                    .textContentType(.password)
            }
            Section {
                Button {
                    Task { await model.signIn(email: email, password: password) }
                } label: {
                    HStack {
                        Spacer()
                        if model.isLoading { ProgressView().padding(.trailing, 6) }
                        Text(model.isLoading ? "Đang đăng nhập..." : "Đăng nhập và đồng bộ")
                        Spacer()
                    }
                }
                .disabled(model.isLoading || email.isEmpty || password.isEmpty)
            }
            Section {
                Text("Tài khoản được xác thực bởi Supabase. Ứng dụng chỉ đọc ngày giỗ thuộc tài khoản đang đăng nhập; không yêu cầu service-role key.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .scrollDismissesKeyboard(.interactively)
    }
}

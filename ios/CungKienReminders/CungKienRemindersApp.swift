import SwiftUI

@main
struct CungKienRemindersApp: App {
    @StateObject private var model = ReminderViewModel()

    var body: some Scene {
        WindowGroup {
            ReminderHomeView()
                .environmentObject(model)
                .onOpenURL { url in
                    guard url.scheme == "cungkien" else { return }
                    Task { await model.refresh() }
                }
        }
    }
}

import SwiftUI
import WidgetKit

struct AnniversaryEntry: TimelineEntry {
    let date: Date
    let items: [ScheduleItem]
}

struct AnniversaryProvider: TimelineProvider {
    func placeholder(in context: Context) -> AnniversaryEntry {
        AnniversaryEntry(
            date: Date(),
            items: [ScheduleItem(
                id: "sample",
                title: "Ngày giỗ gia đình",
                relationship: "Người thân",
                lunarDay: 15,
                lunarMonth: 7,
                solarDate: Calendar.current.date(byAdding: .day, value: 3, to: Date()) ?? Date()
            )]
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (AnniversaryEntry) -> Void) {
        completion(AnniversaryEntry(date: Date(), items: ScheduleCache.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AnniversaryEntry>) -> Void) {
        let now = Date()
        let entry = AnniversaryEntry(date: now, items: ScheduleCache.load())
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Asia/Ho_Chi_Minh") ?? .current
        let nextRefresh = calendar.nextDate(
            after: now,
            matching: DateComponents(hour: 0, minute: 15),
            matchingPolicy: .nextTime
        ) ?? now.addingTimeInterval(60 * 60 * 6)
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
}

struct AnniversaryWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: AnniversaryEntry

    var body: some View {
        Group {
            if entry.items.isEmpty {
                emptyState
            } else if family == .systemSmall {
                smallWidget(entry.items[0])
            } else {
                mediumWidget(Array(entry.items.prefix(2)))
            }
        }
        .containerBackground(
            LinearGradient(
                colors: [Color(red: 0.99, green: 0.96, blue: 0.9), Color(red: 0.96, green: 0.89, blue: 0.78)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            for: .widget
        )
        .widgetURL(ReminderConfiguration.deepLink)
    }

    private var emptyState: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: "sun.max.fill")
                .font(.title2)
                .foregroundStyle(.brown)
            Text("Nhắc lịch Cúng Kiến").font(.headline)
            Text("Mở ứng dụng để đăng nhập và đồng bộ ngày giỗ.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
    }

    private func smallWidget(_ item: ScheduleItem) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("SẮP TỚI", systemImage: "sparkle")
                .font(.caption2.weight(.bold))
                .foregroundStyle(.brown)
            Text(item.title)
                .font(.headline)
                .lineLimit(2)
                .minimumScaleFactor(0.8)
            Spacer(minLength: 0)
            Text(ReminderDateFormat.countdown(to: item.solarDate, now: entry.date))
                .font(.subheadline.weight(.bold))
                .foregroundStyle(.brown)
            Text("\(item.lunarDay)/\(item.lunarMonth) âm lịch")
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding()
    }

    private func mediumWidget(_ items: [ScheduleItem]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("LỊCH NHẮC NGÀY GIỖ", systemImage: "calendar")
                .font(.caption.weight(.bold))
                .foregroundStyle(.brown)
            ForEach(items) { item in
                HStack(alignment: .center, spacing: 12) {
                    VStack(spacing: 0) {
                        Text("\(item.lunarDay)")
                            .font(.title3.bold())
                        Text("/ \(item.lunarMonth)")
                            .font(.caption2)
                    }
                    .frame(width: 42)
                    .foregroundStyle(.brown)
                    VStack(alignment: .leading, spacing: 3) {
                        Text(item.title).font(.subheadline.weight(.semibold)).lineLimit(1)
                        Text(ReminderDateFormat.solarDate(item.solarDate))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer(minLength: 2)
                    Text(ReminderDateFormat.countdown(to: item.solarDate, now: entry.date))
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.brown)
                }
            }
            Spacer(minLength: 0)
        }
        .padding()
    }
}

struct CungKienWidget: Widget {
    let kind = "CungKienAnniversaryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AnniversaryProvider()) { entry in
            AnniversaryWidgetView(entry: entry)
        }
        .configurationDisplayName("Nhắc ngày giỗ")
        .description("Xem nhanh ngày giỗ âm lịch sắp tới của gia đình.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct CungKienWidgetBundle: WidgetBundle {
    var body: some Widget {
        CungKienWidget()
    }
}

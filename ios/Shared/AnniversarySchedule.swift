import Foundation

enum ReminderConfiguration {
    static let appGroup = "group.vn.cungkien.reminders"
    static let cacheKey = "upcoming-anniversaries-v1"
    static let deepLink = URL(string: "cungkien://anniversaries")
}

struct AnniversaryRecord: Decodable, Identifiable {
    let id: String
    let personName: String
    let relationship: String
    let lunarDay: Int
    let lunarMonth: Int

    enum CodingKeys: String, CodingKey {
        case id
        case personName = "person_name"
        case relationship
        case lunarDay = "lunar_day"
        case lunarMonth = "lunar_month"
    }
}

struct ScheduleItem: Codable, Identifiable {
    let id: String
    let title: String
    let relationship: String
    let lunarDay: Int
    let lunarMonth: Int
    let solarDate: Date
}

enum ScheduleCache {
    static func load() -> [ScheduleItem] {
        guard
            let defaults = UserDefaults(suiteName: ReminderConfiguration.appGroup),
            let data = defaults.data(forKey: ReminderConfiguration.cacheKey),
            let anniversaries = try? JSONDecoder().decode([AnniversaryRecord].self, from: data)
        else {
            return []
        }
        return VietnameseLunarCalendar.upcomingItems(from: anniversaries)
    }

    static func save(_ anniversaries: [AnniversaryRecord]) throws {
        guard let defaults = UserDefaults(suiteName: ReminderConfiguration.appGroup) else {
            throw ScheduleCacheError.appGroupUnavailable
        }
        let data = try JSONEncoder().encode(anniversaries)
        defaults.set(data, forKey: ReminderConfiguration.cacheKey)
    }
}

enum ScheduleCacheError: LocalizedError {
    case appGroupUnavailable

    var errorDescription: String? {
        "Chưa bật App Groups cho cả ứng dụng và tiện ích WidgetKit."
    }
}

enum VietnameseLunarCalendar {
    private static let timeZoneOffset = 7.0
    private static let synodicMonth = 29.530588853
    private static let degreesToRadians = Double.pi / 180
    private static var calendar: Calendar {
        var value = Calendar(identifier: .gregorian)
        value.timeZone = TimeZone(identifier: "Asia/Ho_Chi_Minh") ?? .current
        return value
    }

    static func upcomingItems(
        from anniversaries: [AnniversaryRecord],
        now: Date = Date()
    ) -> [ScheduleItem] {
        let calendar = Self.calendar
        let start = calendar.startOfDay(for: now)
        var datesByID: [String: Date] = [:]
        let targets = Dictionary(grouping: anniversaries) {
            "\($0.lunarMonth)-\($0.lunarDay)"
        }

        for offset in 0...400 {
            guard
                let solarDate = calendar.date(byAdding: .day, value: offset, to: start),
                let lunar = lunarDate(for: solarDate, calendar: calendar)
            else {
                continue
            }
            let key = "\(lunar.month)-\(lunar.day)"
            guard let matches = targets[key] else { continue }
            for anniversary in matches where datesByID[anniversary.id] == nil {
                datesByID[anniversary.id] = solarDate
            }
        }

        return anniversaries.compactMap { anniversary in
            guard let solarDate = datesByID[anniversary.id] else { return nil }
            return ScheduleItem(
                id: anniversary.id,
                title: anniversary.personName,
                relationship: anniversary.relationship,
                lunarDay: anniversary.lunarDay,
                lunarMonth: anniversary.lunarMonth,
                solarDate: solarDate
            )
        }
        .sorted { $0.solarDate < $1.solarDate }
    }

    private static func lunarDate(for date: Date, calendar: Calendar) -> (day: Int, month: Int)? {
        let components = calendar.dateComponents([.day, .month, .year], from: date)
        guard
            let day = components.day,
            let month = components.month,
            let year = components.year,
            (1800...2199).contains(year)
        else {
            return nil
        }

        let dayNumber = julianDay(day: day, month: month, year: year)
        let k = floor((Double(dayNumber) - 2415021.076998695) / synodicMonth)
        var monthStart = newMoonDay(k: k + 1)
        if monthStart > dayNumber {
            monthStart = newMoonDay(k: k)
        }

        var monthEleven = lunarMonthEleven(year: year)
        var nextMonthEleven = monthEleven
        var lunarYear: Int
        if monthEleven >= monthStart {
            lunarYear = year
            monthEleven = lunarMonthEleven(year: year - 1)
        } else {
            lunarYear = year + 1
            nextMonthEleven = lunarMonthEleven(year: year + 1)
        }

        let lunarDay = dayNumber - monthStart + 1
        let monthOffset = Int(floor(Double(monthStart - monthEleven) / 29))
        var lunarMonth = monthOffset + 11
        if nextMonthEleven - monthEleven > 365 && monthOffset >= leapMonthOffset(monthEleven: monthEleven) {
            lunarMonth = monthOffset + 10
        }
        if lunarMonth > 12 {
            lunarMonth -= 12
        }
        if lunarMonth >= 11 && monthOffset < 4 {
            lunarYear -= 1
        }
        guard (1800...2199).contains(lunarYear) else { return nil }
        return (lunarDay, lunarMonth)
    }

    private static func julianDay(day: Int, month: Int, year: Int) -> Int {
        let adjustedYear = year + 4800 - (14 - month) / 12
        let adjustedMonth = month + 12 * ((14 - month) / 12) - 3
        var result = day
            + (153 * adjustedMonth + 2) / 5
            + 365 * adjustedYear
            + adjustedYear / 4
            - adjustedYear / 100
            + adjustedYear / 400
            - 32045
        if result < 2299161 {
            result = day
                + (153 * adjustedMonth + 2) / 5
                + 365 * adjustedYear
                + adjustedYear / 4
                - 32083
        }
        return result
    }

    private static func newMoonDay(k: Double) -> Int {
        let time = k / 1236.85
        let squared = time * time
        let cubed = squared * time
        let first = 2415020.75933
            + synodicMonth * k
            + 0.0001178 * squared
            - 0.000000155 * cubed
        let corrected = first
            + 0.00033 * sin((166.56 + 132.87 * time - 0.009173 * squared) * degreesToRadians)
        let sun = 359.2242
            + 29.10535608 * k
            - 0.0000333 * squared
            - 0.00000347 * cubed
        let moon = 306.0253
            + 385.81691806 * k
            + 0.0107306 * squared
            + 0.00001236 * cubed
        let argument = 21.2964
            + 390.67050646 * k
            - 0.0016528 * squared
            - 0.00000239 * cubed
        let center = (0.1734 - 0.000393 * time) * sin(sun * degreesToRadians)
            + 0.0021 * sin(2 * sun * degreesToRadians)
            - 0.4068 * sin(moon * degreesToRadians)
            + 0.0161 * sin(2 * moon * degreesToRadians)
            - 0.0004 * sin(3 * moon * degreesToRadians)
            + 0.0104 * sin(2 * argument * degreesToRadians)
            - 0.0051 * sin((sun + moon) * degreesToRadians)
            - 0.0074 * sin((sun - moon) * degreesToRadians)
            + 0.0004 * sin((2 * argument + sun) * degreesToRadians)
            - 0.0004 * sin((2 * argument - sun) * degreesToRadians)
            - 0.0006 * sin((2 * argument + moon) * degreesToRadians)
            + 0.001 * sin((2 * argument - moon) * degreesToRadians)
            + 0.0005 * sin((2 * moon + sun) * degreesToRadians)
        let deltaTime = time < -11
            ? 0.001 + 0.000839 * time + 0.0002261 * squared - 0.00000845 * cubed - 0.000000081 * squared * squared
            : -0.000278 + 0.000265 * time + 0.000262 * squared
        return Int(floor(corrected + center - deltaTime + 0.5 + timeZoneOffset / 24))
    }

    private static func sunLongitudeSector(julianDay: Int) -> Int {
        let time = (Double(julianDay) - 2451545.5 - timeZoneOffset / 24) / 36525
        let squared = time * time
        let meanAnomaly = 357.5291
            + 35999.0503 * time
            - 0.0001559 * squared
            - 0.00000048 * squared * time
        let meanLongitude = 280.46645
            + 36000.76983 * time
            + 0.0003032 * squared
        let center = (1.9146 - 0.004817 * time - 0.000014 * squared) * sin(meanAnomaly * degreesToRadians)
            + (0.019993 - 0.000101 * time) * sin(2 * meanAnomaly * degreesToRadians)
            + 0.00029 * sin(3 * meanAnomaly * degreesToRadians)
        var longitude = meanLongitude + center
        longitude -= 360 * floor(longitude / 360)
        return Int(floor(longitude / 30))
    }

    private static func lunarMonthEleven(year: Int) -> Int {
        let offset = julianDay(day: 31, month: 12, year: year) - 2415021
        let k = floor(Double(offset) / synodicMonth)
        var newMoon = newMoonDay(k: k)
        if sunLongitudeSector(julianDay: newMoon) >= 9 {
            newMoon = newMoonDay(k: k - 1)
        }
        return newMoon
    }

    private static func leapMonthOffset(monthEleven: Int) -> Int {
        let k = floor(0.5 + (Double(monthEleven) - 2415021.076998695) / synodicMonth)
        var monthIndex = 1
        var sector = sunLongitudeSector(julianDay: newMoonDay(k: k + Double(monthIndex)))
        while monthIndex < 14 {
            let nextSector = sunLongitudeSector(julianDay: newMoonDay(k: k + Double(monthIndex + 1)))
            monthIndex += 1
            if nextSector == sector { break }
            sector = nextSector
        }
        return monthIndex - 1
    }
}

enum ReminderDateFormat {
    static func solarDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "vi_VN")
        formatter.timeZone = TimeZone(identifier: "Asia/Ho_Chi_Minh")
        formatter.dateFormat = "EEEE, dd/MM"
        return formatter.string(from: date)
    }

    static func countdown(to date: Date, now: Date = Date()) -> String {
        let calendar = vietnameseCalendar()
        let days = calendar.dateComponents(
            [.day],
            from: calendar.startOfDay(for: now),
            to: calendar.startOfDay(for: date)
        ).day ?? 0
        switch days {
        case ...0: return "Hôm nay"
        case 1: return "Ngày mai"
        default: return "Còn \(days) ngày"
        }
    }

    static func vietnameseCalendar() -> Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Asia/Ho_Chi_Minh") ?? .current
        return calendar
    }
}

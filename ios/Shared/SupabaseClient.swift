import Foundation
import Security

struct SupabaseSession: Codable {
    let accessToken: String
    let refreshToken: String

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
    }
}

enum SupabaseClientError: LocalizedError {
    case missingConfiguration
    case invalidResponse
    case server(String)

    var errorDescription: String? {
        switch self {
        case .missingConfiguration:
            return "Chưa cấu hình URL và public anon key của Supabase trong Config.xcconfig."
        case .invalidResponse:
            return "Supabase trả về phản hồi không hợp lệ."
        case .server(let message):
            return message
        }
    }
}

enum SessionKeychain {
    private static let service = "vn.cungkien.reminders.supabase"
    private static let account = "session"

    static func load() throws -> SupabaseSession? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = result as? Data else {
            throw SupabaseClientError.server("Không thể đọc phiên đăng nhập từ Keychain.")
        }
        return try JSONDecoder().decode(SupabaseSession.self, from: data)
    }

    static func save(_ session: SupabaseSession) throws {
        let data = try JSONEncoder().encode(session)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        let attributes: [String: Any] = [kSecValueData as String: data]
        let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        if status == errSecItemNotFound {
            var insert = query
            insert[kSecValueData as String] = data
            let insertStatus = SecItemAdd(insert as CFDictionary, nil)
            guard insertStatus == errSecSuccess else {
                throw SupabaseClientError.server("Không thể lưu phiên đăng nhập an toàn.")
            }
        } else if status != errSecSuccess {
            throw SupabaseClientError.server("Không thể cập nhật phiên đăng nhập an toàn.")
        }
    }

    static func clear() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        SecItemDelete(query as CFDictionary)
    }
}

final class SupabaseClient {
    static let shared = SupabaseClient()
    private let session = URLSession.shared
    private let baseURL: URL
    private let apiKey: String

    private init() {
        let info = Bundle.main
        let urlString = (info.object(forInfoDictionaryKey: "SUPABASE_URL") as? String ?? "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        let key = (info.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String ?? "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        if let url = URL(string: urlString), !urlString.contains("YOUR_PROJECT_ID") {
            baseURL = url
        } else {
            baseURL = URL(string: "https://invalid.local")!
        }
        apiKey = key
    }

    func signIn(email: String, password: String) async throws -> SupabaseSession {
        try validateConfiguration()
        var components = URLComponents(
            url: baseURL.appendingPathComponent("auth").appendingPathComponent("v1").appendingPathComponent("token"),
            resolvingAgainstBaseURL: false
        )
        components?.queryItems = [URLQueryItem(name: "grant_type", value: "password")]
        guard let url = components?.url else { throw SupabaseClientError.invalidResponse }
        var request = makeRequest(url: url, method: "POST")
        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "email": email,
            "password": password,
        ])
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw SupabaseClientError.invalidResponse }
        guard (200..<300).contains(http.statusCode) else {
            throw SupabaseClientError.server(Self.errorMessage(from: data, status: http.statusCode))
        }
        return try JSONDecoder().decode(SupabaseSession.self, from: data)
    }

    func loadAnniversaries(using currentSession: SupabaseSession) async throws -> (SupabaseSession, [AnniversaryRecord]) {
        try validateConfiguration()
        var activeSession = currentSession
        var result = try await fetchAnniversaries(accessToken: activeSession.accessToken)
        if result.response.statusCode == 401 {
            activeSession = try await refreshSession(refreshToken: activeSession.refreshToken)
            result = try await fetchAnniversaries(accessToken: activeSession.accessToken)
        }
        guard (200..<300).contains(result.response.statusCode) else {
            throw SupabaseClientError.server(Self.errorMessage(from: result.data, status: result.response.statusCode))
        }
        let records = try JSONDecoder().decode([AnniversaryRecord].self, from: result.data)
        return (activeSession, records)
    }

    private func fetchAnniversaries(accessToken: String) async throws -> (data: Data, response: HTTPURLResponse) {
        var components = URLComponents(
            url: baseURL.appendingPathComponent("rest").appendingPathComponent("v1").appendingPathComponent("anniversaries"),
            resolvingAgainstBaseURL: false
        )
        components?.queryItems = [
            URLQueryItem(name: "select", value: "id,person_name,relationship,lunar_day,lunar_month"),
            URLQueryItem(name: "order", value: "lunar_month.asc,lunar_day.asc,person_name.asc"),
        ]
        guard let url = components?.url else { throw SupabaseClientError.invalidResponse }
        var request = makeRequest(url: url, method: "GET")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw SupabaseClientError.invalidResponse }
        return (data, http)
    }

    private func refreshSession(refreshToken: String) async throws -> SupabaseSession {
        var components = URLComponents(
            url: baseURL.appendingPathComponent("auth").appendingPathComponent("v1").appendingPathComponent("token"),
            resolvingAgainstBaseURL: false
        )
        components?.queryItems = [URLQueryItem(name: "grant_type", value: "refresh_token")]
        guard let url = components?.url else { throw SupabaseClientError.invalidResponse }
        var request = makeRequest(url: url, method: "POST")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["refresh_token": refreshToken])
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw SupabaseClientError.invalidResponse }
        guard (200..<300).contains(http.statusCode) else {
            SessionKeychain.clear()
            throw SupabaseClientError.server("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.")
        }
        return try JSONDecoder().decode(SupabaseSession.self, from: data)
    }

    private func makeRequest(url: URL, method: String) -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        return request
    }

    private func validateConfiguration() throws {
        guard !apiKey.isEmpty, !apiKey.contains("YOUR_PUBLIC_"), baseURL.host != "invalid.local" else {
            throw SupabaseClientError.missingConfiguration
        }
    }

    private static func errorMessage(from data: Data, status: Int) -> String {
        if
            let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let message = (object["msg"] as? String)
                ?? (object["message"] as? String)
                ?? (object["error_description"] as? String)
                ?? (object["error"] as? String)
        {
            if message.localizedCaseInsensitiveContains("invalid login credentials") {
                return "Email hoặc mật khẩu không chính xác."
            }
            if message.localizedCaseInsensitiveContains("email not confirmed") {
                return "Email chưa được xác nhận. Hãy kiểm tra hộp thư trước khi đăng nhập."
            }
            return message
        }
        return "Không thể kết nối Supabase (HTTP \(status))."
    }
}

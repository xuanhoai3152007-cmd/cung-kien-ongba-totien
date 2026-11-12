import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { ProductIllustrationKind } from './ProductIllustration'

export type Region = 'Tất cả' | 'Bắc' | 'Trung' | 'Nam'

export type ApiUser = {
  id: string
  fullName: string
  email: string
  phone: string
  region: Region
  remindersEnabled: boolean
  remindDays: 1 | 2 | 3
  isAdmin: boolean
}

export type ApiAnniversary = {
  id: string
  personName: string
  relationship: string
  lunarDay: number
  lunarMonth: number
  note: string
}

export type AdminHoliday = {
  id: string
  title: string
  category: string
  lunar: string
  lunarDay: number | null
  lunarMonth: number | null
  everyLunarMonth: boolean
  religion: 'Phật giáo' | 'Thiên Chúa giáo' | null
  solarMonth: number | null
  solarDay: number | null
  easterOffsetDays: number | null
  solar: string
  tags: string[]
  description: string
  region: Region
  countdown: string
}

export type AdminProduct = {
  id: string
  name: string
  illustration: ProductIllustrationKind
  price: number
  unit: string
  category: string
  badge: string
  region: Region
}

export type AdminPrayer = {
  holidayId: string
  region: Exclude<Region, 'Tất cả'>
  content: string
}

type ProfileRow = {
  id: string
  full_name: string
  phone: string
  region: Region
  reminders_enabled: boolean
  remind_days: number
  updated_at: string
}

type HolidayRow = {
  id: string
  title: string
  category: string
  lunar: string
  lunar_day: number | null
  lunar_month: number | null
  every_lunar_month: boolean
  religion: 'Phật giáo' | 'Thiên Chúa giáo' | null
  solar_month: number | null
  solar_day: number | null
  easter_offset_days: number | null
  solar: string
  tags: string[]
  description: string
  region: Region
  countdown: string
  created_at: string
  updated_at: string
}

type ProductRow = {
  id: string
  name: string
  illustration: ProductIllustrationKind
  price: number
  unit: string
  category: string
  badge: string
  region: Region
  created_at: string
  updated_at: string
}

type PrayerRow = {
  holiday_id: string
  region: Exclude<Region, 'Tất cả'>
  content: string
  updated_at: string
}

type AnniversaryRow = {
  id: string
  user_id: string
  person_name: string
  relationship: string
  lunar_day: number
  lunar_month: number
  note: string
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: {
          id: string
          full_name?: string
          phone?: string
          region?: Region
          reminders_enabled?: boolean
          remind_days?: number
          updated_at?: string
        }
        Update: {
          full_name?: string
          phone?: string
          region?: Region
          reminders_enabled?: boolean
          remind_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      anniversaries: {
        Row: AnniversaryRow
        Insert: {
          id?: string
          user_id: string
          person_name: string
          relationship: string
          lunar_day: number
          lunar_month: number
          note?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          person_name?: string
          relationship?: string
          lunar_day?: number
          lunar_month?: number
          note?: string
          updated_at?: string
        }
        Relationships: []
      }
      holidays: {
        Row: HolidayRow
        Insert: Omit<HolidayRow, 'created_at' | 'updated_at'> & Partial<Pick<HolidayRow, 'created_at' | 'updated_at'>>
        Update: Partial<Omit<HolidayRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      catalog_products: {
        Row: ProductRow
        Insert: Omit<ProductRow, 'created_at' | 'updated_at'> & Partial<Pick<ProductRow, 'created_at' | 'updated_at'>>
        Update: Partial<Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      prayers: {
        Row: PrayerRow
        Insert: PrayerRow
        Update: Partial<Omit<PrayerRow, 'holiday_id' | 'region'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_current_user_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

let client: SupabaseClient<Database> | null = null

function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new ApiError('Chưa cấu hình Supabase. Hãy điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env.local rồi khởi động lại ứng dụng.', 0)
  }
  client ??= createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  })
  return client
}

function raiseSupabaseError(error: { message: string; code?: string }, status = 400): never {
  if (error.code === 'PGRST116') throw new ApiError('Không tìm thấy dữ liệu hoặc dữ liệu không còn tồn tại.', 404)
  const message = error.message.toLocaleLowerCase('en')
  if (message.includes('invalid login credentials')) {
    throw new ApiError('Email hoặc mật khẩu không chính xác.', 401)
  }
  if (message.includes('user already registered')) {
    throw new ApiError('Email này đã được đăng ký.')
  }
  if (message.includes('password should be at least')) {
    throw new ApiError('Mật khẩu chưa đạt độ dài tối thiểu của Supabase.')
  }
  if (message.includes('email not confirmed')) {
    throw new ApiError('Email chưa được xác nhận. Hãy kiểm tra hộp thư trước khi đăng nhập.', 401)
  }
  throw new ApiError(error.message, status)
}

function toApiUser(profile: ProfileRow, authUser: User): Omit<ApiUser, 'isAdmin'> {
  if (profile.remind_days !== 1 && profile.remind_days !== 2 && profile.remind_days !== 3) {
    throw new ApiError('Thiết lập nhắc ngày giỗ trong hồ sơ không hợp lệ.', 500)
  }
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: authUser.email ?? '',
    phone: profile.phone,
    region: profile.region,
    remindersEnabled: profile.reminders_enabled,
    remindDays: profile.remind_days,
  }
}

function toApiAnniversary(row: AnniversaryRow): ApiAnniversary {
  return {
    id: row.id,
    personName: row.person_name,
    relationship: row.relationship,
    lunarDay: row.lunar_day,
    lunarMonth: row.lunar_month,
    note: row.note,
  }
}

function toAdminHoliday(row: HolidayRow): AdminHoliday {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    lunar: row.lunar,
    lunarDay: row.lunar_day,
    lunarMonth: row.lunar_month,
    everyLunarMonth: row.every_lunar_month,
    religion: row.religion,
    solarMonth: row.solar_month,
    solarDay: row.solar_day,
    easterOffsetDays: row.easter_offset_days,
    solar: row.solar,
    tags: row.tags,
    description: row.description,
    region: row.region,
    countdown: row.countdown,
  }
}

function toAdminProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    name: row.name,
    illustration: row.illustration,
    price: row.price,
    unit: row.unit,
    category: row.category,
    badge: row.badge,
    region: row.region,
  }
}

function toAdminPrayer(row: PrayerRow): AdminPrayer {
  return {
    holidayId: row.holiday_id,
    region: row.region,
    content: row.content,
  }
}

async function getProfile(authUser: User) {
  const supabase = getClient()
  const [{ data, error }, adminResult] = await Promise.all([
    supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
      .single(),
    supabase.rpc('is_current_user_admin'),
  ])
  if (error) raiseSupabaseError(error, 500)
  if (adminResult.error) raiseSupabaseError(adminResult.error, 500)
  return { ...toApiUser(data, authUser), isAdmin: adminResult.data }
}

async function getAuthenticatedUser() {
  const { data, error } = await getClient().auth.getUser()
  if (error) raiseSupabaseError(error, 401)
  if (!data.user) throw new ApiError('Vui lòng đăng nhập để tiếp tục.', 401)
  return data.user
}

export const api = {
  async currentUser() {
    const authUser = await getAuthenticatedUser()
    return { user: await getProfile(authUser) }
  },

  async register(data: { fullName: string; email: string; phone: string; password: string }) {
    const { data: result, error } = await getClient().auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
        },
      },
    })
    if (error) raiseSupabaseError(error)
    if (result.user && result.user.identities?.length === 0) {
      throw new ApiError('Email này đã được đăng ký.', 409)
    }
    if (!result.session || !result.user) {
      return { user: null, needsEmailConfirmation: true as const }
    }
    return { user: await getProfile(result.user), needsEmailConfirmation: false as const }
  },

  async login(data: { email: string; password: string }) {
    const { data: result, error } = await getClient().auth.signInWithPassword(data)
    if (error) raiseSupabaseError(error, 401)
    if (!result.user) throw new ApiError('Đăng nhập không trả về thông tin tài khoản.', 500)
    return { user: await getProfile(result.user) }
  },

  async logout() {
    const { error } = await getClient().auth.signOut()
    if (error) raiseSupabaseError(error)
  },

  async updateProfile(data: Omit<ApiUser, 'id' | 'email' | 'isAdmin'>) {
    const authUser = await getAuthenticatedUser()
    const { error } = await getClient()
      .from('profiles')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        region: data.region,
        reminders_enabled: data.remindersEnabled,
        remind_days: data.remindDays,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)
    if (error) raiseSupabaseError(error)
    return { user: await getProfile(authUser) }
  },

  async listAnniversaries() {
    const { data, error } = await getClient()
      .from('anniversaries')
      .select('*')
      .order('lunar_month')
      .order('lunar_day')
      .order('person_name')
    if (error) raiseSupabaseError(error)
    return { anniversaries: data.map(toApiAnniversary) }
  },

  async createAnniversary(data: Omit<ApiAnniversary, 'id'>) {
    const authUser = await getAuthenticatedUser()
    const { data: anniversary, error } = await getClient()
      .from('anniversaries')
      .insert({
        user_id: authUser.id,
        person_name: data.personName,
        relationship: data.relationship,
        lunar_day: data.lunarDay,
        lunar_month: data.lunarMonth,
        note: data.note,
      })
      .select('*')
      .single()
    if (error) raiseSupabaseError(error)
    return { anniversary: toApiAnniversary(anniversary) }
  },

  async updateAnniversary(id: string, data: Omit<ApiAnniversary, 'id'>) {
    const { data: anniversary, error } = await getClient()
      .from('anniversaries')
      .update({
        person_name: data.personName,
        relationship: data.relationship,
        lunar_day: data.lunarDay,
        lunar_month: data.lunarMonth,
        note: data.note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) raiseSupabaseError(error)
    if (!anniversary) throw new ApiError('Không tìm thấy ngày giỗ cần cập nhật.', 404)
    return { anniversary: toApiAnniversary(anniversary) }
  },

  async deleteAnniversary(id: string) {
    const { data, error } = await getClient()
      .from('anniversaries')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()
    if (error) raiseSupabaseError(error)
    if (!data) throw new ApiError('Không tìm thấy ngày giỗ cần xóa.', 404)
  },

  async listPublicContent() {
    const supabase = getClient()
    const [holidayResult, productResult, prayerResult] = await Promise.all([
      supabase.from('holidays').select('*').order('title'),
      supabase.from('catalog_products').select('*').order('name'),
      supabase.from('prayers').select('*').order('holiday_id').order('region'),
    ])
    if (holidayResult.error) raiseSupabaseError(holidayResult.error)
    if (productResult.error) raiseSupabaseError(productResult.error)
    if (prayerResult.error) raiseSupabaseError(prayerResult.error)
    return {
      holidays: holidayResult.data.map(toAdminHoliday),
      products: productResult.data.map(toAdminProduct),
      prayers: prayerResult.data.map(toAdminPrayer),
    }
  },

  async saveAdminHoliday(holiday: AdminHoliday) {
    const { error } = await getClient().from('holidays').upsert({
      id: holiday.id,
      title: holiday.title,
      category: holiday.category,
      lunar: holiday.lunar,
      lunar_day: holiday.lunarDay,
      lunar_month: holiday.lunarMonth,
      every_lunar_month: holiday.everyLunarMonth,
      religion: holiday.religion,
      solar_month: holiday.solarMonth,
      solar_day: holiday.solarDay,
      easter_offset_days: holiday.easterOffsetDays,
      solar: holiday.solar,
      tags: holiday.tags,
      description: holiday.description,
      region: holiday.region,
      countdown: holiday.countdown,
      updated_at: new Date().toISOString(),
    })
    if (error) raiseSupabaseError(error)
  },

  async deleteAdminHoliday(id: string) {
    const supabase = getClient()
    const { error: prayerError } = await supabase.from('prayers').delete().eq('holiday_id', id)
    if (prayerError) raiseSupabaseError(prayerError)
    const { error } = await supabase.from('holidays').delete().eq('id', id)
    if (error) raiseSupabaseError(error)
  },

  async saveAdminProduct(product: AdminProduct) {
    const { error } = await getClient().from('catalog_products').upsert({
      id: product.id,
      name: product.name,
      illustration: product.illustration,
      price: product.price,
      unit: product.unit,
      category: product.category,
      badge: product.badge,
      region: product.region,
      updated_at: new Date().toISOString(),
    })
    if (error) raiseSupabaseError(error)
  },

  async deleteAdminProduct(id: string) {
    const { error } = await getClient().from('catalog_products').delete().eq('id', id)
    if (error) raiseSupabaseError(error)
  },

  async saveAdminPrayer(prayer: AdminPrayer) {
    const { error } = await getClient().from('prayers').upsert({
      holiday_id: prayer.holidayId,
      region: prayer.region,
      content: prayer.content,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'holiday_id,region' })
    if (error) raiseSupabaseError(error)
  },

  async deleteAdminPrayer(prayer: AdminPrayer) {
    const { error } = await getClient()
      .from('prayers')
      .delete()
      .eq('holiday_id', prayer.holidayId)
      .eq('region', prayer.region)
    if (error) raiseSupabaseError(error)
  },
}

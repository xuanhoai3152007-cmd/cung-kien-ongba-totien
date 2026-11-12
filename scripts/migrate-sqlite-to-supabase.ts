import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import Database from 'better-sqlite3'
import { createClient } from '@supabase/supabase-js'

type LegacyUser = {
  id: string
  full_name: string
  email: string
  phone: string
  region: 'Tất cả' | 'Bắc' | 'Trung' | 'Nam'
  reminders_enabled: number
  remind_days: 1 | 2 | 3
}

type LegacyAnniversary = {
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

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const databasePath = resolve(process.env.DATABASE_PATH ?? 'data/cung-kien.sqlite')

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the private .env.migrate file.')
}
if (!existsSync(databasePath)) {
  throw new Error(`SQLite database not found at ${databasePath}.`)
}

const sqlite = new Database(databasePath, { readonly: true, fileMustExist: true })
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function listAllSupabaseUsers() {
  const users = []
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(`Could not list Supabase Auth users: ${error.message}`)
    users.push(...data.users)
    if (data.users.length < 1000) return users
  }
}

async function migrate() {
  const legacyUsers = sqlite.prepare(`
    SELECT id, full_name, email, phone, region, reminders_enabled, remind_days
    FROM users
  `).all() as LegacyUser[]
  const legacyAnniversaries = sqlite.prepare(`
    SELECT id, user_id, person_name, relationship, lunar_day, lunar_month, note, created_at, updated_at
    FROM anniversaries
  `).all() as LegacyAnniversary[]
  const supabaseUsers = await listAllSupabaseUsers()
  const supabaseUsersByEmail = new Map(
    supabaseUsers
      .filter((user) => user.email)
      .map((user) => [user.email!.trim().toLowerCase(), user]),
  )

  const idMap = new Map<string, string>()
  const profileRows = []
  let unmatchedUsers = 0
  for (const user of legacyUsers) {
    const supabaseUser = supabaseUsersByEmail.get(user.email.trim().toLowerCase())
    if (!supabaseUser) {
      unmatchedUsers += 1
      continue
    }
    idMap.set(user.id, supabaseUser.id)
    profileRows.push({
      id: supabaseUser.id,
      full_name: user.full_name,
      phone: user.phone,
      region: user.region,
      reminders_enabled: Boolean(user.reminders_enabled),
      remind_days: user.remind_days,
    })
  }

  for (let offset = 0; offset < profileRows.length; offset += 500) {
    const { error } = await supabase.from('profiles').upsert(profileRows.slice(offset, offset + 500))
    if (error) throw new Error(`Could not migrate profiles: ${error.message}`)
  }

  const anniversaryRows = legacyAnniversaries.flatMap((item) => {
    const newUserId = idMap.get(item.user_id)
    if (!newUserId) return []
    return [{
      id: item.id,
      user_id: newUserId,
      person_name: item.person_name,
      relationship: item.relationship,
      lunar_day: item.lunar_day,
      lunar_month: item.lunar_month,
      note: item.note,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }]
  })
  for (let offset = 0; offset < anniversaryRows.length; offset += 500) {
    const { error } = await supabase
      .from('anniversaries')
      .upsert(anniversaryRows.slice(offset, offset + 500))
    if (error) throw new Error(`Could not migrate anniversaries: ${error.message}`)
  }

  console.log(`Migrated profiles: ${profileRows.length}`)
  console.log(`Migrated anniversaries: ${anniversaryRows.length}`)
  console.log(`Skipped users without a matching Supabase Auth email: ${unmatchedUsers}`)
  if (unmatchedUsers > 0) {
    console.log('Those users must first create and confirm a Supabase account using the same email, then rerun this migration.')
  }
  console.log('Existing SQLite passwords are not transferred; users set a new password in Supabase Auth.')
}

try {
  await migrate()
} finally {
  sqlite.close()
}

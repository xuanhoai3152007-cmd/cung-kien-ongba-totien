import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import './App.css'

type View = 'home' | 'calendar' | 'plans' | 'guides' | 'ritual' | 'checklist'
type Category = 'Gia tiên' | 'Mùng 1 & ngày rằm' | 'Ngày giỗ' | 'Lễ truyền thống' | 'Chúng sinh'
type ChecklistFilter = 'Tất cả' | 'Chưa chuẩn bị' | 'Đã chuẩn bị'

type Offering = {
  id: string
  name: string
  quantity: string
  unit: string
  optional: boolean
  checked: boolean
  note: string
}

type Plan = {
  id: string
  title: string
  lunarDate: string
  status: 'Đang chuẩn bị' | 'Hoàn thành'
  checklist: Offering[]
}

type Ritual = {
  id: string
  title: string
  category: Category
  lunarDate: string
  description: string
  icon: string
}

const rituals: Ritual[] = [
  {
    id: 'gia-tien',
    title: 'Lễ gia tiên',
    category: 'Gia tiên',
    lunarDate: 'Ngày thường theo nếp nhà',
    description: 'Gợi ý chuẩn bị lễ tưởng nhớ gia tiên, tùy theo phong tục và điều kiện của mỗi gia đình.',
    icon: '⌂',
  },
  {
    id: 'mung-mot',
    title: 'Lễ mùng 1',
    category: 'Mùng 1 & ngày rằm',
    lunarDate: 'Ngày mùng 1 âm lịch',
    description: 'Một dịp thắp hương đầu tháng. Lễ vật có thể giản dị, linh hoạt theo nếp sinh hoạt gia đình.',
    icon: '☼',
  },
  {
    id: 'ngay-ram',
    title: 'Lễ ngày rằm',
    category: 'Mùng 1 & ngày rằm',
    lunarDate: 'Ngày 15 âm lịch',
    description: 'Gợi ý chuẩn bị lễ ngày rằm. Ngày dương lịch cần được đối chiếu lịch âm đã xác minh.',
    icon: '◐',
  },
  {
    id: 'ngay-gio',
    title: 'Ngày giỗ',
    category: 'Ngày giỗ',
    lunarDate: 'Theo ngày của gia đình',
    description: 'Lưu lại ngày giỗ và danh sách chuẩn bị riêng để thuận tiện cho những lần sau.',
    icon: '✿',
  },
  {
    id: 'tet',
    title: 'Tết Nguyên Đán',
    category: 'Lễ truyền thống',
    lunarDate: 'Theo lịch âm',
    description: 'Tham khảo các đầu việc chuẩn bị Tết, điều chỉnh theo truyền thống riêng của gia đình.',
    icon: '✳',
  },
  {
    id: 'chung-sinh',
    title: 'Lễ chúng sinh',
    category: 'Chúng sinh',
    lunarDate: 'Theo phong tục địa phương',
    description: 'Nghi lễ có cách thực hành khác nhau. Không mặc định gộp lễ chúng sinh với lễ gia tiên.',
    icon: '❋',
  },
]

const sampleOfferings: Offering[] = [
  { id: 'hoa', name: 'Hoa tươi', quantity: '1', unit: 'bình', optional: true, checked: false, note: '' },
  { id: 'qua', name: 'Trái cây', quantity: '1', unit: 'đĩa', optional: true, checked: false, note: '' },
  { id: 'nuoc', name: 'Nước sạch', quantity: '3', unit: 'chén', optional: true, checked: false, note: '' },
  { id: 'nhang', name: 'Nhang / hương', quantity: '1', unit: 'bó', optional: true, checked: false, note: 'Sử dụng an toàn, có người trông nom.' },
]

const initialPlans: Plan[] = []

function isOffering(value: unknown): value is Offering {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string'
    && typeof item.name === 'string'
    && typeof item.quantity === 'string'
    && typeof item.unit === 'string'
    && typeof item.optional === 'boolean'
    && typeof item.checked === 'boolean'
    && typeof item.note === 'string'
}

function isPlan(value: unknown): value is Plan {
  if (!value || typeof value !== 'object') return false
  const plan = value as Record<string, unknown>
  return typeof plan.id === 'string'
    && typeof plan.title === 'string'
    && typeof plan.lunarDate === 'string'
    && (plan.status === 'Đang chuẩn bị' || plan.status === 'Hoàn thành')
    && Array.isArray(plan.checklist)
    && plan.checklist.every(isOffering)
}

const iconContent: Record<string, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 16a2 2 0 0 1 2-2h14M8 7h8" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  warning: <><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 3h.01" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
  sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {iconContent[name]}
    </svg>
  )
}

function readPlans(): { plans: Plan[]; error: string } {
  try {
    const saved = localStorage.getItem('lich-cung-viet-plans')
    if (!saved) return { plans: initialPlans, error: '' }
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed) || !parsed.every(isPlan)) throw new Error('Dữ liệu kế hoạch không đúng định dạng.')
    return { plans: parsed, error: '' }
  } catch (error) {
    console.error('Không thể đọc kế hoạch đã lưu:', error)
    return { plans: initialPlans, error: 'Không thể đọc dữ liệu đã lưu trên thiết bị.' }
  }
}

function App() {
  const [view, setView] = useState<View>('home')
  const [activeRitualId, setActiveRitualId] = useState(rituals[0].id)
  const [filter, setFilter] = useState<Category | 'Tất cả'>('Tất cả')
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const [calendarMode, setCalendarMode] = useState<'Tháng' | 'Danh sách'>('Tháng')
  const [checklistFilter, setChecklistFilter] = useState<ChecklistFilter>('Tất cả')
  const [newOffering, setNewOffering] = useState('')
  const [toast, setToast] = useState('')
  const [planTitleDraft, setPlanTitleDraft] = useState('')
  const [initialStore] = useState(readPlans)
  const [storageError, setStorageError] = useState(initialStore.error)
  const [plans, setPlans] = useState<Plan[]>(initialStore.plans)
  const [selectedPlanId, setSelectedPlanId] = useState('')

  const activeRitual = rituals.find((ritual) => ritual.id === activeRitualId) ?? rituals[0]
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0]
  const currentPlan = selectedPlan
  const upcomingRituals = rituals.slice(0, 4)
  const visibleRituals = useMemo(
    () => filter === 'Tất cả' ? rituals : rituals.filter((ritual) => ritual.category === filter),
    [filter],
  )
  const completedCount = currentPlan?.checklist.filter((item) => item.checked).length ?? 0
  const progress = currentPlan?.checklist.length ? Math.round((completedCount / currentPlan.checklist.length) * 100) : 0

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function openRitual(ritual: Ritual) {
    setActiveRitualId(ritual.id)
    setView('ritual')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function createPlan(ritual: Ritual) {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const plan: Plan = {
      id,
      title: ritual.title,
      lunarDate: ritual.lunarDate,
      status: 'Đang chuẩn bị',
      checklist: sampleOfferings.map((item) => ({ ...item, id: `${id}-${item.id}`, checked: false })),
    }
    savePlans([plan, ...plans])
    setSelectedPlanId(id)
    setView('checklist')
    setToast('Đã tạo kế hoạch trên thiết bị này.')
  }

  function updatePlanChecklist(updater: (items: Offering[]) => Offering[]) {
    if (!currentPlan) return
    savePlans(plans.map((plan) => {
      if (plan.id !== currentPlan.id) return plan
      const checklist = updater(plan.checklist)
      const completed = checklist.length > 0 && checklist.every((item) => item.checked)
      return { ...plan, checklist, status: completed ? 'Hoàn thành' : 'Đang chuẩn bị' }
    }))
  }

  function savePlans(nextPlans: Plan[]) {
    setPlans(nextPlans)
    try {
      localStorage.setItem('lich-cung-viet-plans', JSON.stringify(nextPlans))
      setStorageError('')
    } catch (error) {
      console.error('Không thể lưu kế hoạch:', error)
      setStorageError('Không thể lưu kế hoạch. Hãy kiểm tra dung lượng lưu trữ của trình duyệt.')
    }
  }

  function addOffering(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newOffering.trim()
    if (!name || !currentPlan) return
    updatePlanChecklist((items) => [...items, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      quantity: '1',
      unit: 'phần',
      optional: true,
      checked: false,
      note: '',
    }])
    setNewOffering('')
    setToast('Đã thêm lễ vật vào checklist.')
  }

  function removeOffering(id: string) {
    if (!window.confirm('Bỏ lễ vật này khỏi checklist?')) return
    updatePlanChecklist((items) => items.filter((item) => item.id !== id))
  }

  async function copyChecklist() {
    if (!currentPlan) return
    const text = `${currentPlan.title}\n${currentPlan.checklist.map((item) => `- [${item.checked ? 'x' : ' '}] ${item.name}: ${item.quantity} ${item.unit}${item.optional ? ' (tùy chọn)' : ''}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      setToast('Đã sao chép checklist.')
    } catch (error) {
      console.error('Không thể sao chép checklist:', error)
      setToast('Trình duyệt không cho phép sao chép. Hãy thử lại trên kết nối bảo mật.')
    }
  }

  async function copyRitualChecklist(ritual: Ritual) {
    const text = `${ritual.title}\n${sampleOfferings.map((item) => `- [ ] ${item.name}: ${item.quantity} ${item.unit} (tùy chọn)`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      setToast('Đã sao chép checklist gợi ý.')
    } catch (error) {
      console.error('Không thể sao chép checklist:', error)
      setToast('Trình duyệt không cho phép sao chép. Hãy thử lại trên kết nối bảo mật.')
    }
  }

  function navigate(nextView: View) {
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay()
    const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()
    const mondayOffset = (firstWeekday + 6) % 7
    return [...Array(mondayOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)]
  }, [calendarDate])

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); navigate('home') }}>
          <span className="brand-mark" aria-hidden="true">L</span>
          <span className="brand-name">Lịch Cúng <b>Việt</b><small>GIỮ NẾP NHÀ, TRỌN TẤM LÒNG</small></span>
        </a>
        <span className="header-today"><span aria-hidden="true" /> Hôm nay · {new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(new Date())}</span>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <button className={view === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Trang chủ</button>
          <button className={view === 'calendar' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('calendar')}>Lịch cúng</button>
          <button className={view === 'plans' || view === 'checklist' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('plans')}>Kế hoạch</button>
          <button className={view === 'guides' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('guides')}>Hướng dẫn</button>
        </nav>
        <button className="header-action" onClick={() => navigate('plans')}><Icon name="list" size={17} /> Kế hoạch của tôi</button>
      </header>

      <main>
        {view === 'home' && (
          <>
            <section className="hero-section">
              <div className="hero-copy">
                <span className="eyebrow"><span className="eyebrow-line" /> NẾP NHÀ VIỆT · LÒNG THÀNH KÍNH</span>
                <h1>Chủ động chuẩn bị ngày lễ,<br /><em>giữ gìn nếp nhà.</em></h1>
                <p className="hero-description">Gom những điều cần nhớ vào một nơi — để mỗi dịp sum vầy, bạn an tâm dành trọn lòng thành.</p>
                <div className="hero-actions">
                  <button className="button button-primary" onClick={() => navigate('calendar')}>Xem lịch cúng <Icon name="arrow" size={17} /></button>
                  <button className="button button-secondary" onClick={() => createPlan(rituals[0])}><Icon name="plus" size={17} /> Tạo kế hoạch</button>
                </div>
                <div className="hero-footnote"><Icon name="sparkle" size={17} /> Mỗi nhà mỗi nếp — mọi gợi ý đều tùy chọn.</div>
              </div>
              <div className="hero-art" aria-label="Minh họa bàn trà và bình hoa truyền thống">
                <div className="sun-disc" />
                <div className="art-arch"><div className="art-window"><span>春</span></div></div>
                <div className="art-table">
                  <div className="vase"><span className="branch branch-one" /><span className="branch branch-two" /><span className="flower flower-one">✿</span><span className="flower flower-two">✿</span><span className="flower flower-three">✿</span></div>
                  <div className="tea-set"><span className="tea-cup" /><span className="tea-pot" /></div>
                  <div className="offering-plate"><span>✿</span><span>✿</span><span>✿</span></div>
                </div>
                <div className="art-caption"><span>01</span> Một chút chuẩn bị<br />cho ngày sum vầy</div>
                <span className="art-stamp">家</span>
              </div>
            </section>

            <section className="today-banner">
              <div className="today-date"><span className="today-icon"><Icon name="calendar" size={20} /></span><div><strong>Hôm nay</strong><span>{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span></div></div>
              <div className="today-message"><span className="status-dot" /> Chưa có ngày lễ nào được xác minh cho hôm nay.</div>
              <button className="text-link" onClick={() => navigate('calendar')}>Mở lịch <Icon name="arrow" size={16} /></button>
            </section>

            <section className="section-block">
              <div className="section-heading">
                <div><span className="eyebrow">BẮT ĐẦU TỪ ĐIỀU QUEN THUỘC</span><h2>Mỗi dịp một cách <em>chu toàn</em></h2></div>
                <button className="text-link" onClick={() => navigate('calendar')}>Tất cả dịp lễ <Icon name="arrow" size={16} /></button>
              </div>
              <div className="category-grid">
                {rituals.slice(0, 5).map((ritual, index) => (
                  <button key={ritual.id} className="category-card" onClick={() => openRitual(ritual)}>
                    <span className={`category-illustration illustration-${index}`} aria-hidden="true">{ritual.icon}</span>
                    <span className="category-card-title">{ritual.title}</span>
                    <span className="category-card-subtitle">{ritual.category}</span>
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
            </section>

            <section className="section-block upcoming-block">
              <div className="section-heading">
                <div><span className="eyebrow">NHẸ NHÀNG NHẮC MÌNH</span><h2>Dịp lễ <em>đáng nhớ</em></h2></div>
                <button className="text-link" onClick={() => navigate('calendar')}>Xem lịch đầy đủ <Icon name="arrow" size={16} /></button>
              </div>
              <div className="upcoming-grid">
                {upcomingRituals.map((ritual) => (
                  <button className="upcoming-card" key={ritual.id} onClick={() => openRitual(ritual)}>
                    <span className="upcoming-date"><span>{ritual.lunarDate}</span><Icon name="arrow" size={16} /></span>
                    <strong>{ritual.title}</strong>
                    <span className="unverified-label"><Icon name="warning" size={14} /> Ngày dương cần xác nhận</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'calendar' && (
          <section className="page-section">
            <div className="page-intro"><span className="eyebrow">LỊCH CÚNG</span><h1>Ngày lành, <em>lòng an.</em></h1><p>Tra cứu dịp lễ và ghi chú riêng. Ngày dương lịch chỉ hiển thị khi đã được xác minh.</p></div>
            <div className="calendar-toolbar">
              <div className="month-controls"><button className="icon-button" aria-label="Tháng trước" onClick={() => setCalendarDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}><Icon name="chevronLeft" /></button><h2>{new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(calendarDate)}</h2><button className="icon-button" aria-label="Tháng sau" onClick={() => setCalendarDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}><Icon name="chevronRight" /></button></div>
              <div className="segmented-control" aria-label="Kiểu hiển thị lịch">{(['Tháng', 'Danh sách'] as const).map((mode) => <button key={mode} className={calendarMode === mode ? 'selected' : ''} onClick={() => setCalendarMode(mode)}>{mode}</button>)}</div>
            </div>
            <CategoryFilters filter={filter} onChange={setFilter} />
            {calendarMode === 'Tháng' ? (
              <>
                <div className="calendar-panel">
                  <div className="calendar-grid calendar-weekdays">{['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day) => <span key={day}>{day}</span>)}</div>
                  <div className="calendar-grid calendar-dates">{calendarDays.map((day, index) => <div key={`${day ?? 'blank'}-${index}`} className={`calendar-day ${day === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth() && calendarDate.getFullYear() === new Date().getFullYear() ? 'is-today' : ''}`}>{day && <><span>{day}</span>{day === 1 && <small>Ngày âm chưa đối chiếu</small>}</>}</div>)}</div>
                  <p className="calendar-note"><Icon name="warning" size={16} /> Lịch tháng hiển thị ngày dương. Chưa có dữ liệu quy đổi âm/dương đã xác minh.</p>
                </div>
                <div className="section-heading list-heading"><div><span className="eyebrow">GỢI Ý THAM KHẢO</span><h2>Các dịp lễ <em>phổ biến</em></h2></div></div>
                <div className="ritual-list">{visibleRituals.map((ritual) => <RitualRow key={`all-${ritual.id}`} ritual={ritual} onClick={() => openRitual(ritual)} />)}</div>
              </>
            ) : (
              <>
                <div className="section-heading list-heading"><div><span className="eyebrow">GỢI Ý THAM KHẢO</span><h2>Các dịp lễ <em>phổ biến</em></h2></div></div>
                <div className="ritual-list">{visibleRituals.map((ritual) => <RitualRow key={ritual.id} ritual={ritual} onClick={() => openRitual(ritual)} />)}</div>
              </>
            )}
          </section>
        )}

        {view === 'ritual' && (
          <section className="page-section">
            <button className="back-link" onClick={() => navigate('calendar')}><Icon name="chevronLeft" size={16} /> Quay lại lịch cúng</button>
            <div className="ritual-detail">
              <div className="detail-icon">{activeRitual.icon}</div>
              <span className="eyebrow">{activeRitual.category.toUpperCase()}</span>
              <h1>{activeRitual.title}</h1>
              <p className="detail-description">{activeRitual.description}</p>
              <div className="date-warning"><Icon name="warning" size={19} /><div><strong>Ngày dương lịch chưa được xác minh</strong><span>{activeRitual.lunarDate}. Vui lòng đối chiếu lịch âm đáng tin cậy trước khi lên lịch.</span></div></div>
              <div className="detail-columns">
                <div className="detail-card"><span className="eyebrow">GỢI Ý LỄ VẬT</span><h2>Đơn sơ, tùy lòng</h2><p>Hoa tươi, trái cây và nước sạch có thể là những lựa chọn giản dị. Lễ mặn, vàng mã và giờ cúng đều tùy phong tục gia đình.</p><ul><li>Không có danh sách bắt buộc.</li><li>Cân nhắc điều kiện và nếp nhà.</li><li>Thắp nhang, dùng lửa an toàn.</li></ul></div>
                <div className="detail-card detail-note"><span className="eyebrow">LƯU Ý PHONG TỤC</span><h2>Mỗi nhà mỗi nếp</h2><p>Phong tục có thể khác nhau theo vùng miền và từng gia đình. Nội dung này chỉ mang tính tham khảo, không thay thế hướng dẫn của gia đình bạn.</p><button className="text-link" onClick={() => navigate('guides')}>Đọc hướng dẫn <Icon name="arrow" size={16} /></button></div>
              </div>
              <div className="detail-actions"><button className="button button-primary" onClick={() => createPlan(activeRitual)}><Icon name="plus" size={17} /> Tạo kế hoạch</button><button className="button button-secondary" onClick={() => void copyRitualChecklist(activeRitual)}><Icon name="copy" size={17} /> Sao chép checklist</button></div>
            </div>
          </section>
        )}

        {view === 'plans' && (
          <section className="page-section">
            <div className="page-intro"><span className="eyebrow">GÓC CHUẨN BỊ CỦA RIÊNG BẠN</span><h1>Kế hoạch <em>của tôi.</em></h1><p>Các kế hoạch được lưu trên thiết bị này, không đồng bộ lên máy chủ.</p></div>
            <div className="plans-toolbar"><span>{plans.length} kế hoạch</span><button className="button button-primary" onClick={() => createPlan(rituals[0])}><Icon name="plus" size={17} /> Tạo kế hoạch</button></div>
            {plans.length === 0 ? <EmptyState title="Chưa có kế hoạch nào" description="Chọn một dịp lễ để bắt đầu checklist chuẩn bị theo cách của gia đình bạn." action="Khám phá dịp lễ" onAction={() => navigate('calendar')} /> : (
              <div className="plan-grid">{plans.map((plan) => <button className="plan-card" key={plan.id} onClick={() => { setSelectedPlanId(plan.id); setPlanTitleDraft(''); navigate('checklist') }}><span className="plan-card-icon"><Icon name="list" size={21} /></span><span className="plan-status"><span className="status-dot" />{plan.status}</span><strong>{plan.title}</strong><span className="plan-meta">{plan.lunarDate}</span><span className="plan-progress">{plan.checklist.filter((item) => item.checked).length} / {plan.checklist.length} việc đã chuẩn bị</span><span className="mini-progress"><span style={{ width: `${plan.checklist.length ? Math.round(plan.checklist.filter((item) => item.checked).length / plan.checklist.length * 100) : 0}%` }} /></span></button>)}</div>
            )}
          </section>
        )}

        {view === 'checklist' && (
          <section className="page-section">
            <button className="back-link" onClick={() => navigate('plans')}><Icon name="chevronLeft" size={16} /> Tất cả kế hoạch</button>
            {!currentPlan ? <EmptyState title="Chưa có kế hoạch để xem" description="Tạo một kế hoạch từ dịp lễ bạn muốn chuẩn bị." action="Tạo kế hoạch" onAction={() => createPlan(rituals[0])} /> : <>
              <div className="checklist-heading"><div><span className="eyebrow">CHECKLIST CHUẨN BỊ</span><form className="plan-title-form" onSubmit={(event) => { event.preventDefault(); const title = planTitleDraft.trim(); if (!title) { setToast('Tên kế hoạch không được để trống.'); return } savePlans(plans.map((plan) => plan.id === currentPlan.id ? { ...plan, title } : plan)); setPlanTitleDraft(''); setToast('Đã cập nhật tên kế hoạch.') }}><label className="visually-hidden" htmlFor="plan-title">Tên kế hoạch</label><input id="plan-title" value={planTitleDraft || currentPlan.title} onChange={(event) => setPlanTitleDraft(event.target.value)} /><button className="button button-secondary" type="submit">Lưu tên</button></form><p>{currentPlan.lunarDate} <span className="date-caution"><Icon name="warning" size={14} /> Ngày dương cần xác nhận</span></p></div><div className="checklist-heading-actions"><button className="button button-secondary" onClick={() => void copyChecklist()}><Icon name="copy" size={17} /> Sao chép checklist</button><button className="button button-danger" onClick={() => { if (!window.confirm(`Xóa kế hoạch “${currentPlan.title}”?`)) return; savePlans(plans.filter((plan) => plan.id !== currentPlan.id)); setSelectedPlanId(''); navigate('plans'); setToast('Đã xóa kế hoạch.') }}><Icon name="trash" size={16} /> Xóa</button></div></div>
              <div className="progress-card"><div><span>Tiến độ chuẩn bị</span><strong>{completedCount} <small>/ {currentPlan.checklist.length} việc</small></strong></div><strong className="progress-percent">{progress}%</strong><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
              <div className="checklist-layout">
                <div className="checklist-main">
                  <div className="checklist-toolbar"><h2>Đồ lễ & việc cần làm</h2><div className="segmented-control">{(['Tất cả', 'Chưa chuẩn bị', 'Đã chuẩn bị'] as const).map((item) => <button key={item} className={checklistFilter === item ? 'selected' : ''} onClick={() => setChecklistFilter(item)}>{item}</button>)}</div></div>
                  <div className="checklist-items">{currentPlan.checklist.filter((item) => checklistFilter === 'Tất cả' || (checklistFilter === 'Đã chuẩn bị' ? item.checked : !item.checked)).map((item) => <div className={`checklist-item ${item.checked ? 'is-checked' : ''}`} key={item.id}><button className="check-box" aria-label={`${item.checked ? 'Bỏ đánh dấu' : 'Đánh dấu'} ${item.name}`} aria-pressed={item.checked} onClick={() => updatePlanChecklist((items) => items.map((entry) => entry.id === item.id ? { ...entry, checked: !entry.checked } : entry))}>{item.checked && <Icon name="check" size={15} />}</button><div className="item-details"><div className="item-name-line"><label className="visually-hidden" htmlFor={`item-name-${item.id}`}>Tên lễ vật</label><input id={`item-name-${item.id}`} className="item-name-input" value={item.name} onChange={(event) => updatePlanChecklist((items) => items.map((entry) => entry.id === item.id ? { ...entry, name: event.target.value } : entry))} /><span className="optional-tag">Tùy chọn</span></div><label className="visually-hidden" htmlFor={`item-note-${item.id}`}>Ghi chú lễ vật</label><input id={`item-note-${item.id}`} className="item-note-input" value={item.note} placeholder="Thêm ghi chú..." onChange={(event) => updatePlanChecklist((items) => items.map((entry) => entry.id === item.id ? { ...entry, note: event.target.value } : entry))} /></div><label className="quantity-field"><span className="visually-hidden">Số lượng {item.name}</span><input type="number" min="0" step="any" aria-label={`Số lượng ${item.name}`} value={item.quantity} onChange={(event) => updatePlanChecklist((items) => items.map((entry) => entry.id === item.id ? { ...entry, quantity: event.target.value } : entry))} /></label><label className="unit-field"><span className="visually-hidden">Đơn vị {item.name}</span><input value={item.unit} aria-label={`Đơn vị ${item.name}`} onChange={(event) => updatePlanChecklist((items) => items.map((entry) => entry.id === item.id ? { ...entry, unit: event.target.value } : entry))} /></label><button className="icon-button delete-button" aria-label={`Xóa ${item.name}`} onClick={() => removeOffering(item.id)}><Icon name="trash" size={17} /></button></div>)}</div>
                  <form className="add-item-form" onSubmit={addOffering}><label className="visually-hidden" htmlFor="new-offering">Tên lễ vật mới</label><Icon name="plus" size={17} /><input id="new-offering" placeholder="Thêm lễ vật hoặc việc cần làm..." value={newOffering} onChange={(event) => setNewOffering(event.target.value)} /><button type="submit" disabled={!newOffering.trim()}>Thêm</button></form>
                  {currentPlan.checklist.length === 0 && <p className="empty-inline">Checklist đang trống. Thêm lễ vật hoặc việc cần làm của riêng bạn nhé.</p>}
                </div>
                <aside className="checklist-aside"><span className="aside-icon"><Icon name="sparkle" size={21} /></span><span className="eyebrow">NHẮC NHẸ</span><h3>Vừa đủ là tốt.</h3><p>Lễ vật chỉ là gợi ý, không phải điều bắt buộc. Hãy chọn cách phù hợp với nếp nhà và điều kiện của bạn.</p><div className="safety-note"><Icon name="warning" size={17} /> Để ý an toàn khi thắp nhang, dùng lửa và thu gom rác sau lễ.</div></aside>
              </div>
            </>}
          </section>
        )}

        {view === 'guides' && (
          <section className="page-section">
            <div className="page-intro"><span className="eyebrow">GÓC TÌM HIỂU</span><h1>Giữ nếp nhà, <em>hiểu thêm phong tục.</em></h1><p>Một vài lưu ý thực tế để việc chuẩn bị nhẹ nhàng và an toàn hơn.</p></div>
            <div className="guide-notice"><Icon name="warning" size={19} /><span>Thông tin mang tính tham khảo; phong tục có thể khác nhau theo vùng miền và từng gia đình.</span></div>
            <div className="guide-grid">
              <article className="guide-card"><span className="guide-number">01 / CHUẨN BỊ</span><h2>Mâm lễ không cần cầu kỳ</h2><p>Không có một danh sách lễ vật bắt buộc cho mọi gia đình. Bạn có thể chuẩn bị hoa, trái cây, nước sạch hoặc những món quen thuộc theo nếp nhà và điều kiện của mình.</p><span className="guide-foot">Gợi ý biên tập · Cập nhật khi có nguồn kiểm chứng</span></article>
              <article className="guide-card"><span className="guide-number">02 / AN TOÀN</span><h2>Thắp hương an toàn</h2><p>Đặt nhang và nến trên bề mặt vững chắc, tránh vật dễ cháy, không để lửa đang cháy khi rời khỏi nhà và đảm bảo không gian thông thoáng.</p><span className="guide-foot">Gợi ý an toàn · Luôn ưu tiên hướng dẫn phòng cháy tại địa phương</span></article>
              <article className="guide-card"><span className="guide-number">03 / TÔN TRỌNG</span><h2>Khác biệt là điều tự nhiên</h2><p>Cách thực hành có thể khác nhau giữa các vùng miền, dòng họ và gia đình. Hãy trao đổi với người thân để giữ gìn nếp riêng của nhà mình.</p><span className="guide-foot">Gợi ý biên tập · Không thay thế tư vấn chuyên môn</span></article>
              <article className="guide-card"><span className="guide-number">04 / LỊCH ÂM</span><h2>Đối chiếu ngày trước khi lên lịch</h2><p>Ngày âm và ngày dương cần được tra cứu từ lịch đáng tin cậy. Ứng dụng hiện chưa tích hợp dữ liệu lịch âm đã xác minh, vì vậy không tự quy đổi ngày.</p><span className="guide-foot">Dữ liệu lịch âm chưa được tích hợp</span></article>
            </div>
          </section>
        )}
      </main>

      <nav className="mobile-tab-bar" aria-label="Điều hướng trên điện thoại">
        <button className={view === 'home' ? 'mobile-tab active' : 'mobile-tab'} aria-current={view === 'home' ? 'page' : undefined} onClick={() => navigate('home')}><Icon name="home" size={22} /><span>Trang chủ</span></button>
        <button className={view === 'calendar' ? 'mobile-tab active' : 'mobile-tab'} aria-current={view === 'calendar' ? 'page' : undefined} onClick={() => navigate('calendar')}><Icon name="calendar" size={22} /><span>Lịch cúng</span></button>
        <button className={view === 'plans' || view === 'checklist' || view === 'ritual' ? 'mobile-tab active' : 'mobile-tab'} aria-current={view === 'plans' || view === 'checklist' || view === 'ritual' ? 'page' : undefined} onClick={() => navigate('plans')}><Icon name="list" size={22} /><span>Đồ lễ</span></button>
        <button className={view === 'guides' ? 'mobile-tab active' : 'mobile-tab'} aria-current={view === 'guides' ? 'page' : undefined} onClick={() => navigate('guides')}><Icon name="book" size={22} /><span>Hướng dẫn</span></button>
      </nav>

      <footer className="site-footer">
        <div className="footer-main"><a className="brand footer-brand" href="#" onClick={(event) => { event.preventDefault(); navigate('home') }}><span className="brand-mark">L</span><span className="brand-name">Lịch Cúng <b>Việt</b><small>GIỮ NẾP NHÀ, TRỌN TẤM LÒNG</small></span></a><p>Gìn giữ những điều thân thuộc,<br />theo cách của riêng mỗi gia đình.</p><nav aria-label="Liên kết cuối trang"><button onClick={() => navigate('guides')}>Giới thiệu</button><button onClick={() => navigate('guides')}>Quyền riêng tư</button><a href="mailto:lienhe@lichcungviet.vn">Liên hệ</a></nav></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Lịch Cúng Việt</span><span><Icon name="warning" size={14} /> Nội dung và ngày lễ chỉ mang tính tham khảo.</span></div>
      </footer>
      {storageError && <div className="storage-alert" role="alert"><Icon name="warning" size={17} /> {storageError}</div>}
      {toast && <div className="toast-message" role="status">{toast}</div>}
    </div>
  )
}

function CategoryFilters({ filter, onChange }: { filter: Category | 'Tất cả'; onChange: (value: Category | 'Tất cả') => void }) {
  const categories: (Category | 'Tất cả')[] = ['Tất cả', 'Gia tiên', 'Mùng 1 & ngày rằm', 'Ngày giỗ', 'Lễ truyền thống', 'Chúng sinh']
  return <div className="filter-row" aria-label="Lọc theo loại nghi lễ">{categories.map((category) => <button key={category} className={filter === category ? 'filter-chip selected' : 'filter-chip'} onClick={() => onChange(category)}>{category}</button>)}</div>
}

function RitualRow({ ritual, onClick }: { ritual: Ritual; onClick: () => void }) {
  return <button className="ritual-row" onClick={onClick}><span className="ritual-row-icon">{ritual.icon}</span><span className="ritual-row-info"><strong>{ritual.title}</strong><span>{ritual.category}</span></span><span className="ritual-row-date">{ritual.lunarDate}</span><span className="unverified-label"><Icon name="warning" size={14} /> Chưa xác minh</span><Icon name="arrow" size={17} /></button>
}

function EmptyState({ title, description, action, onAction }: { title: string; description: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="calendar" size={24} /></span><h2>{title}</h2><p>{description}</p><button className="button button-secondary" onClick={onAction}>{action} <Icon name="arrow" size={16} /></button></div>
}

export default App

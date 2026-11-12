import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  api,
  ApiError,
  type AdminHoliday,
  type AdminPrayer,
  type AdminProduct,
  type ApiAnniversary,
  type ApiUser,
  type Region as ApiRegion,
} from './supabase'
import { solarToLunar, type LunarDate } from './lunarCalendar'
import { ProductIllustration, type ProductIllustrationKind } from './ProductIllustration'
import './App.css'

type Region = 'Tất cả' | 'Bắc' | 'Trung' | 'Nam'
type View = 'home' | 'calendar' | 'holidays' | 'holiday-history' | 'detail' | 'shop' | 'cart' | 'guide' | 'login' | 'profile' | 'anniversaries' | 'admin'

type CartLine = {
  productId: string
  quantity: number
}

type AccountUser = ApiUser
type Anniversary = ApiAnniversary

type Holiday = {
  id: string
  title: string
  category: string
  lunar: string
  lunarDay?: number
  lunarMonth?: number
  everyLunarMonth?: boolean
  religion?: 'Phật giáo' | 'Thiên Chúa giáo'
  solarMonth?: number
  solarDay?: number
  easterOffsetDays?: number
  solar: string
  tags: string[]
  description: string
  region: Region
  countdown: string
}

type CompletedHoliday = {
  id: string
  holidayId: string
  completedAt: string
}

type PrayerRegion = Exclude<ApiRegion, 'Tất cả'>

type CalendarCell = {
  day: number | null
  lunar: LunarDate | null
  holidays: Holiday[]
  anniversaries: Anniversary[]
}

type Product = {
  id: string
  name: string
  illustration: ProductIllustrationKind
  price: number
  unit: string
  category: string
  badge: string
  region: Region
}

type Guide = {
  id: string
  title: string
  summary: string
  tag: string
  category: string
  steps: string[]
  note: string
}

const regions: Region[] = ['Tất cả', 'Bắc', 'Trung', 'Nam']

const holidays: Holiday[] = [
  {
    id: 'hung-vuong',
    title: 'Giỗ Tổ Hùng Vương',
    category: 'Lễ lớn',
    lunar: '10/3 âm lịch',
    lunarDay: 10,
    lunarMonth: 3,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Ngày tưởng niệm các Vua Hùng, gợi ý dâng hương, hoa và bày mâm đơn giản theo từng gia đình.',
    region: 'Tất cả',
    countdown: 'Đối chiếu lịch',
  },
  {
    id: 'tet-nguong',
    title: 'Tết Nguyên Đán',
    category: 'Lễ lớn',
    lunar: '1/1 âm lịch',
    lunarDay: 1,
    lunarMonth: 1,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Dịp đoàn tụ, ưu tiên mâm cỗ, hương, hoa và vật phẩm theo phong tục gia đình.',
    region: 'Tất cả',
    countdown: 'Đối chiếu lịch',
  },
  {
    id: 'via-than-tai',
    title: 'Ngày vía Thần Tài',
    category: 'Lễ vừa',
    lunar: '10/1 âm lịch',
    lunarDay: 10,
    lunarMonth: 1,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Nam', 'Trung', 'Bắc'],
    description: 'Dịp cầu mong công việc hanh thông; gia đình có thể dâng hương, hoa quả và lễ vật giản dị theo điều kiện.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'han-thuc',
    title: 'Tết Hàn Thực',
    category: 'Lễ vừa',
    lunar: '3/3 âm lịch',
    lunarDay: 3,
    lunarMonth: 3,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Dịp tưởng nhớ tổ tiên, thường có bánh trôi, bánh chay hoặc lễ vật tùy phong tục gia đình.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'phat-dan',
    title: 'Đại lễ Phật Đản',
    category: 'Lễ lớn',
    lunar: '15/4 âm lịch',
    lunarDay: 15,
    lunarMonth: 4,
    religion: 'Phật giáo',
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Ngày lễ trọng của Phật giáo; người dùng có thể tham khảo các hoạt động thiện lành và nghi thức tại cơ sở tôn giáo.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'doan-ngo',
    title: 'Tết Đoan Ngọ',
    category: 'Lễ vừa',
    lunar: '5/5 âm lịch',
    lunarDay: 5,
    lunarMonth: 5,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Dịp giữa năm với các món ăn theo tập quán địa phương; cách chuẩn bị có thể khác nhau giữa các gia đình.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'vu-lan',
    title: 'Lễ Vu Lan',
    category: 'Lễ lớn',
    lunar: '15/7 âm lịch',
    lunarDay: 15,
    lunarMonth: 7,
    religion: 'Phật giáo',
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Dịp báo hiếu và tưởng nhớ tổ tiên; tùy tín ngưỡng, gia đình có thể làm lễ tại nhà hoặc tham dự nghi thức ở chùa.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'phat-xuat-gia',
    title: 'Ngày Phật xuất gia',
    category: 'Lễ vừa',
    lunar: '8/2 âm lịch',
    lunarDay: 8,
    lunarMonth: 2,
    religion: 'Phật giáo',
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Ngày kỷ niệm theo truyền thống Phật giáo; Phật tử có thể tụng kinh, thiền tập hoặc làm việc thiện tùy pháp môn và hướng dẫn tại cơ sở tu học.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'phat-thanh-dao',
    title: 'Ngày Phật thành đạo',
    category: 'Lễ vừa',
    lunar: '8/12 âm lịch',
    lunarDay: 8,
    lunarMonth: 12,
    religion: 'Phật giáo',
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Ngày kỷ niệm Đức Phật thành đạo trong một số truyền thống Phật giáo; nghi thức và cách tính ngày có thể khác theo truyền thống.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'via-a-di-da',
    title: 'Ngày vía Phật A Di Đà',
    category: 'Lễ vừa',
    lunar: '17/11 âm lịch',
    lunarDay: 17,
    lunarMonth: 11,
    religion: 'Phật giáo',
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Ngày kỷ niệm theo Phật giáo Đại thừa; người thực hành có thể niệm Phật, tụng kinh hoặc làm việc thiện tùy truyền thống.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'giang-sinh',
    title: 'Lễ Giáng Sinh',
    category: 'Lễ lớn',
    lunar: '',
    religion: 'Thiên Chúa giáo',
    solarMonth: 12,
    solarDay: 25,
    solar: '25/12 dương lịch',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Lễ mừng Chúa Giêsu giáng sinh; giờ lễ và sinh hoạt cộng đoàn theo lịch của từng giáo xứ, giáo hội.',
    region: 'Tất cả',
    countdown: '25/12 hằng năm',
  },
  {
    id: 'le-phuc-sinh',
    title: 'Lễ Phục Sinh',
    category: 'Lễ lớn',
    lunar: '',
    religion: 'Thiên Chúa giáo',
    easterOffsetDays: 0,
    solar: 'Chủ nhật thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Lễ mừng Chúa Giêsu Kitô phục sinh; ngày được xác định theo lịch phụng vụ và có thể khác giữa các truyền thống Kitô giáo.',
    region: 'Tất cả',
    countdown: 'Theo lịch phụng vụ',
  },
  {
    id: 'thu-sau-tuan-thanh',
    title: 'Thứ Sáu Tuần Thánh',
    category: 'Lễ lớn',
    lunar: '',
    religion: 'Thiên Chúa giáo',
    easterOffsetDays: -2,
    solar: 'Thứ Sáu trước Lễ Phục Sinh',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Ngày tưởng niệm cuộc thương khó và chịu chết của Chúa Giêsu; cử hành theo hướng dẫn của giáo hội và giáo xứ.',
    region: 'Tất cả',
    countdown: 'Theo lịch phụng vụ',
  },
  {
    id: 'le-la',
    title: 'Chúa Nhật Lễ Lá',
    category: 'Lễ vừa',
    lunar: '',
    religion: 'Thiên Chúa giáo',
    easterOffsetDays: -7,
    solar: 'Chủ nhật trước Lễ Phục Sinh',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Ngày mở đầu Tuần Thánh trong nhiều truyền thống Kitô giáo; thời gian cử hành xem theo lịch của cộng đoàn địa phương.',
    region: 'Tất cả',
    countdown: 'Theo lịch phụng vụ',
  },
  {
    id: 'le-hien-xuong',
    title: 'Lễ Chúa Thăng Thiên',
    category: 'Lễ lớn',
    lunar: '',
    religion: 'Thiên Chúa giáo',
    easterOffsetDays: 39,
    solar: '40 ngày sau Lễ Phục Sinh',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Lễ kính Chúa Giêsu lên trời; một số giáo hội địa phương cử hành vào ngày khác theo lịch phụng vụ.',
    region: 'Tất cả',
    countdown: 'Theo lịch phụng vụ',
  },
  {
    id: 'le-hien-chuong',
    title: 'Lễ Chúa Thánh Thần Hiện Xuống',
    category: 'Lễ lớn',
    lunar: '',
    religion: 'Thiên Chúa giáo',
    easterOffsetDays: 49,
    solar: '50 ngày sau Lễ Phục Sinh',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Lễ kính Chúa Thánh Thần hiện xuống; ngày cử hành được tính từ Lễ Phục Sinh theo lịch phụng vụ.',
    region: 'Tất cả',
    countdown: 'Theo lịch phụng vụ',
  },
  {
    id: 'le-cac-thanh',
    title: 'Lễ Các Thánh',
    category: 'Lễ vừa',
    lunar: '',
    religion: 'Thiên Chúa giáo',
    solarMonth: 11,
    solarDay: 1,
    solar: '1/11 dương lịch',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Lễ kính các thánh trong truyền thống Công giáo; lịch phụng vụ địa phương có thể hướng dẫn giờ cử hành riêng.',
    region: 'Tất cả',
    countdown: '1/11 hằng năm',
  },
  {
    id: 'le-duc-me-hon-xac',
    title: 'Lễ Đức Mẹ Hồn Xác Lên Trời',
    category: 'Lễ lớn',
    lunar: '',
    religion: 'Thiên Chúa giáo',
    solarMonth: 8,
    solarDay: 15,
    solar: '15/8 dương lịch',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Lễ trọng kính Đức Maria trong Giáo hội Công giáo; xem giờ lễ và hướng dẫn tại giáo xứ địa phương.',
    region: 'Tất cả',
    countdown: '15/8 hằng năm',
  },
  {
    id: 'that-tich',
    title: 'Lễ Thất Tịch',
    category: 'Lễ vừa',
    lunar: '7/7 âm lịch',
    lunarDay: 7,
    lunarMonth: 7,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Ngày lễ dân gian gắn với tích Ngưu Lang – Chức Nữ; hoạt động kỷ niệm tùy vùng và gia đình.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'ong-cong-ong-tao',
    title: 'Lễ tiễn ông Công ông Táo',
    category: 'Lễ lớn',
    lunar: '23/12 âm lịch',
    lunarDay: 23,
    lunarMonth: 12,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Dịp tiễn ông Công ông Táo trước Tết; lễ vật và cách hành lễ tùy phong tục, nên giữ an toàn khi dùng lửa và không thả đồ lễ gây ô nhiễm.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'cung-do',
    title: 'Lễ cúng độ',
    category: 'Lễ vừa',
    lunar: '15/10 âm lịch',
    lunarDay: 15,
    lunarMonth: 10,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc'],
    description: 'Lễ cúng độ, thường dùng hương, đèn nến, hoa quả và vàng mã theo chế độ mỗi nhà.',
    region: 'Bắc',
    countdown: 'Đối chiếu lịch',
  },
  {
    id: 'ram',
    title: 'Ngày rằm',
    category: 'Hàng tháng',
    lunar: 'Rằm',
    lunarDay: 15,
    everyLunarMonth: true,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Trung', 'Nam'],
    description: 'Ngày rằm được nhiều gia đình cúng gia tiên, thường làm mâm đơn giản và sạch sẽ.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
  {
    id: 'trung-thu',
    title: 'Tết Trung Thu',
    category: 'Lễ lớn',
    lunar: '15/8 âm lịch',
    lunarDay: 15,
    lunarMonth: 8,
    solar: 'Dương lịch thay đổi theo năm',
    tags: ['Bắc', 'Trung', 'Nam'],
    description: 'Dịp sum họp gia đình; cách chuẩn bị và vật phẩm có thể khác nhau theo từng nhà.',
    region: 'Tất cả',
    countdown: 'Theo lịch âm',
  },
]

const prayerIntroductions: Record<PrayerRegion, string> = {
  Bắc: 'Con kính lạy tổ tiên nội ngoại và chư vị hương linh trong gia đình.',
  Trung: 'Gia đình chúng con thành kính tưởng nhớ tổ tiên nội ngoại và những người thân đã khuất.',
  Nam: 'Chúng con kính mời ông bà tổ tiên và người thân đã khuất về chứng giám lòng thành.',
}

const prayerOfferings: Record<PrayerRegion, string> = {
  Bắc: 'Chúng con sửa soạn hương hoa, trà quả cùng lễ vật thanh tịnh theo nếp nhà.',
  Trung: 'Chúng con kính dâng hương đăng, hoa quả và lễ vật tùy duyên, tùy điều kiện gia đình.',
  Nam: 'Chúng con thành tâm dâng nhang đèn, trà quả và lễ vật giản dị, tùy lòng thành kính.',
}

const holidayPrayerIntentions: Record<string, string> = {
  'hung-vuong': 'Nhân ngày Giỗ Tổ Hùng Vương, chúng con tưởng nhớ công đức các bậc tiền nhân đã dựng nước và gìn giữ non sông.',
  'tet-nguong': 'Nhân dịp Tết Nguyên Đán, chúng con kính cáo tổ tiên về năm mới, cầu mong gia đình bình an, thuận hòa và chăm làm điều thiện.',
  'via-than-tai': 'Nhân ngày vía Thần Tài, gia đình thành tâm cầu mong công việc chân chính được thuận lợi, biết quý trọng thành quả lao động và sống có nghĩa tình.',
  'han-thuc': 'Nhân Tết Hàn Thực, chúng con tưởng nhớ tổ tiên, giữ gìn nếp nhà và cầu mong gia đình thuận hòa, bình an.',
  'phat-dan': 'Nhân ngày Phật Đản, chúng con hướng tâm về lòng từ bi, nguyện sống tỉnh thức, làm việc thiện và tôn trọng muôn loài.',
  'phat-xuat-gia': 'Nhân ngày kỷ niệm Phật xuất gia, chúng con tưởng niệm hạnh nguyện tìm đường giác ngộ, nguyện học theo tinh thần buông xả và từ bi.',
  'phat-thanh-dao': 'Nhân ngày kỷ niệm Phật thành đạo, chúng con hướng tâm tu học, nuôi dưỡng trí tuệ và lòng từ bi.',
  'via-a-di-da': 'Nhân ngày vía Đức Phật A Di Đà, chúng con thành tâm niệm Phật, hướng thiện và cầu nguyện cho mọi người được an lành.',
  'doan-ngo': 'Nhân Tết Đoan Ngọ, chúng con kính cáo gia tiên, cầu mong gia đình mạnh khỏe, bình an và mùa màng thuận lợi.',
  'vu-lan': 'Nhân mùa Vu Lan, chúng con tưởng nhớ công ơn sinh thành, dưỡng dục, thành tâm cầu nguyện ông bà tổ tiên được an yên và nguyện sống hiếu kính.',
  'that-tich': 'Nhân ngày Thất Tịch, chúng con kính cáo gia tiên, cầu mong mọi người trong gia đình biết yêu thương, thủy chung và sống thuận hòa.',
  'ong-cong-ong-tao': 'Nhân ngày tiễn ông Công ông Táo, chúng con kính cáo các vị thần linh cai quản trong nhà, tiễn năm cũ và cầu mong năm mới bình an.',
  'cung-do': 'Nhân dịp lễ cúng độ theo nếp gia đình, chúng con thành tâm tưởng niệm, nguyện cầu mọi người được an yên và hướng về điều lành.',
  ram: 'Nhân ngày rằm, chúng con kính cáo gia tiên, tưởng nhớ nguồn cội và nguyện giữ gìn nếp sống thuận hòa, hiếu nghĩa.',
  'trung-thu': 'Nhân dịp Tết Trung Thu, chúng con kính cáo tổ tiên, cầu mong gia đình sum vầy, trẻ nhỏ chăm ngoan và mọi người được bình an.',
}

const christianPrayerIntentions: Record<string, string> = {
  'giang-sinh': 'Trong ngày mừng Chúa Giêsu giáng sinh, chúng con tạ ơn tình yêu và bình an mà Thiên Chúa ban tặng.',
  'le-phuc-sinh': 'Trong ngày mừng Chúa Giêsu Kitô phục sinh, chúng con tạ ơn niềm hy vọng và sự sống mới.',
  'thu-sau-tuan-thanh': 'Trong ngày tưởng niệm cuộc thương khó của Chúa Giêsu, xin giúp chúng con sống yêu thương, khiêm nhường và biết sẻ chia.',
  'le-la': 'Trong ngày Chúa Nhật Lễ Lá, xin hướng lòng chúng con về con đường yêu thương và phục vụ.',
  'le-hien-xuong': 'Trong ngày mừng Chúa Thăng Thiên, xin nâng đỡ chúng con sống theo Tin Mừng và đem điều thiện đến cho mọi người.',
  'le-hien-chuong': 'Trong ngày mừng Chúa Thánh Thần Hiện Xuống, xin ban ơn khôn ngoan, hiệp nhất và lòng can đảm để sống yêu thương.',
  'le-cac-thanh': 'Trong ngày kính các Thánh, xin cho chúng con biết noi gương đời sống bác ái và trung tín.',
  'le-duc-me-hon-xac': 'Trong ngày kính Đức Mẹ Hồn Xác Lên Trời, xin cho chúng con noi gương đức tin và lòng yêu thương.',
}

function getHolidayPrayer(holiday: Holiday, region: PrayerRegion, customPrayer?: string) {
  if (customPrayer) return customPrayer
  if (holiday.religion === 'Thiên Chúa giáo') {
    return [
      'Kính lạy Thiên Chúa là Cha nhân từ,',
      `Trong ngày ${holiday.title}, ${christianPrayerIntentions[holiday.id] ?? 'xin cho chúng con sống bình an, yêu thương và biết quan tâm đến mọi người.'}`,
      'Xin chúc lành cho cộng đoàn và gia đình chúng con; xin cho mọi người biết hiệp nhất, nâng đỡ nhau và làm điều thiện.',
      `Chúng con dâng lời cầu nguyện theo tâm tình của cộng đoàn ${region === 'Bắc' ? 'miền Bắc' : region === 'Trung' ? 'miền Trung' : 'miền Nam'} và theo hướng dẫn của giáo hội địa phương.`,
      'Chúng con cầu xin nhờ Đức Kitô, Chúa chúng con. Amen.',
    ].join('\n\n')
  }
  if (holiday.religion === 'Phật giáo') {
    return [
      'Nam mô Bổn Sư Thích Ca Mâu Ni Phật.',
      `Nhân ngày ${holiday.title}, ${holidayPrayerIntentions[holiday.id] ?? 'chúng con thành tâm hướng thiện, thực tập từ bi và tỉnh thức.'}`,
      `Nguyện cho mọi người ${region === 'Bắc' ? 'ở miền Bắc' : region === 'Trung' ? 'ở miền Trung' : 'ở miền Nam'} được bình an, biết thương yêu và giúp đỡ lẫn nhau.`,
      'Nghi thức tùy theo truyền thống tu học và hướng dẫn của chùa hoặc vị thầy.',
      'Nam mô Bổn Sư Thích Ca Mâu Ni Phật.',
    ].join('\n\n')
  }
  return [
    'Hôm nay, ngày ... tháng ... năm ... (âm lịch),',
    prayerIntroductions[region],
    holidayPrayerIntentions[holiday.id] ?? `Nhân dịp ${holiday.title}, chúng con thành tâm tưởng niệm và nguyện sống an lành, thuận hòa.`,
    prayerOfferings[region],
    'Cúi xin chứng giám tấm lòng thành. Gia đình chúng con xin ghi nhớ công ơn, sống hòa thuận và làm những việc thiện lành.',
    'Kính cáo.',
  ].join('\n\n')
}

const products: Product[] = [
  { id: 'bo-giay-vang', name: 'Bộ giấy vàng mã', illustration: 'offering', price: 150000, unit: 'bộ', category: 'Vàng mã', badge: 'Hot', region: 'Tất cả' },
  { id: 'nhang-hoa', name: 'Nhang hoa cúng gia tiên', illustration: 'incense', price: 90000, unit: 'gói', category: 'Hương', badge: 'Mùa lễ', region: 'Bắc' },
  { id: 'bo-vat-le', name: 'Bộ lễ mâm tròn', illustration: 'altar-set', price: 420000, unit: 'bộ', category: 'Mâm lễ', badge: 'Nổi bật', region: 'Nam' },
  { id: 'hoa-trai-cay', name: 'Hoa trái cây', illustration: 'fruit', price: 260000, unit: 'bó', category: 'Hoa quả', badge: 'Theo mùa', region: 'Trung' },
  { id: 'den-nen', name: 'Đèn nến linh vật', illustration: 'lantern', price: 125000, unit: 'cặp', category: 'Đèn nến', badge: 'Mới', region: 'Tất cả' },
  { id: 'tra-ngu-coc', name: 'Trà ngũ cốc', illustration: 'tea', price: 110000, unit: 'hộp', category: 'Khác', badge: 'Lunar', region: 'Nam' },
  { id: 'xe-hoi-giay', name: 'Xe hơi giấy vàng mã', illustration: 'paper-car', price: 185000, unit: 'bộ', category: 'Vàng mã', badge: 'Nổi bật', region: 'Tất cả' },
  { id: 'quan-ao-giay', name: 'Bộ quần áo giấy nam nữ', illustration: 'paper-clothes', price: 65000, unit: 'bộ', category: 'Vàng mã', badge: 'Được chọn', region: 'Tất cả' },
  { id: 'nha-giay', name: 'Nhà giấy vàng mã', illustration: 'paper-house', price: 120000, unit: 'bộ', category: 'Vàng mã', badge: 'Mới', region: 'Tất cả' },
  { id: 'ngua-giay', name: 'Ngựa giấy lễ cúng', illustration: 'paper-horse', price: 85000, unit: 'con', category: 'Vàng mã', badge: 'Truyền thống', region: 'Tất cả' },
  { id: 'nhang-tram', name: 'Nhang trầm hương', illustration: 'incense', price: 120000, unit: 'hộp', category: 'Hương', badge: 'Bán chạy', region: 'Tất cả' },
  { id: 'nhang-vong', name: 'Nhang vòng trầm', illustration: 'incense-coil', price: 95000, unit: 'hộp', category: 'Hương', badge: 'Thơm dịu', region: 'Tất cả' },
  { id: 'nhang-nu', name: 'Nhang nụ trầm hương', illustration: 'incense-cone', price: 75000, unit: 'hộp', category: 'Hương', badge: 'Mới', region: 'Tất cả' },
  { id: 'nen-mau', name: 'Nến cốc nhiều màu', illustration: 'colored-candle', price: 45000, unit: 'cặp', category: 'Đèn nến', badge: 'Nhiều màu', region: 'Tất cả' },
  { id: 'nen-bup-sen', name: 'Nến búp sen đỏ vàng', illustration: 'lotus-candle', price: 55000, unit: 'cặp', category: 'Đèn nến', badge: 'Được chọn', region: 'Tất cả' },
  { id: 'den-tho-led', name: 'Đèn thờ LED đổi màu', illustration: 'led-lamp', price: 160000, unit: 'đôi', category: 'Đèn nến', badge: 'Tiện dụng', region: 'Tất cả' },
]

const homeProductCategories = [
  { name: 'Hương', filter: 'Hương', icon: '✦' },
  { name: 'Đèn nến', filter: 'Đèn nến', icon: '✧' },
  { name: 'Vàng mã', filter: 'Vàng mã', icon: '❀' },
  { name: 'Hoa', filter: 'Hoa', icon: '❋' },
  { name: 'Trái cây', filter: 'Trái cây', icon: '☼' },
  { name: 'Bộ lễ', filter: 'Bộ lễ', icon: '◌' },
] as const

function productMatchesCategory(product: Product, category: string) {
  const name = product.name.toLocaleLowerCase('vi')
  if (category === 'Tất cả') return true
  if (category === 'Hoa') return product.category === 'Hoa' || name.includes('hoa')
  if (category === 'Trái cây') return product.category === 'Hoa quả' || name.includes('trái cây') || name.includes('hoa quả')
  if (category === 'Bộ lễ') return product.category === 'Mâm lễ' || name.includes('mâm lễ') || name.includes('bộ lễ')
  return product.category === category
}

const guides: Guide[] = [
  {
    id: 'mau-mam-le',
    title: 'Mâm lễ giản dị, tâm thành',
    summary: 'Chuẩn bị vừa sức, sạch sẽ và phù hợp mục đích buổi lễ.',
    tag: 'Nghi thức chung',
    category: 'Chung',
    steps: [
      'Xác định dịp lễ, người tham dự và không gian trước khi chọn lễ vật.',
      'Ưu tiên đồ tươi, sạch, vừa đủ; lễ chay hay mặn tùy tín ngưỡng và nếp nhà.',
      'Sắp xếp gọn gàng, chừa lối đi và vị trí an toàn cho người lớn tuổi, trẻ nhỏ.',
      'Sau lễ, thu dọn thức ăn và vật liệu đúng cách; không để đồ dễ cháy gần hương nến.',
    ],
    note: 'Không có một mâm lễ duy nhất áp dụng cho mọi gia đình. Lễ vật không phải thước đo lòng thành.',
  },
  {
    id: 'mien-bac',
    title: 'Gợi ý chuẩn bị theo nếp miền Bắc',
    summary: 'Tham khảo cách giữ sự trang nghiêm mà không áp đặt mâm lễ hay giờ cúng.',
    tag: 'Miền Bắc',
    category: 'Miền Bắc',
    steps: [
      'Hỏi người lớn trong nhà về cách xưng hô, thứ tự hành lễ và món thường dùng của gia đình.',
      'Dọn nơi thờ tự sạch sẽ; bày hương hoa, nước hoặc trà và thức lễ theo điều kiện.',
      'Nếu gia đình có tục cúng ngoài trời hoặc lễ riêng, tách khu vực và chuẩn bị vừa đủ.',
      'Thống nhất trước người chủ lễ và thời gian để các thành viên cùng tham dự.',
    ],
    note: 'Phong tục trong cùng một vùng cũng khác theo gia đình, địa phương và tôn giáo; không xem danh sách này là quy định.',
  },
  {
    id: 'mien-trung',
    title: 'Gợi ý chuẩn bị theo nếp miền Trung',
    summary: 'Lưu ý sự đa dạng địa phương và chuẩn bị phù hợp điều kiện thực tế.',
    tag: 'Miền Trung',
    category: 'Miền Trung',
    steps: [
      'Trao đổi với người thân về tập quán tại quê nhà, nhất là khi gia đình có nhiều thế hệ hoặc sống xa quê.',
      'Chọn thức lễ phù hợp mùa vụ, thời tiết và khả năng chuẩn bị; không cần mua sắm quá mức.',
      'Với nhà có không gian nhỏ hoặc thời tiết mưa gió, đặt lễ ở nơi khô ráo, vững chắc và thông thoáng.',
      'Sau lễ, kiểm tra bếp, nhang đèn và thu gom vật dụng để tránh cháy hoặc ảnh hưởng môi trường.',
    ],
    note: 'Đây là gợi ý an toàn và tổ chức, không khẳng định một nghi thức chung cho toàn miền Trung.',
  },
  {
    id: 'mien-nam',
    title: 'Gợi ý chuẩn bị theo nếp miền Nam',
    summary: 'Tôn trọng nếp nhà, cách gọi thân thuộc và sự thuận tiện của các thành viên.',
    tag: 'Miền Nam',
    category: 'Miền Nam',
    steps: [
      'Hỏi người chủ lễ trong gia đình về cách bày biện và lời khấn quen dùng.',
      'Có thể chọn mâm lễ đơn giản theo mùa và điều kiện; kiểm tra đồ ăn, thức uống trước khi dâng.',
      'Giữ khu vực hành lễ thông thoáng, tránh để nhang gần rèm, giấy hoặc vật liệu dễ bắt lửa.',
      'Nếu có khách hoặc người thân ở xa, thống nhất trước giờ giấc và phần việc để buổi lễ nhẹ nhàng.',
    ],
    note: 'Không suy rộng tập quán của một gia đình thành quy tắc cho mọi cộng đồng miền Nam.',
  },
  {
    id: 'phat-giao',
    title: 'Tham dự ngày lễ Phật giáo',
    summary: 'Chuẩn bị tâm thế trang nghiêm và tìm hiểu hướng dẫn của chùa hoặc truyền thống tu học.',
    tag: 'Phật giáo',
    category: 'Phật giáo',
    steps: [
      'Kiểm tra ngày, giờ và chương trình với chùa hoặc ban tổ chức; ngày kỷ niệm có thể khác theo truyền thống.',
      'Mặc trang phục kín đáo, giữ yên lặng và làm theo hướng dẫn tại nơi thờ tự.',
      'Lễ vật, tụng niệm, ăn chay hay nghi thức tại gia là tùy thực hành; không xem một hình thức là bắt buộc cho mọi Phật tử.',
      'Khi chưa rõ nghi thức, hỏi người phụ trách thay vì tự ý chạm vào pháp khí hoặc khu vực hành lễ.',
    ],
    note: 'Các truyền thống và cộng đồng Phật giáo đa dạng. Hãy theo hướng dẫn của chùa, vị thầy và gia đình mình.',
  },
  {
    id: 'thien-chua-giao',
    title: 'Tham dự sinh hoạt trong cộng đoàn Kitô giáo',
    summary: 'Kiểm tra lịch của giáo hội địa phương và tôn trọng khác biệt giữa các truyền thống.',
    tag: 'Thiên Chúa giáo',
    category: 'Thiên Chúa giáo',
    steps: [
      'Xác nhận lịch với giáo xứ, hội thánh hoặc cộng đoàn của mình; lịch Công giáo, Tin Lành và Chính Thống giáo có thể khác nhau.',
      'Đến đúng giờ, giữ trật tự và làm theo hướng dẫn tại nơi thờ tự; người mới tham dự có thể hỏi người phụ trách.',
      'Việc cầu nguyện, tham dự bí tích và thực hành phụng vụ tùy truyền thống giáo hội; không tự giả định mọi người tham dự theo cùng một cách.',
      'Nếu gia đình có sinh hoạt tưởng nhớ người thân tại nhà, sắp xếp riêng và tôn trọng lựa chọn tín ngưỡng của từng thành viên.',
    ],
    note: 'Ngày lễ trong ứng dụng tham khảo lịch Gregorian phương Tây và có thể không trùng lịch của một số giáo hội. Hãy xác nhận với cộng đoàn của mình; nội dung này không thay thế hướng dẫn chính thức.',
  },
  {
    id: 'huong-nhang',
    title: 'Dùng hương, nến và lửa an toàn',
    summary: 'Giảm nguy cơ bỏng, khói và cháy trong mọi không gian hành lễ.',
    tag: 'An toàn',
    category: 'An toàn',
    steps: [
      'Đặt hương, nến trên chân đế vững chắc, cách xa giấy, vải, rèm và vật dễ cháy.',
      'Giữ trẻ nhỏ và vật nuôi tránh xa lửa; không để hương hoặc nến đang cháy mà không có người trông.',
      'Mở thông gió phù hợp, cân nhắc không dùng khói nếu có người bị hen, dị ứng hoặc nhạy cảm.',
      'Dập tắt hoàn toàn lửa sau khi hành lễ; không đốt vàng mã nơi cấm hoặc gây khói, cháy và ô nhiễm.',
    ],
    note: 'Tuân thủ quy định phòng cháy tại nơi ở, khu dân cư và địa điểm thờ tự.',
  },
  {
    id: 'ngay-am-duong',
    title: 'Đối chiếu ngày âm và ngày dương',
    summary: 'Kiểm tra đúng năm, tháng nhuận và nguồn lịch trước khi lên kế hoạch.',
    tag: 'Lịch',
    category: 'Lịch',
    steps: [
      'Kiểm tra ngày âm đi kèm đúng năm dương đang xem, không dùng lại ngày quy đổi của năm trước.',
      'Chú ý tháng nhuận và quy ước lịch ở địa phương; công cụ trong ứng dụng chỉ đưa ra kết quả tính tham khảo.',
      'Với lịch nhà thờ, chùa hoặc ngày lễ tôn giáo, ưu tiên thông báo từ giáo xứ, chùa hay tổ chức phụ trách.',
      'Nếu ngày giỗ gia đình có giờ hoặc cách tính riêng, xác nhận lại với người thân trước khi gửi lời mời.',
    ],
    note: 'Lịch âm có thể khác theo phương pháp tính hoặc nguồn phát hành; ứng dụng không xác nhận ngày lễ chính thức.',
  },
]

const guideCategories = ['Tất cả', ...guides.map((guide) => guide.category)]

const checklist = [
  { id: '1', name: 'Hương & nhang', quantity: '1', unit: 'bó', checked: true },
  { id: '2', name: 'Vàng mã', quantity: '2', unit: 'bộ', checked: false },
  { id: '3', name: 'Hoa quả', quantity: '3', unit: 'bó', checked: false },
  { id: '4', name: 'Nước ngọt', quantity: '2', unit: 'chén', checked: true },
]

function getEasterSunday(year: number) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function holidayMatchesDate(holiday: Holiday, date: Date, lunar: LunarDate | null) {
  if (holiday.solarMonth !== undefined && holiday.solarDay !== undefined
    && date.getMonth() + 1 === holiday.solarMonth && date.getDate() === holiday.solarDay) return true
  if (holiday.easterOffsetDays !== undefined) {
    const easterDate = getEasterSunday(date.getFullYear())
    easterDate.setDate(easterDate.getDate() + holiday.easterOffsetDays)
    if (date.getMonth() === easterDate.getMonth() && date.getDate() === easterDate.getDate()) return true
  }
  if (!lunar || holiday.lunarDay !== lunar.day) return false
  return holiday.everyLunarMonth === true || (!lunar.isLeapMonth && holiday.lunarMonth === lunar.month)
}

function anniversaryMatchesLunarDate(anniversary: Anniversary, lunar: LunarDate | null) {
  return Boolean(lunar && !lunar.isLeapMonth
    && anniversary.lunarDay === lunar.day
    && anniversary.lunarMonth === lunar.month)
}

function formatLunarDate(lunar: LunarDate) {
  return `${lunar.day}/${lunar.month}${lunar.isLeapMonth ? ' nhuận' : ''} âm lịch`
}

function holidayDateLabel(holiday: Holiday) {
  return holiday.lunar || holiday.solar
}

function holidayDateDisclaimer(holiday: Holiday) {
  if (holiday.solarMonth !== undefined) return 'Ngày dương cố định hằng năm.'
  if (holiday.easterOffsetDays !== undefined) return 'Ngày dương thay đổi theo lịch Phục Sinh.'
  return 'Ngày dương thay đổi theo năm.'
}

function holidayVerificationNote(holiday: Holiday) {
  return holiday.religion
    ? `Ngày lễ thuộc ${holiday.religion}; vui lòng đối chiếu lịch chính thức của giáo hội hoặc cộng đoàn địa phương.`
    : 'Ngày âm quy đổi theo múi giờ UTC+7; vui lòng đối chiếu lịch chính thức trước khi sử dụng.'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatCompletionDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

function createLocalId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readLocalValue<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return fallback
    const parsed: unknown = JSON.parse(saved)
    if (isValid(parsed)) return parsed
    console.error(`Dữ liệu ${key} đã lưu không đúng định dạng.`)
  } catch (error) {
    console.error(`Không thể đọc dữ liệu ${key}:`, error)
  }
  return fallback
}

function isHolidayChecklist(value: unknown): value is Record<string, Record<string, boolean>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.entries(value).every(([holidayId, checkedItems]) => {
    if (!holidayId
      || !checkedItems
      || typeof checkedItems !== 'object'
      || Array.isArray(checkedItems)) return false
    return Object.entries(checkedItems).every(([itemId, checked]) => (
      checklist.some((item) => item.id === itemId) && typeof checked === 'boolean'
    ))
  })
}

function isCompletedHoliday(value: unknown): value is CompletedHoliday {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.id === 'string'
    && typeof record.holidayId === 'string'
    && typeof record.completedAt === 'string'
    && Number.isFinite(Date.parse(record.completedAt))
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false
  const line = value as Record<string, unknown>
  return typeof line.productId === 'string'
    && typeof line.quantity === 'number'
    && Number.isInteger(line.quantity)
    && line.quantity >= 1
    && line.quantity <= 99
}

function App() {
  const [view, setView] = useState<View>('home')
  const [activeRegion, setActiveRegion] = useState<Region>('Tất cả')
  const [prayerRegion, setPrayerRegion] = useState<PrayerRegion>('Bắc')
  const [guideCategory, setGuideCategory] = useState('Tất cả')
  const [selectedHolidayId, setSelectedHolidayId] = useState<string>(holidays[0].id)
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0].id)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate())
  const [productCategory, setProductCategory] = useState('Tất cả')
  const [holidayCategory, setHolidayCategory] = useState('Tất cả')
  const [holidayReligion, setHolidayReligion] = useState('Tất cả')
  const [holidaySearch, setHolidaySearch] = useState('')
  const [accountMode, setAccountMode] = useState<'login' | 'register'>('login')
  const [demoUser, setDemoUser] = useState<AccountUser | null>(null)
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [authLoading, setAuthLoading] = useState(true)
  const [managedHolidays, setManagedHolidays] = useState<AdminHoliday[]>([])
  const [managedProducts, setManagedProducts] = useState<AdminProduct[]>([])
  const [managedPrayers, setManagedPrayers] = useState<AdminPrayer[]>([])
  const [adminSection, setAdminSection] = useState<'holidays' | 'products' | 'prayers'>('holidays')
  const [adminHolidayDateType, setAdminHolidayDateType] = useState<'lunar' | 'monthly' | 'solar' | 'easter'>('lunar')
  const [editingAdminHoliday, setEditingAdminHoliday] = useState<AdminHoliday | null>(null)
  const [editingAdminProduct, setEditingAdminProduct] = useState<AdminProduct | null>(null)
  const [editingAdminPrayer, setEditingAdminPrayer] = useState<AdminPrayer | null>(null)
  const [cartLines, setCartLines] = useState(() => readLocalValue<CartLine[]>('cung-kien-demo-cart', [], (value): value is CartLine[] => Array.isArray(value) && value.every(isCartLine)))
  const [holidayChecklists, setHolidayChecklists] = useState(() => readLocalValue<Record<string, Record<string, boolean>>>('cung-kien-demo-holiday-checklists', {}, isHolidayChecklist))
  const [completedHolidays, setCompletedHolidays] = useState(() => readLocalValue<CompletedHoliday[]>('cung-kien-demo-completed-holidays', [], (value): value is CompletedHoliday[] => Array.isArray(value) && value.every(isCompletedHoliday)))
  const [editingAnniversaryId, setEditingAnniversaryId] = useState('')
  const [productSort, setProductSort] = useState<'featured' | 'price-low' | 'price-high'>('featured')
  const [placeQuery, setPlaceQuery] = useState('')
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationMessage, setLocationMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [storageError, setStorageError] = useState('')
  const allHolidays = useMemo<Holiday[]>(() => [
    ...holidays,
    ...managedHolidays
      .filter((holiday) => !holidays.some((existing) => existing.id === holiday.id))
      .map((holiday) => ({
        ...holiday,
        religion: holiday.religion ?? undefined,
        lunarDay: holiday.lunarDay ?? undefined,
        lunarMonth: holiday.lunarMonth ?? undefined,
        solarMonth: holiday.solarMonth ?? undefined,
        solarDay: holiday.solarDay ?? undefined,
        easterOffsetDays: holiday.easterOffsetDays ?? undefined,
      })),
  ], [managedHolidays])
  const allProducts = useMemo<Product[]>(() => [
    ...products,
    ...managedProducts
      .filter((product) => !products.some((existing) => existing.id === product.id))
      .map((product) => ({ ...product })),
  ], [managedProducts])

  useEffect(() => {
    let active = true
    async function restoreSession() {
      try {
        const { user } = await api.currentUser()
        if (!active) return
        setDemoUser(user)
        setActiveRegion(user.region)
        const { anniversaries: savedAnniversaries } = await api.listAnniversaries()
        if (active) setAnniversaries(savedAnniversaries)
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401) && active) {
          setStorageError(error instanceof Error ? error.message : 'Không thể khôi phục phiên tài khoản.')
        }
      } finally {
        if (active) setAuthLoading(false)
      }
    }
    void restoreSession()
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    async function loadManagedContent() {
      try {
        const content = await api.listPublicContent()
        if (!active) return
        setManagedHolidays(content.holidays)
        setManagedProducts(content.products)
        setManagedPrayers(content.prayers)
      } catch (error) {
        if (active) setStorageError(error instanceof Error ? error.message : 'Không thể tải nội dung từ Supabase.')
      }
    }
    void loadManagedContent()
    return () => { active = false }
  }, [])

  const visibleHolidays = useMemo(() => {
    if (activeRegion === 'Tất cả') return allHolidays
    return allHolidays.filter((holiday) => holiday.region === activeRegion || holiday.region === 'Tất cả')
  }, [activeRegion, allHolidays])
  const visibleHolidayDirectory = useMemo(() => {
    const query = holidaySearch.trim().toLocaleLowerCase('vi')
    return allHolidays.filter((holiday) => (
      (activeRegion === 'Tất cả' || holiday.region === activeRegion || holiday.region === 'Tất cả')
      && (holidayCategory === 'Tất cả' || holiday.category === holidayCategory)
      && (holidayReligion === 'Tất cả' || (holiday.religion ?? 'Dân gian & truyền thống') === holidayReligion)
      && (!query || `${holiday.title} ${holiday.category} ${holiday.religion ?? 'Dân gian & truyền thống'} ${holiday.lunar} ${holiday.solar} ${holiday.description}`.toLocaleLowerCase('vi').includes(query))
    ))
  }, [activeRegion, allHolidays, holidayCategory, holidayReligion, holidaySearch])
  const visibleProducts = useMemo(() => {
    const filtered = allProducts.filter((product) => (
      (activeRegion === 'Tất cả' || product.region === activeRegion || product.region === 'Tất cả')
      && productMatchesCategory(product, productCategory)
    ))
    if (productSort === 'price-low') return filtered.sort((a, b) => a.price - b.price)
    if (productSort === 'price-high') return filtered.sort((a, b) => b.price - a.price)
    return filtered
  }, [activeRegion, allProducts, productCategory, productSort])

  const selectedHoliday = allHolidays.find((holiday) => holiday.id === selectedHolidayId) ?? allHolidays[0]
  const selectedProduct = allProducts.find((product) => product.id === selectedProductId) ?? allProducts[0]
  const editingAnniversary = anniversaries.find((item) => item.id === editingAnniversaryId)
  const currentHolidayChecklist = checklist.map((item) => ({
    ...item,
    checked: holidayChecklists[selectedHoliday.id]?.[item.id] ?? item.checked,
  }))
  const completedHolidayHistory = [...completedHolidays].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
  const completedToday = completedHolidays.some((record) => (
    record.holidayId === selectedHoliday.id && getLocalDateKey(new Date(record.completedAt)) === getLocalDateKey(new Date())
  ))
  const checkedHolidayCount = currentHolidayChecklist.filter((item) => item.checked).length
  const holidayCategories = ['Tất cả', ...new Set(allHolidays.map((holiday) => holiday.category))]
  const holidayReligions = ['Tất cả', 'Dân gian & truyền thống', 'Phật giáo', 'Thiên Chúa giáo']
  const cartCount = cartLines.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartLines.reduce((total, item) => {
    const product = allProducts.find((candidate) => candidate.id === item.productId)
    return total + (product ? product.price * item.quantity : 0)
  }, 0)
  const placeSearch = coordinates
    ? `cửa hàng đồ cúng vàng mã hương nến gần ${coordinates.latitude},${coordinates.longitude}`
    : `cửa hàng đồ cúng vàng mã hương nến gần ${placeQuery.trim()}`
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeSearch)}`

  const monthDays = useMemo(() => {
    const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1)
    const startOffset = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()
    const items: Array<number | null> = []

    for (let i = 0; i < startOffset; i += 1) items.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) items.push(day)
    while (items.length % 7 !== 0) items.push(null)

    return items
  }, [calendarDate])
  const calendarCells = useMemo<CalendarCell[]>(() => monthDays.map((day) => {
    if (!day) return { day: null, lunar: null, holidays: [], anniversaries: [] }
    const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
    const lunar = solarToLunar(date)
    return {
      day,
      lunar,
      holidays: visibleHolidays.filter((holiday) => holidayMatchesDate(holiday, date, lunar)),
      anniversaries: anniversaries.filter((anniversary) => anniversaryMatchesLunarDate(anniversary, lunar)),
    }
  }), [anniversaries, calendarDate, monthDays, visibleHolidays])
  const monthHolidayOccurrences = calendarCells.flatMap((cell) => {
    if (cell.day === null || cell.lunar === null) return []
    const day = cell.day
    const lunar = cell.lunar
    return cell.holidays.map((holiday) => ({ day, lunar, holiday }))
  })
  const monthAnniversaryOccurrences = calendarCells.flatMap((cell) => {
    if (cell.day === null || cell.lunar === null) return []
    const day = cell.day
    const lunar = cell.lunar
    return cell.anniversaries.map((anniversary) => ({ day, lunar, anniversary }))
  })
  const selectedCalendarCell = calendarCells.find((cell) => cell.day === selectedDay)
  const selectedDateHolidays = selectedCalendarCell?.holidays ?? []
  const selectedDateAnniversaries = selectedCalendarCell?.anniversaries ?? []
  const visibleGuides = guideCategory === 'Tất cả'
    ? guides
    : guides.filter((guide) => guide.category === guideCategory)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  function navigate(nextView: View) {
    if (nextView === 'admin' && !demoUser?.isAdmin) {
      setNotice('Trang quản trị chỉ dành cho tài khoản admin đã được cấp quyền.')
      setView(demoUser ? 'profile' : 'login')
      return
    }
    setView(nextView)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openGuide(category = 'Tất cả') {
    setGuideCategory(category)
    navigate('guide')
  }

  function openProductCategory(category: string) {
    setProductCategory(category)
    setActiveRegion('Tất cả')
    const firstMatch = allProducts.find((product) => productMatchesCategory(product, category))
    if (firstMatch) setSelectedProductId(firstMatch.id)
    navigate('shop')
  }

  function setHolidayChecklistItem(itemId: string, checked: boolean) {
    const next = {
      ...holidayChecklists,
      [selectedHoliday.id]: {
        ...holidayChecklists[selectedHoliday.id],
        [itemId]: checked,
      },
    }
    if (persistLocalValue('cung-kien-demo-holiday-checklists', next, () => setHolidayChecklists(next))) {
      setNotice('Đã lưu tiến độ chuẩn bị lễ trên thiết bị.')
    }
  }

  function setCalendarRegion(region: Region) {
    setActiveRegion(region)
    const matchesRegion = (holiday: Holiday) => region === 'Tất cả' || holiday.region === region || holiday.region === 'Tất cả'
    if (!matchesRegion(selectedHoliday)) {
      const nextHoliday = allHolidays.find(matchesRegion)
      if (nextHoliday) setSelectedHolidayId(nextHoliday.id)
    }
  }

  function changeCalendarMonth(offset: number) {
    const nextMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1)
    const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()
    setCalendarDate(nextMonth)
    setSelectedDay((day) => Math.min(day, lastDay))
  }

  function resetHolidayChecklist() {
    const next = { ...holidayChecklists }
    delete next[selectedHoliday.id]
    if (persistLocalValue('cung-kien-demo-holiday-checklists', next, () => setHolidayChecklists(next))) {
      setNotice('Đã khôi phục checklist gợi ý mặc định.')
    }
  }

  function completeSelectedHoliday() {
    if (completedToday) {
      setNotice('Ngày lễ này đã được ghi nhận hoàn thành hôm nay.')
      return
    }
    const next = [{
      id: createLocalId(),
      holidayId: selectedHoliday.id,
      completedAt: new Date().toISOString(),
    }, ...completedHolidays]
    if (persistLocalValue('cung-kien-demo-completed-holidays', next, () => setCompletedHolidays(next))) {
      setNotice(`Đã ghi nhận hoàn thành ${selectedHoliday.title}.`)
    }
  }

  function openCompletedHoliday(holidayId: string) {
    setSelectedHolidayId(holidayId)
    navigate('detail')
  }

  function openAccountView(nextView: 'login' | 'profile' | 'anniversaries') {
    navigate(demoUser ? (nextView === 'login' ? 'profile' : nextView) : 'login')
  }

  function addToCart(productId: string) {
    const product = allProducts.find((item) => item.id === productId)
    if (!product) {
      setNotice('Không tìm thấy lễ vật để thêm vào dự toán.')
      return
    }
    const existing = cartLines.find((item) => item.productId === productId)
    if (existing?.quantity === 99) {
      setNotice('Mỗi sản phẩm có thể thêm tối đa 99 đơn vị.')
      return
    }
    const next = existing
      ? cartLines.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cartLines, { productId, quantity: 1 }]
    if (persistLocalValue('cung-kien-demo-cart', next, () => setCartLines(next))) {
      setNotice(`Đã thêm ${product.name} vào danh sách dự toán giá.`)
    }
  }

  function addProductsToCart(productIds: string[]) {
    const next = [...cartLines]
    for (const productId of productIds) {
      if (!allProducts.some((product) => product.id === productId)) continue
      const existingIndex = next.findIndex((item) => item.productId === productId)
      if (existingIndex >= 0) {
        const existing = next[existingIndex]
        next[existingIndex] = { ...existing, quantity: Math.min(existing.quantity + 1, 99) }
      } else {
        next.push({ productId, quantity: 1 })
      }
    }
    if (persistLocalValue('cung-kien-demo-cart', next, () => setCartLines(next))) {
      setNotice('Đã thêm bộ vật phẩm gợi ý vào dự toán giá.')
    }
  }

  function updateCartQuantity(productId: string, quantity: number) {
    const next = quantity <= 0
      ? cartLines.filter((item) => item.productId !== productId)
      : cartLines.map((item) => item.productId === productId ? { ...item, quantity: Math.min(quantity, 99) } : item)
    if (persistLocalValue('cung-kien-demo-cart', next, () => setCartLines(next))) {
      setNotice(quantity <= 0 ? 'Đã xóa món khỏi dự toán.' : 'Đã cập nhật số lượng dự kiến.')
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('Trình duyệt này không hỗ trợ xác định vị trí. Bạn có thể nhập tên khu vực để tìm.')
      return
    }
    setLocationMessage('Đang chờ quyền truy cập vị trí từ trình duyệt…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
        })
        setPlaceQuery('')
        setLocationMessage('Đã xác định vị trí trên thiết bị. Vị trí chỉ được gửi tới Google Maps nếu bạn mở kết quả tìm kiếm.')
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Bạn chưa cấp quyền vị trí. Hãy nhập tên phường, quận hoặc thành phố để tìm địa điểm.'
          : 'Không lấy được vị trí hiện tại. Hãy nhập tên khu vực để tìm địa điểm.'
        setLocationMessage(message)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  function updatePlaceQuery(value: string) {
    setPlaceQuery(value)
    if (value.trim()) {
      setCoordinates(null)
      setLocationMessage('')
    }
  }

  function persistLocalValue<T>(key: string, value: T, update: () => void) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      update()
      setStorageError('')
      return true
    } catch (error) {
      console.error(`Không thể lưu dữ liệu ${key}:`, error)
      setStorageError('Không thể lưu dữ liệu trên thiết bị. Hãy kiểm tra dung lượng lưu trữ của trình duyệt.')
      return false
    }
  }

  async function signInAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const password = String(formData.get('password') ?? '')
    try {
      const { user } = await api.login({ email, password })
      setDemoUser(user)
      setActiveRegion(user.region)
      navigate('profile')
      const { anniversaries: savedAnniversaries } = await api.listAnniversaries()
      setAnniversaries(savedAnniversaries)
      setNotice('Đăng nhập thành công.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể đăng nhập.')
    }
  }

  async function registerAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const fullName = String(formData.get('fullName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const phone = String(formData.get('phone') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    try {
      const result = await api.register({ fullName, email, phone, password })
      if (result.needsEmailConfirmation) {
        setAccountMode('login')
        setNotice('Đã tạo tài khoản. Hãy xác nhận email qua liên kết Supabase trước khi đăng nhập.')
        return
      }
      const { user } = result
      setDemoUser(user)
      setActiveRegion(user.region)
      setAccountMode('login')
      setAnniversaries([])
      setNotice('Tài khoản đã được tạo.')
      navigate('profile')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể đăng ký tài khoản.')
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!demoUser) return
    const formData = new FormData(event.currentTarget)
    const region = String(formData.get('region') ?? 'Tất cả') as Region
    const remindDaysValue = String(formData.get('remindDays') ?? '1')
    const remindDays: ApiUser['remindDays'] = remindDaysValue === '2' ? 2 : remindDaysValue === '3' ? 3 : 1
    const userData = {
      fullName: String(formData.get('fullName') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      region,
      remindersEnabled: formData.get('remindersEnabled') === 'on',
      remindDays,
    }
    try {
      const { user } = await api.updateProfile(userData)
      setDemoUser(user)
      setActiveRegion(user.region)
      setNotice('Đã lưu hồ sơ.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể lưu hồ sơ.')
    }
  }

  async function saveAnniversary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!demoUser) {
      navigate('login')
      return
    }
    const form = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const personName = String(formData.get('personName') ?? '').trim()
    const relationship = String(formData.get('relationship') ?? '').trim()
    const lunarDay = Number(formData.get('lunarDay'))
    const lunarMonth = Number(formData.get('lunarMonth'))
    const note = String(formData.get('note') ?? '').trim()
    const entry = {
      personName,
      relationship,
      lunarDay,
      lunarMonth,
      note,
    }
    try {
      const saved = editingAnniversaryId
        ? await api.updateAnniversary(editingAnniversaryId, entry)
        : await api.createAnniversary(entry)
      setAnniversaries((current) => editingAnniversaryId
        ? current.map((item) => item.id === editingAnniversaryId ? saved.anniversary : item)
        : [saved.anniversary, ...current])
      setEditingAnniversaryId('')
      form.reset()
      setNotice(editingAnniversaryId ? 'Đã cập nhật ngày giỗ.' : 'Đã thêm ngày giỗ.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể lưu ngày giỗ.')
    }
  }

  async function deleteAnniversary(id: string) {
    const entry = anniversaries.find((item) => item.id === id)
    if (!entry || !window.confirm(`Xóa ngày giỗ của ${entry.personName}?`)) return
    try {
      await api.deleteAnniversary(id)
      setAnniversaries((current) => current.filter((item) => item.id !== id))
      setNotice('Đã xóa ngày giỗ.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể xóa ngày giỗ.')
    }
  }

  async function signOutAccount() {
    if (!window.confirm('Đăng xuất khỏi tài khoản này? Dữ liệu ngày giỗ đã lưu trên máy chủ sẽ được giữ lại.')) return
    try {
      await api.logout()
      setDemoUser(null)
      setAnniversaries([])
      setAccountMode('login')
      navigate('home')
      setNotice('Đã đăng xuất.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể đăng xuất.')
    }
  }

  async function refreshAdminContent() {
    const content = await api.listPublicContent()
    setManagedHolidays(content.holidays)
    setManagedProducts(content.products)
    setManagedPrayers(content.prayers)
  }

  function makeAdminContentId(title: string) {
    const slug = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLocaleLowerCase('en')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
    return `custom-${slug || 'content'}-${createLocalId().slice(0, 8)}`
  }

  async function saveAdminHoliday(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '').trim()
    const category = String(formData.get('category') ?? '').trim()
    const dateType = String(formData.get('dateType') ?? 'lunar')
    if (!['lunar', 'monthly', 'solar', 'easter'].includes(dateType)) {
      setNotice('Kiểu ngày lễ không hợp lệ.')
      return
    }
    const region = String(formData.get('region') ?? 'Tất cả') as Region
    const religionValue = String(formData.get('religion') ?? '')
    const lunarDay = Number(formData.get('lunarDay'))
    const lunarMonth = Number(formData.get('lunarMonth'))
    const solarMonth = Number(formData.get('solarMonth'))
    const solarDay = Number(formData.get('solarDay'))
    const easterOffsetDays = Number(formData.get('easterOffsetDays'))
    const everyLunarMonth = dateType === 'monthly'
    const holiday: AdminHoliday = {
      id: editingAdminHoliday?.id ?? makeAdminContentId(title),
      title,
      category,
      lunar: everyLunarMonth ? `${lunarDay}/hằng tháng âm lịch` : dateType === 'lunar' ? `${lunarDay}/${lunarMonth} âm lịch` : '',
      lunarDay: dateType === 'lunar' || everyLunarMonth ? lunarDay : null,
      lunarMonth: dateType === 'lunar' ? lunarMonth : null,
      everyLunarMonth,
      religion: religionValue === 'Phật giáo' || religionValue === 'Thiên Chúa giáo' ? religionValue : null,
      solarMonth: dateType === 'solar' ? solarMonth : null,
      solarDay: dateType === 'solar' ? solarDay : null,
      easterOffsetDays: dateType === 'easter' ? easterOffsetDays : null,
      solar: dateType === 'solar'
        ? `${solarDay}/${solarMonth} dương lịch`
        : dateType === 'easter' ? 'Ngày thay đổi theo lịch phụng vụ' : 'Dương lịch thay đổi theo năm',
      tags: region === 'Tất cả' ? ['Bắc', 'Trung', 'Nam'] : [region],
      description: String(formData.get('description') ?? '').trim(),
      region,
      countdown: String(formData.get('countdown') ?? '').trim(),
    }
    try {
      await api.saveAdminHoliday(holiday)
      await refreshAdminContent()
      setEditingAdminHoliday(null)
      setNotice(editingAdminHoliday ? 'Đã cập nhật ngày lễ.' : 'Đã thêm ngày lễ.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể lưu ngày lễ.')
    }
  }

  async function deleteAdminHoliday(holiday: AdminHoliday) {
    if (!window.confirm(`Xóa ngày lễ “${holiday.title}” khỏi danh sách quản trị?`)) return
    try {
      await api.deleteAdminHoliday(holiday.id)
      await refreshAdminContent()
      if (selectedHolidayId === holiday.id) setSelectedHolidayId(holidays[0].id)
      setNotice('Đã xóa ngày lễ.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể xóa ngày lễ.')
    }
  }

  async function saveAdminProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const product: AdminProduct = {
      id: editingAdminProduct?.id ?? makeAdminContentId(name),
      name,
      illustration: String(formData.get('illustration') ?? 'offering') as AdminProduct['illustration'],
      price: Number(formData.get('price')),
      unit: String(formData.get('unit') ?? '').trim(),
      category: String(formData.get('category') ?? '').trim(),
      badge: String(formData.get('badge') ?? '').trim(),
      region: String(formData.get('region') ?? 'Tất cả') as Region,
    }
    try {
      await api.saveAdminProduct(product)
      await refreshAdminContent()
      setEditingAdminProduct(null)
      setNotice(editingAdminProduct ? 'Đã cập nhật lễ vật.' : 'Đã thêm lễ vật.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể lưu lễ vật.')
    }
  }

  async function deleteAdminProduct(product: AdminProduct) {
    if (!window.confirm(`Xóa lễ vật “${product.name}” khỏi danh sách tham khảo?`)) return
    try {
      await api.deleteAdminProduct(product.id)
      await refreshAdminContent()
      setNotice('Đã xóa lễ vật.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể xóa lễ vật.')
    }
  }

  async function saveAdminPrayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const prayer: AdminPrayer = {
      holidayId: editingAdminPrayer?.holidayId ?? String(formData.get('holidayId') ?? ''),
      region: (editingAdminPrayer?.region ?? String(formData.get('region') ?? 'Bắc')) as PrayerRegion,
      content: String(formData.get('content') ?? '').trim(),
    }
    const existingPrayer = managedPrayers.find((item) => item.holidayId === prayer.holidayId && item.region === prayer.region)
    if (!editingAdminPrayer && existingPrayer
      && !window.confirm('Ngày lễ và vùng miền này đã có văn khấn. Bạn có muốn thay nội dung hiện tại không?')) return
    try {
      await api.saveAdminPrayer(prayer)
      await refreshAdminContent()
      setEditingAdminPrayer(null)
      setNotice(editingAdminPrayer ? 'Đã cập nhật văn khấn.' : 'Đã thêm văn khấn.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể lưu văn khấn.')
    }
  }

  async function deleteAdminPrayer(prayer: AdminPrayer) {
    const holiday = allHolidays.find((item) => item.id === prayer.holidayId)
    if (!window.confirm(`Xóa văn khấn ${holiday?.title ?? prayer.holidayId} · miền ${prayer.region}?`)) return
    try {
      await api.deleteAdminPrayer(prayer)
      await refreshAdminContent()
      setNotice('Đã xóa văn khấn.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể xóa văn khấn.')
    }
  }

  const nearbyPlacesPanel = (
    <section className="nearby-places-panel">
      <div>
        <span className="eyebrow">Tìm nơi mua trực tiếp</span>
        <h3>Địa điểm bán đồ lễ gần bạn</h3>
        <p>Ứng dụng không lưu danh sách cửa hàng. Mở bản đồ để xem địa điểm thực tế, giờ hoạt động và chỉ đường; vui lòng kiểm tra thông tin với cửa hàng trước khi đến.</p>
      </div>
      <label className="nearby-location-input">
        Khu vực của bạn
        <input value={placeQuery} onChange={(event) => updatePlaceQuery(event.target.value)} placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh" />
      </label>
      <div className="nearby-place-actions">
        <button className="secondary-button" type="button" onClick={useCurrentLocation}>Dùng vị trí hiện tại</button>
        {placeQuery.trim() || coordinates ? (
          <a className="primary-button" href={mapSearchUrl} target="_blank" rel="noopener noreferrer">Tìm trên Google Maps</a>
        ) : (
          <button className="primary-button" type="button" disabled>Tìm trên Google Maps</button>
        )}
      </div>
      {locationMessage && <p className="nearby-location-message" role="status">{locationMessage}</p>}
      <small>Vị trí chỉ được dùng để tạo liên kết tìm kiếm và chỉ chia sẻ với dịch vụ bản đồ khi bạn bấm mở kết quả. Giá và địa điểm trên bản đồ do bên thứ ba cung cấp.</small>
    </section>
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <button className="brand-wrap" aria-label="Cúng Kiến Tâm Linh - Trang chủ" onClick={() => navigate('home')}>
            <img className="brand-mark" src="/logo.png" alt="" />
            <div className="brand-copy">
              <span className="brand-name">Cúng Kiến Tâm Linh</span>
            </div>
          </button>

          <nav className="main-nav" aria-label="Điều hướng chính">
            <button className={view === 'calendar' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('calendar')}>Lịch cúng</button>
            <button className={view === 'holidays' || view === 'detail' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('holidays')}>Ngày lễ</button>
            <button className={view === 'shop' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('shop')}>Cửa hàng</button>
            <button className={view === 'guide' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('guide')}>Hướng dẫn</button>
            {demoUser?.isAdmin && <button className={view === 'admin' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('admin')}>Quản trị</button>}
          </nav>

          <div className="topbar-actions">
            <label className="searchbox" aria-label="Tìm kiếm">
              <span aria-hidden="true">⌕</span>
              <input type="text" placeholder="Tìm lễ cúng, bài văn khấn..." />
            </label>
            <button className="icon-button" aria-label={`Dự toán giá, ${cartCount} món`} title="Dự toán giá tham khảo" onClick={() => navigate('cart')}>
              <svg className="cart-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3.75h9l4 4v12.5H6z" />
                <path d="M15 3.75v4h4M9 12h7M9 16h7" />
              </svg>
              <b>{cartCount}</b>
            </button>
            <button className="login-button" disabled={authLoading} onClick={() => openAccountView(demoUser ? 'profile' : 'login')}>
              {authLoading ? 'Đang tải…' : demoUser ? 'Tài khoản' : 'Đăng nhập'}
            </button>
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-menu" aria-label="Điều hướng điện thoại">
            <button onClick={() => navigate('calendar')}>Lịch cúng</button>
            <button onClick={() => navigate('holidays')}>Ngày lễ</button>
            <button onClick={() => navigate('shop')}>Cửa hàng</button>
            <button onClick={() => navigate('cart')}>Dự toán giá ({cartCount} món)</button>
            <button onClick={() => navigate('guide')}>Hướng dẫn</button>
            {demoUser?.isAdmin && <button onClick={() => navigate('admin')}>Quản trị nội dung</button>}
            <button onClick={() => openAccountView(demoUser ? 'profile' : 'login')}>{demoUser ? 'Hồ sơ của tôi' : 'Đăng nhập'}</button>
          </nav>
        )}
      </header>

      <main className="page-shell">
        {view === 'home' && (
          <>
            <section className="hero section-block">
              <div className="container hero-inner">
                <div className="hero-copy">
                  <span className="eyebrow hero-eyebrow">Gìn giữ cội nguồn · tâm thành ý kính</span>
                  <h1>Chuẩn bị lễ chu đáo,<br />tâm an ý thành</h1>
                  <p>Tra cứu lịch âm dương, phong tục ba miền, tham khảo giá lễ vật và tìm địa điểm mua phù hợp gần bạn.</p>
                  <div className="hero-actions">
                    <button className="primary-button" onClick={() => setView('calendar')}>Xem lịch cúng</button>
                    <button className="secondary-button" onClick={() => setView('shop')}>Tham khảo lễ vật</button>
                  </div>
                </div>
                <div className="hero-ornament" aria-hidden="true"><span>蓮</span></div>
              </div>
            </section>

            <section className="today-panel container" aria-label="Thông tin hôm nay">
              <div className="today-date">
                <span className="today-date-number">{new Intl.DateTimeFormat('vi-VN', { day: '2-digit' }).format(new Date())}</span>
                <div>
                  <span className="eyebrow">Hôm nay</span>
                  <strong>{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</strong>
                </div>
              </div>
              <div className="today-status">
                <span className="status-dot" />
                <div><strong>Chưa có lễ lớn được xác minh hôm nay</strong><span>Ngày âm lịch cần được đối chiếu từ nguồn đáng tin cậy.</span></div>
              </div>
              <button className="primary-button small" onClick={() => navigate('calendar')}>Xem cần chuẩn bị</button>
            </section>

            <section className="section-block">
              <div className="container">
                <div className="section-heading-row">
                  <div>
                    <span className="eyebrow">Sắp tới</span>
                    <h2>Lễ gần nhất</h2>
                  </div>
                  <button className="link-button" onClick={() => navigate('holidays')}>Xem tất cả</button>
                </div>
                <div className="holiday-row">
                  {visibleHolidays.slice(0, 5).map((holiday) => (
                    <button
                      key={holiday.id}
                      className={selectedHolidayId === holiday.id ? 'holiday-card active' : 'holiday-card'}
                      onClick={() => {
                        setSelectedHolidayId(holiday.id)
                        setView('detail')
                      }}
                    >
                      <span className="holiday-date">{holidayDateLabel(holiday)}</span>
                      <strong>{holiday.title}</strong>
                      <span className="solar-caution">{holiday.solar}</span>
                      <span className="holiday-card-bottom"><em>{holiday.countdown}</em><span>Chuẩn bị <b>→</b></span></span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="section-block muted">
              <div className="container">
                <div className="section-heading-row">
                  <div>
                    <span className="eyebrow">Chọn vùng miền</span>
                    <h2>Chọn phong tục phù hợp</h2>
                  </div>
                </div>
                <div className="region-grid">
                  {regions.slice(1).map((region) => (
                    <button
                      key={region}
                      className={activeRegion === region ? 'region-card active' : 'region-card'}
                      onClick={() => setActiveRegion(region)}
                    >
                      <span className={`region-dot region-${region === 'Bắc' ? 'bac' : region === 'Trung' ? 'trung' : region === 'Nam' ? 'nam' : 'default'}`} />
                      <strong>Miền {region}</strong>
                      <span>{region === 'Bắc' ? 'Nếp cúng giao thoa nhiều thế hệ.' : region === 'Trung' ? 'Lễ nghi trang trọng, chỉn chu.' : 'Mâm lễ phong phú, ấm cúng.'}</span>
                      <small>{activeRegion === region ? 'Đang chọn' : 'Khám phá phong tục →'}</small>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="section-block">
              <div className="container">
                <div className="section-heading-row">
                  <div>
                    <span className="eyebrow">Bộ lễ nổi bật</span>
                    <h2>Gợi ý cho ngày lễ</h2>
                  </div>
                </div>
                <div className="product-grid">
                  {allProducts.slice(0, 4).map((product) => (
                    <article key={product.id} className="product-card">
                      <div className="product-badge">{product.badge}</div>
                      <div className="product-image product-artwork"><ProductIllustration kind={product.illustration} /></div>
                      <h3>{product.name}</h3>
                      <div className="price-row">
                        <strong>~{formatCurrency(product.price)}</strong>
                        <span>/{product.unit}</span>
                      </div>
                      <button className="secondary-button small" onClick={() => addToCart(product.id)}>
                        Thêm vào dự toán
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="section-block muted">
              <div className="container">
                <div className="section-heading-row">
                  <div>
                    <span className="eyebrow">Danh mục</span>
                    <h2>Chọn vật phẩm cần thiết</h2>
                  </div>
                </div>
                <div className="category-grid">
                  {homeProductCategories.map(({ name, filter, icon }) => (
                    <button key={name} type="button" className="category-card" onClick={() => openProductCategory(filter)} aria-label={`Xem giá tham khảo danh mục ${name}`}>
                      <span className="category-icon" aria-hidden="true">{icon}</span>
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="section-block process-section">
              <div className="container">
                <div className="section-heading-row centered-heading">
                  <div>
                    <span className="eyebrow">Đơn giản & thành kính</span>
                    <h2>Quy trình chuẩn bị lễ vật</h2>
                    <p>Giúp bạn tổ chức buổi lễ chu toàn, với nếp nhà và tấm lòng riêng.</p>
                  </div>
                </div>
                <div className="process-grid">
                  {([
                    ['01', 'Tra cứu lịch & nghi lễ', 'Xem ngày lễ, tìm hiểu phong tục và chuẩn bị đúng dịp.', 'Mở lịch cúng →', 'calendar'],
                    ['02', 'Chọn checklist & đồ lễ', 'Tùy chỉnh danh sách theo nhu cầu và nếp nhà của bạn.', 'Mở checklist chuẩn bị →', 'detail'],
                    ['03', 'Tìm nơi mua gần bạn', 'Mở bản đồ để tham khảo cửa hàng quanh khu vực và tự liên hệ trực tiếp.', 'Tìm địa điểm gần bạn →', 'shop'],
                  ] as const).map(([step, title, description, action, destination]) => (
                    <article className="process-card" key={step}>
                      <span>{step}</span>
                      <h3>{title}</h3>
                      <p>{description}</p>
                      <button className="link-button process-action" type="button" onClick={() => navigate(destination)}>
                        {action}
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="section-block">
              <div className="container">
                <div className="section-heading-row">
                  <div>
                    <span className="eyebrow">Bài hướng dẫn</span>
                    <h2>Kiến thức hữu ích</h2>
                  </div>
                </div>
                <div className="guide-grid">
                  {guides.slice(0, 3).map((guide) => (
                    <article key={guide.id} className="guide-card">
                      <span className="guide-tag">{guide.tag}</span>
                      <h3>{guide.title}</h3>
                      <p>{guide.summary}</p>
                      <button className="link-button" onClick={() => openGuide(guide.category)}>Đọc hướng dẫn</button>
                    </article>
                  ))}
                </div>
                <button className="secondary-button guides-more-button" onClick={() => openGuide()}>Xem tất cả hướng dẫn</button>
              </div>
            </section>
          </>
        )}

        {view === 'holidays' && (
          <section className="section-block container page-section holiday-directory">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">Tra cứu theo dịp</span>
                <h2>Danh sách ngày lễ</h2>
                <p className="holiday-directory-intro">Chọn dịp để xem thông tin và tự lập checklist chuẩn bị phù hợp với gia đình.</p>
              </div>
              <div className="holiday-heading-actions">
                <button className="secondary-button" onClick={() => navigate('holiday-history')}>Lịch sử hoàn thành ({completedHolidays.length})</button>
                <button className="secondary-button" onClick={() => navigate('calendar')}>Mở lịch tháng</button>
              </div>
            </div>

            <div className="holiday-tools">
              <label className="holiday-search">
                <span aria-hidden="true">⌕</span>
                <input value={holidaySearch} onChange={(event) => setHolidaySearch(event.target.value)} type="search" placeholder="Tìm tên ngày lễ, tháng âm lịch..." aria-label="Tìm ngày lễ" />
              </label>
              <div className="holiday-filter-group" aria-label="Lọc theo vùng miền">
                <span>Vùng miền</span>
                <div className="segmented-control compact">
                  {regions.map((region) => (
                    <button key={region} className={activeRegion === region ? 'selected' : ''} aria-pressed={activeRegion === region} onClick={() => setActiveRegion(region)}>{region}</button>
                  ))}
                </div>
              </div>
              <div className="holiday-category-filters" aria-label="Lọc theo loại ngày lễ">
                {holidayCategories.map((category) => (
                  <button key={category} className={holidayCategory === category ? 'active' : ''} aria-pressed={holidayCategory === category} onClick={() => setHolidayCategory(category)}>{category}</button>
                ))}
              </div>
              <div className="holiday-category-filters" aria-label="Lọc theo tôn giáo">
                {holidayReligions.map((religion) => (
                  <button key={religion} className={holidayReligion === religion ? 'active' : ''} aria-pressed={holidayReligion === religion} onClick={() => setHolidayReligion(religion)}>{religion}</button>
                ))}
              </div>
            </div>

            <div className="holiday-results-heading">
              <b>{visibleHolidayDirectory.length} dịp phù hợp</b>
              {(holidaySearch || holidayCategory !== 'Tất cả' || holidayReligion !== 'Tất cả' || activeRegion !== 'Tất cả') && (
                <button className="link-button" onClick={() => { setHolidaySearch(''); setHolidayCategory('Tất cả'); setHolidayReligion('Tất cả'); setActiveRegion('Tất cả') }}>Xóa bộ lọc</button>
              )}
            </div>
            {visibleHolidayDirectory.length === 0 ? (
              <div className="shop-empty holiday-empty"><h3>Không tìm thấy ngày lễ phù hợp</h3><p>Thử đổi từ khóa hoặc bộ lọc.</p></div>
            ) : (
              <div className="holiday-directory-grid">
                {visibleHolidayDirectory.map((holiday) => (
                  <article className="holiday-directory-card" key={holiday.id}>
                    <div className="holiday-directory-card-top"><span className="pill">{holiday.category}</span><span>{holiday.religion ?? (holiday.region === 'Tất cả' ? 'Ba miền' : `Miền ${holiday.region}`)}</span></div>
                    <span className="holiday-date">{holidayDateLabel(holiday)}</span>
                    <h3>{holiday.title}</h3>
                    <p>{holiday.description}</p>
                    <div className="holiday-date-warning"><b>{holidayDateDisclaimer(holiday)}</b><span>{holidayVerificationNote(holiday)}</span></div>
                    <button className="primary-button small" onClick={() => { setSelectedHolidayId(holiday.id); navigate('detail') }}>Xem chi tiết & chuẩn bị</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {view === 'calendar' && (
          <section className="section-block container page-section">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">Lịch cúng</span>
                <h2>{new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(calendarDate)}</h2>
              </div>
              <div className="calendar-actions">
                <div className="month-controls">
                  <button className="month-step" aria-label="Tháng trước" onClick={() => changeCalendarMonth(-1)}>‹</button>
                  <button className="small-button ghost" onClick={() => { const today = new Date(); setCalendarDate(today); setSelectedDay(today.getDate()) }}>Hôm nay</button>
                  <button className="month-step" aria-label="Tháng sau" onClick={() => changeCalendarMonth(1)}>›</button>
                </div>
                <div className="segmented-control">
                  {regions.map((region) => (
                    <button key={region} className={activeRegion === region ? 'selected' : ''} aria-pressed={activeRegion === region} onClick={() => setCalendarRegion(region)}>{region}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="calendar-layout">
              <div className="calendar-wrap">
                <div className="calendar-header-row">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="calendar-grid" role="grid" aria-label="Lịch dương và âm">
                  {calendarCells.map((cell, index) => {
                    const { day, lunar } = cell
                    const eventCount = cell.holidays.length + cell.anniversaries.length
                    const eventLabels = [
                      ...cell.holidays.map((holiday) => ({ id: holiday.id, title: holiday.title, type: 'holiday' })),
                      ...cell.anniversaries.map((anniversary) => ({ id: anniversary.id, title: `Giỗ ${anniversary.personName}`, type: 'anniversary' })),
                    ]
                    const isToday = day === new Date().getDate()
                      && calendarDate.getMonth() === new Date().getMonth()
                      && calendarDate.getFullYear() === new Date().getFullYear()
                    const date = day ? new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day) : null
                    const solarLabel = date
                      ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
                      : 'Ngày trống'
                    const dayLabel = date && lunar
                      ? `${solarLabel}, ${formatLunarDate(lunar)}${eventLabels.length ? `, sự kiện: ${eventLabels.map((event) => event.title).join(', ')}` : ''}`
                      : solarLabel
                    return (
                      <button
                        key={`${day ?? 'empty'}-${index}`}
                        className={`day-cell ${day ? '' : 'empty'} ${day === selectedDay ? 'selected' : ''} ${isToday ? 'today' : ''} ${eventCount ? 'has-holiday' : ''}`}
                        aria-label={dayLabel}
                        aria-pressed={day === selectedDay}
                        disabled={!day}
                        onClick={() => {
                          if (!day) return
                          setSelectedDay(day)
                          if (cell.holidays[0]) setSelectedHolidayId(cell.holidays[0].id)
                        }}
                      >
                        {day && (
                          <>
                            <span className="calendar-cell-top">
                              <span className="day-number">{day}</span>
                              {lunar && <span className="lunar-day-number">{lunar.day}{lunar.isLeapMonth ? 'n' : ''}</span>}
                            </span>
                            {eventLabels.slice(0, 2).map((event) => (
                              <span className={`calendar-holiday-label ${event.type === 'anniversary' ? 'calendar-anniversary-label' : ''}`} key={`${event.type}-${event.id}`} title={event.title}>{event.title}</span>
                            ))}
                            {eventCount > 2 && <span className="calendar-holiday-more">+{eventCount - 2} sự kiện</span>}
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="calendar-note">Số nhỏ là ngày âm theo phép tính thiên văn múi giờ Việt Nam (UTC+7); ngày lễ và ngày giỗ gia đình được gắn vào ngày dương tương ứng. Vui lòng đối chiếu lịch chính thức trước khi sử dụng.</p>
              </div>

              <aside className="calendar-sidebar">
                <div className="calendar-sidebar-heading">
                  <div><span className="eyebrow">Ngày được chọn</span><h3>{selectedCalendarCell?.day ? new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), selectedCalendarCell.day)) : 'Chọn ngày'}</h3></div>
                  <span className="event-count">{monthHolidayOccurrences.length + monthAnniversaryOccurrences.length} sự kiện/tháng</span>
                </div>
                <div className="selected-lunar-date">
                  <span>Ngày âm tương ứng</span>
                  <strong>{selectedCalendarCell?.lunar ? formatLunarDate(selectedCalendarCell.lunar) : 'Ngoài phạm vi tính toán'}</strong>
                </div>
                <div className="calendar-selected-events">
                  {selectedDateHolidays.length > 0 ? selectedDateHolidays.map((holiday) => (
                    <article className="selected-event-card" key={holiday.id}>
                      <span className="pill">{holiday.category}</span>
                      <h4>{holiday.title}</h4>
                      <p>{holidayDateLabel(holiday)} · Ngày dương {new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), selectedDay))}</p>
                      <button className="link-button" onClick={() => { setSelectedHolidayId(holiday.id); navigate('detail') }}>Xem chi tiết</button>
                    </article>
                  )) : null}
                  {selectedDateAnniversaries.map((anniversary) => (
                    <article className="selected-event-card selected-anniversary-card" key={anniversary.id}>
                      <span className="pill">Ngày giỗ gia đình</span>
                      <h4>Giỗ {anniversary.personName}</h4>
                      <p>{anniversary.relationship} · {anniversary.lunarDay}/{anniversary.lunarMonth} âm lịch</p>
                      {anniversary.note && <p>{anniversary.note}</p>}
                    </article>
                  ))}
                  {selectedDateHolidays.length === 0 && selectedDateAnniversaries.length === 0
                    && <p className="calendar-no-holiday">Không có ngày lễ hoặc ngày giỗ gia đình vào ngày này.</p>}
                </div>
                <div className="calendar-event-list">
                  <h4 className="month-events-title">Ngày lễ & ngày giỗ trong tháng</h4>
                  {monthHolidayOccurrences.length + monthAnniversaryOccurrences.length === 0 && <p className="calendar-no-holiday">Tháng này chưa có ngày lễ hoặc ngày giỗ gia đình.</p>}
                  {monthHolidayOccurrences.map(({ day, lunar, holiday }) => (
                    <button
                      key={`${day}-${holiday.id}`}
                      className={`calendar-event ${selectedDay === day && selectedHolidayId === holiday.id ? 'active' : ''}`}
                      onClick={() => { setSelectedDay(day); setSelectedHolidayId(holiday.id) }}
                    >
                      <span className="event-marker" />
                      <span className="event-copy"><strong>{holiday.title}</strong><small>{day}/{calendarDate.getMonth() + 1} dương · {holidayDateLabel(holiday) === holiday.solar ? holiday.solar : formatLunarDate(lunar)}</small></span>
                      <span className="pill">{holiday.category}</span>
                    </button>
                  ))}
                  {monthAnniversaryOccurrences.map(({ day, lunar, anniversary }) => (
                    <button
                      key={`${day}-anniversary-${anniversary.id}`}
                      className={`calendar-event calendar-anniversary-event ${selectedDay === day ? 'active' : ''}`}
                      onClick={() => setSelectedDay(day)}
                    >
                      <span className="event-marker" />
                      <span className="event-copy"><strong>Giỗ {anniversary.personName}</strong><small>{day}/{calendarDate.getMonth() + 1} dương · {formatLunarDate(lunar)} · {anniversary.relationship}</small></span>
                      <span className="pill">Gia đình</span>
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === 'holiday-history' && (
          <section className="section-block container page-section holiday-history-page">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">Nhật ký của bạn</span>
                <h2>Ngày lễ đã hoàn thành</h2>
                <p className="holiday-directory-intro">Lịch sử được lưu trên thiết bị này.</p>
              </div>
              <button className="secondary-button" onClick={() => navigate('holidays')}>Quay lại ngày lễ</button>
            </div>

            {completedHolidayHistory.length === 0 ? (
              <div className="shop-empty holiday-history-empty">
                <h3>Chưa có ngày lễ nào được ghi nhận</h3>
                <p>Khi hoàn thành một dịp, mở trang chi tiết ngày lễ và chọn “Xác nhận đã hoàn thành”.</p>
                <button className="primary-button small" onClick={() => navigate('holidays')}>Xem danh sách ngày lễ</button>
              </div>
            ) : (
              <div className="holiday-history-list">
                {completedHolidayHistory.map((record) => {
                  const holiday = allHolidays.find((item) => item.id === record.holidayId)
                  if (!holiday) return null
                  return (
                    <article className="holiday-history-item" key={record.id}>
                      <span className="holiday-history-check" aria-hidden="true">✓</span>
                      <div className="holiday-history-copy">
                        <span className="pill">{holiday.category}</span>
                        <h3>{holiday.title}</h3>
                        <p>{holidayDateLabel(holiday)} · Hoàn thành {formatCompletionDate(record.completedAt)}</p>
                      </div>
                      <button className="link-button" onClick={() => openCompletedHoliday(holiday.id)}>Xem dịp lễ</button>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {view === 'detail' && (
          <section className="section-block container detail-page">
            <div className="detail-body">
              <div className="detail-main">
                <button className="link-button back" onClick={() => navigate('holidays')}>← Danh sách ngày lễ</button>
                <div className="detail-header">
                  <span className="eyebrow">{selectedHoliday.category}</span>
                  <h2>{selectedHoliday.title}</h2>
                  <div className="detail-meta">
                    <span>{selectedHoliday.religion ?? selectedHoliday.solar}</span>
                    <span>•</span>
                    <span>{holidayDateLabel(selectedHoliday)}</span>
                    <span>•</span>
                    <span>{selectedHoliday.countdown}</span>
                  </div>
                </div>

                <div className="segmented-control compact" aria-label="Chọn vùng miền cho văn khấn">
                  {(['Bắc', 'Trung', 'Nam'] as const).map((region) => (
                    <button key={region} className={prayerRegion === region ? 'selected' : ''} aria-pressed={prayerRegion === region} onClick={() => setPrayerRegion(region)}>Miền {region}</button>
                  ))}
                </div>

                <p className="detail-description">{selectedHoliday.description}</p>
                <div className="holiday-date-warning detail-date-warning">
                  <b>{holidayDateLabel(selectedHoliday)} · {holidayDateDisclaimer(selectedHoliday)}</b>
                  <span>{holidayVerificationNote(selectedHoliday)}</span>
                </div>
                <p className="holiday-region-note">
                  Gợi ý ngày lễ có thể khác theo vùng miền và nếp nhà; vui lòng tùy chỉnh cho phù hợp.
                </p>

                <div className="info-panel prayer-panel">
                  <div className="prayer-heading">
                    <div><span className="eyebrow">Mẫu tham khảo · Miền {prayerRegion}</span><h3>Văn khấn gợi ý</h3></div>
                    <span className="pill">Tùy tâm</span>
                  </div>
                  <p className="prayer-text">{getHolidayPrayer(
                    selectedHoliday,
                    prayerRegion,
                    managedPrayers.find((prayer) => prayer.holidayId === selectedHoliday.id && prayer.region === prayerRegion)?.content,
                  )}</p>
                  <p className="prayer-disclaimer">Đây là lời khấn gợi ý do ứng dụng biên soạn, không phải văn bản nghi lễ bắt buộc. Gia đình có thể thay lời xưng, lễ vật và cách hành lễ theo phong tục riêng.</p>
                </div>

                <div className="checklist-panel">
                  <div className="checklist-head">
                    <h3>Checklist chuẩn bị</h3>
                    <span>Đã chuẩn bị {checkedHolidayCount}/{currentHolidayChecklist.length}</span>
                  </div>
                  <div className="progress-bar" role="progressbar" aria-label="Tiến độ checklist" aria-valuenow={checkedHolidayCount} aria-valuemin={0} aria-valuemax={currentHolidayChecklist.length}>
                    <span style={{ width: `${(checkedHolidayCount / currentHolidayChecklist.length) * 100}%` }} />
                  </div>
                  {currentHolidayChecklist.map((item) => (
                    <label key={item.id} className={item.checked ? 'check-item checked' : 'check-item'}>
                      <input type="checkbox" checked={item.checked} onChange={(event) => setHolidayChecklistItem(item.id, event.target.checked)} />
                      <span>{item.name}</span>
                      <strong>{item.quantity} {item.unit}</strong>
                    </label>
                  ))}
                  <button className="link-button checklist-reset" onClick={resetHolidayChecklist}>Khôi phục gợi ý ban đầu</button>
                </div>

                <div className={`holiday-completion-panel ${completedToday ? 'completed' : ''}`}>
                  <div>
                    <strong>{completedToday ? 'Đã hoàn thành hôm nay' : 'Sau khi hoàn tất nghi lễ'}</strong>
                    <span>{completedToday ? 'Dịp lễ này đã được lưu vào lịch sử hoàn thành.' : 'Xác nhận để lưu ngày hoàn thành vào lịch sử trên thiết bị.'}</span>
                  </div>
                  <button className="primary-button small" onClick={completeSelectedHoliday} disabled={completedToday}>
                    {completedToday ? 'Đã ghi nhận ✓' : 'Xác nhận đã hoàn thành'}
                  </button>
                </div>

                <div className="info-panel">
                  <h3>Cách bày mâm</h3>
                  <p>Đặt hoa quả ở trung tâm, hương ở phía đầu mâm, đèn nến ở hai bên và giữ khoảng trống để người thân ngồi trong không gian thanh thoát.</p>
                </div>
              </div>

              <aside className="detail-side">
                <div className="side-card">
                  <span className="eyebrow">Bộ lễ gợi ý</span>
                  <h3>Combo theo vùng</h3>
                  <ul>
                    <li>Hương & nhang</li>
                    <li>Hoa quả</li>
                    <li>Vàng mã</li>
                  </ul>
                  <div className="side-price">
                    <strong>~{formatCurrency(500000)}</strong>
                    <button className="primary-button small" onClick={() => addProductsToCart(['nhang-hoa', 'hoa-trai-cay', 'bo-giay-vang'])}>Tính thử 3 món</button>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === 'shop' && (
          <section className="section-block container page-section">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">Tham khảo lễ vật</span>
                <h2>Giá dự kiến đồ cúng</h2>
                <p className="shop-description">Mức giá dưới đây chỉ để lập dự toán, không phải báo giá hoặc giá bán của cửa hàng cụ thể. Giá thực tế thay đổi theo nơi bán, thời điểm và quy cách sản phẩm.</p>
              </div>
            </div>

            <div className="shop-layout">
              <aside className="shop-filters">
                <div className="filter-heading"><strong>Bộ lọc tìm kiếm</strong><button onClick={() => { setActiveRegion('Tất cả'); setProductCategory('Tất cả') }}>Đặt lại</button></div>
                <fieldset>
                  <legend>Vùng miền tâm linh</legend>
                  {regions.map((region) => (
                    <button key={region} className={`filter-option ${activeRegion === region ? 'active' : ''}`} onClick={() => setActiveRegion(region)}>
                      <span className={`region-dot region-${region === 'Bắc' ? 'bac' : region === 'Trung' ? 'trung' : region === 'Nam' ? 'nam' : 'default'}`} />
                      {region === 'Tất cả' ? 'Tất cả vùng miền' : `Miền ${region}`}
                      {activeRegion === region && <b>✓</b>}
                    </button>
                  ))}
                </fieldset>
                <fieldset>
                  <legend>Danh mục sản phẩm</legend>
                  {['Tất cả', 'Mâm lễ', 'Bộ lễ', 'Hương', 'Vàng mã', 'Hoa quả', 'Hoa', 'Trái cây', 'Đèn nến', 'Khác'].map((category) => (
                    <button key={category} className={`filter-option ${productCategory === category ? 'active' : ''}`} onClick={() => setProductCategory(category)}>
                      <span className="filter-check">{productCategory === category ? '✓' : ''}</span>{category}
                    </button>
                  ))}
                </fieldset>
              </aside>

              <div className="shop-content">
                <div className="shop-intro">
                  <div><h3>Danh sách giá tham khảo</h3><span>Hiển thị {visibleProducts.length} món · giá dự kiến theo đơn vị</span></div>
                  <label>Sắp xếp <select value={productSort} onChange={(event) => setProductSort(event.target.value as typeof productSort)} aria-label="Sắp xếp sản phẩm"><option value="featured">Nổi bật nhất</option><option value="price-low">Giá thấp trước</option><option value="price-high">Giá cao trước</option></select></label>
                </div>
                {visibleProducts.length === 0 ? (
                  <div className="shop-empty"><h3>Chưa có sản phẩm phù hợp</h3><p>Thử chọn danh mục hoặc vùng miền khác.</p><button className="secondary-button" onClick={() => { setActiveRegion('Tất cả'); setProductCategory('Tất cả') }}>Xóa bộ lọc</button></div>
                ) : (
                  <div className="shop-grid">
                    {visibleProducts.map((product) => (
                      <article key={product.id} className="shop-item">
                        <div className="product-badge">{product.badge}</div>
                        <div className="product-image big product-artwork"><ProductIllustration kind={product.illustration} /></div>
                        <h3>{product.name}</h3>
                        <div className="shop-meta">
                          <span>{product.category}</span>
                          <small>{product.region === 'Tất cả' ? 'Ba miền' : `Miền ${product.region}`}</small>
                        </div>
                        <div className="price-row">
                          <strong>~{formatCurrency(product.price)}</strong>
                          <span>/ {product.unit}</span>
                        </div>
                        <button className="link-button product-select-link" onClick={() => setSelectedProductId(product.id)}>Xem ở mục nổi bật</button>
                        <button className="primary-button small" onClick={() => addToCart(product.id)}>Thêm vào dự toán</button>
                      </article>
                    ))}
                  </div>
                )}

                <div className="product-focus">
                  <div className="product-image big product-artwork focus-image"><ProductIllustration kind={selectedProduct.illustration} /></div>
                  <div>
                    <span className="eyebrow">Sản phẩm nổi bật</span>
                    <h3>{selectedProduct.name}</h3>
                    <p>Phù hợp cho {selectedProduct.category.toLowerCase()} trong các dịp lễ theo phong tục vùng miền.</p>
                    <div className="price-row">
                      <strong>~{formatCurrency(selectedProduct.price)}</strong>
                      <span>/{selectedProduct.unit}</span>
                    </div>
                    <button className="primary-button small" onClick={() => addToCart(selectedProduct.id)}>Thêm vào dự toán</button>
                  </div>
                </div>
                {nearbyPlacesPanel}
              </div>
            </div>
          </section>
        )}

        {view === 'cart' && (
          <section className="section-block container page-section cart-section">
            <div className="section-heading-row">
              <div><span className="eyebrow">Tham khảo giá</span><h2>Dự toán chi phí lễ vật</h2></div>
              <button className="secondary-button" onClick={() => navigate('shop')}>Xem thêm giá tham khảo</button>
            </div>
            <div className="demo-warning cart-demo-warning">
              <b>Không phải giỏ mua hàng</b>
              <span>Danh sách chỉ giúp bạn ước tính chi phí. Ứng dụng không bán hàng, nhận đơn, thanh toán hoặc giao hàng; giá thực tế có thể khác theo cửa hàng và thời điểm.</span>
            </div>
            {cartLines.length === 0 ? (
              <div className="cart-empty account-card">
                <h3>Chưa có món nào trong dự toán</h3>
                <p className="account-muted">Chọn lễ vật cần tham khảo để tính tổng chi phí dự kiến.</p>
                <button className="primary-button" onClick={() => navigate('shop')}>Xem giá lễ vật</button>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-items account-card">
                  <h3 className="estimate-list-title">Danh sách dự kiến</h3>
                  {cartLines.map((line) => {
                    const product = allProducts.find((item) => item.id === line.productId)
                    if (!product) return null
                    return (
                      <article className="cart-item" key={line.productId}>
                        <div className="product-image product-artwork"><ProductIllustration kind={product.illustration} /></div>
                        <div className="cart-item-info">
                          <b>{product.name}</b>
                          <span>Khoảng {formatCurrency(product.price)} / {product.unit}</span>
                          <button className="link-button danger-link" onClick={() => updateCartQuantity(product.id, 0)}>Bỏ khỏi dự toán</button>
                        </div>
                        <div className="quantity-control" aria-label={`Số lượng ${product.name}`}>
                          <button aria-label={`Giảm ${product.name}`} disabled={line.quantity <= 1} onClick={() => updateCartQuantity(product.id, line.quantity - 1)}>−</button>
                          <span>{line.quantity}</span>
                          <button aria-label={`Tăng ${product.name}`} disabled={line.quantity >= 99} onClick={() => updateCartQuantity(product.id, line.quantity + 1)}>+</button>
                        </div>
                        <strong className="cart-line-total">~{formatCurrency(product.price * line.quantity)}</strong>
                      </article>
                    )
                  })}
                </div>
                <aside className="cart-summary account-card">
                  <h3>Tổng chi phí dự kiến</h3>
                  <div><span>Số món dự kiến</span><b>{cartCount}</b></div>
                  <div className="cart-grand-total"><span>Tạm tính tham khảo</span><b>~{formatCurrency(cartTotal)}</b></div>
                  <p>Chưa gồm chi phí phát sinh. Hãy hỏi giá trực tiếp tại cửa hàng trước khi mua.</p>
                </aside>
              </div>
            )}
            {nearbyPlacesPanel}
          </section>
        )}

        {view === 'guide' && (
          <section className="section-block container page-section">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">Hướng dẫn</span>
                <h2>Tham khảo theo vùng miền và tín ngưỡng</h2>
                <p className="guides-intro">Gợi ý chuẩn bị thực tế, tôn trọng khác biệt giữa gia đình và cộng đồng. Chọn chủ đề để xem nội dung phù hợp.</p>
              </div>
            </div>
            <div className="guide-filters" role="group" aria-label="Lọc chủ đề hướng dẫn">
              {guideCategories.map((category) => (
                <button
                  key={category}
                  className={guideCategory === category ? 'selected' : ''}
                  aria-pressed={guideCategory === category}
                  onClick={() => setGuideCategory(category)}
                >
                  {category === 'Tất cả' ? 'Tất cả chủ đề' : category}
                </button>
              ))}
            </div>
            <div className="guide-grid large">
              {visibleGuides.map((guide) => (
                <article key={guide.id} className="guide-card large-card">
                  <span className="guide-tag">{guide.tag}</span>
                  <h3>{guide.title}</h3>
                  <p>{guide.summary}</p>
                  <ol className="guide-steps">
                    {guide.steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                  <p className="guide-note"><strong>Lưu ý:</strong> {guide.note}</p>
                </article>
              ))}
            </div>
            <div className="guide-source-note">
              <strong>Lưu ý chung</strong>
              <p>Nội dung mang tính tham khảo, không phải quy định nghi lễ. Với lịch hoặc nghi thức của chùa, giáo xứ và cộng đồng địa phương, hãy xác nhận trực tiếp với đơn vị phụ trách.</p>
            </div>
          </section>
        )}

        {view === 'login' && (
          <section className="section-block container page-section account-section">
            <div className="section-heading-row">
              <div><span className="eyebrow">Tài khoản</span><h2>{accountMode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}</h2></div>
            </div>
            <div className="account-card login-card">
              <p>Tài khoản và ngày giỗ được lưu trên máy chủ. Mật khẩu được bảo vệ bằng cơ chế băm; hãy đăng xuất khi dùng thiết bị chung.</p>
              <div className="account-mode-switch" aria-label="Chọn thao tác tài khoản">
                <button className={accountMode === 'login' ? 'selected' : ''} aria-pressed={accountMode === 'login'} onClick={() => setAccountMode('login')}>Đăng nhập</button>
                <button className={accountMode === 'register' ? 'selected' : ''} aria-pressed={accountMode === 'register'} onClick={() => setAccountMode('register')}>Đăng ký</button>
              </div>
              {accountMode === 'register' ? (
                <form className="account-form" onSubmit={registerAccount}>
                  <label>Họ và tên<input name="fullName" autoComplete="name" required maxLength={100} placeholder="Ví dụ: Nguyễn An" /></label>
                  <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="ban@example.com" /></label>
                  <label>Số điện thoại<input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Không bắt buộc" /></label>
                  <label>Mật khẩu<input name="password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required /></label>
                  <button className="primary-button" type="submit">Tạo tài khoản</button>
                </form>
              ) : (
                <form className="account-form" onSubmit={signInAccount}>
                  <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="ban@example.com" /></label>
                  <label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required /></label>
                  <button className="primary-button" type="submit">Đăng nhập</button>
                </form>
              )}
              {demoUser && <button className="link-button account-back" onClick={() => navigate('profile')}>Quay lại hồ sơ đang dùng</button>}
            </div>
          </section>
        )}

        {view === 'profile' && demoUser && (
          <section className="section-block container page-section account-section">
            <div className="section-heading-row">
              <div><span className="eyebrow">Tài khoản</span><h2>Xin chào, {demoUser.fullName}</h2></div>
              <button className="secondary-button" onClick={signOutAccount}>Đăng xuất</button>
            </div>
            <div className="account-layout">
              <nav className="account-menu" aria-label="Các mục tài khoản">
                <button className="active" onClick={() => navigate('profile')}>Hồ sơ</button>
                <button onClick={() => navigate('anniversaries')}>Ngày giỗ gia đình <b>{anniversaries.length}</b></button>
              </nav>
              <div className="account-card">
                <h3>Thông tin cá nhân</h3>
                <p className="account-muted">Thông tin hồ sơ được lưu an toàn trên máy chủ của ứng dụng.</p>
                <form className="account-form" onSubmit={saveProfile}>
                  <label>Họ và tên<input name="fullName" defaultValue={demoUser.fullName} required maxLength={100} /></label>
                  <label>Email<input value={demoUser.email} readOnly aria-describedby="email-note" /></label>
                  <small id="email-note" className="account-muted">Email đã đăng ký không thể thay đổi.</small>
                  <label>Số điện thoại<input name="phone" type="tel" autoComplete="tel" defaultValue={demoUser.phone} maxLength={30} placeholder="Chưa cập nhật" /></label>
                  <label>Vùng miền mặc định<select name="region" defaultValue={demoUser.region}>{regions.map((region) => <option key={region}>{region}</option>)}</select></label>
                  <label className="check-label"><input name="remindersEnabled" type="checkbox" defaultChecked={demoUser.remindersEnabled} /> Lưu tùy chọn nhắc ngày giỗ (chưa gửi thông báo)</label>
                  <label>Nhắc trước<select name="remindDays" defaultValue={demoUser.remindDays}><option value="1">1 ngày</option><option value="2">2 ngày</option><option value="3">3 ngày</option></select></label>
                  <button className="primary-button" type="submit">Lưu hồ sơ</button>
                </form>
              </div>
            </div>
          </section>
        )}

        {view === 'anniversaries' && demoUser && (
          <section className="section-block container page-section account-section">
            <div className="section-heading-row">
              <div><span className="eyebrow">Gia đình</span><h2>Ngày giỗ cần ghi nhớ</h2></div>
              <button className="secondary-button" onClick={() => navigate('profile')}>Quay lại hồ sơ</button>
            </div>
            <div className="account-layout">
              <nav className="account-menu" aria-label="Các mục tài khoản">
                <button onClick={() => navigate('profile')}>Hồ sơ</button>
                <button className="active" onClick={() => navigate('anniversaries')}>Ngày giỗ gia đình <b>{anniversaries.length}</b></button>
              </nav>
              <div className="account-content">
                <div className="account-card">
                  <h3>{editingAnniversary ? 'Chỉnh sửa ngày giỗ' : 'Thêm ngày giỗ'}</h3>
                  <p className="account-muted">Ngày giỗ được lưu trong tài khoản và hiển thị trên lịch theo ngày âm đã nhập, quy đổi bằng múi giờ UTC+7. Vui lòng đối chiếu lịch chính thức của gia đình.</p>
                  <form key={editingAnniversary?.id ?? 'new-anniversary'} className="account-form anniversary-form" onSubmit={saveAnniversary}>
                    <label>Tên người thân<input name="personName" defaultValue={editingAnniversary?.personName} required maxLength={100} placeholder="Tên người thân" /></label>
                    <label>Quan hệ<input name="relationship" defaultValue={editingAnniversary?.relationship} required maxLength={60} placeholder="Ví dụ: Ông nội" /></label>
                    <label>Ngày âm lịch<input name="lunarDay" type="number" min="1" max="30" defaultValue={editingAnniversary?.lunarDay} required /></label>
                    <label>Tháng âm lịch<input name="lunarMonth" type="number" min="1" max="12" defaultValue={editingAnniversary?.lunarMonth} required /></label>
                    <label className="full-field">Ghi chú<textarea name="note" defaultValue={editingAnniversary?.note} maxLength={500} rows={3} placeholder="Ghi chú riêng cho gia đình (không bắt buộc)" /></label>
                    <div className="form-actions full-field">
                      <button className="primary-button" type="submit">{editingAnniversary ? 'Lưu thay đổi' : 'Thêm ngày giỗ'}</button>
                      {editingAnniversary && <button className="secondary-button" type="button" onClick={() => setEditingAnniversaryId('')}>Hủy sửa</button>}
                    </div>
                  </form>
                </div>
                <div className="account-card">
                  <h3>Danh sách ngày giỗ</h3>
                  {anniversaries.length === 0 ? <p className="account-muted">Chưa có ngày giỗ nào được lưu trong tài khoản này.</p> : (
                    <div className="account-list">
                      {anniversaries.map((item) => (
                        <article className="account-list-item" key={item.id}>
                          <div><b>{item.personName}</b><span>{item.relationship} · {item.lunarDay}/{item.lunarMonth} âm lịch</span>{item.note && <small>{item.note}</small>}<small>Ngày dương được gắn vào lịch cúng theo UTC+7</small></div>
                          <div className="form-actions"><button className="link-button" onClick={() => setEditingAnniversaryId(item.id)}>Sửa</button><button className="link-button danger-link" onClick={() => deleteAnniversary(item.id)}>Xóa</button></div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'admin' && (
          demoUser?.isAdmin ? (
            <section className="section-block container page-section account-section admin-page">
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">Quản trị nội dung</span>
                  <h2>Quản lý nội dung ứng dụng</h2>
                  <p className="account-muted">Nội dung mới sẽ hiển thị công khai cho mọi người sau khi lưu.</p>
                </div>
                <button className="secondary-button" onClick={() => navigate('profile')}>Về hồ sơ</button>
              </div>

              <div className="account-mode-switch admin-tabs" role="group" aria-label="Loại nội dung">
                <button type="button" aria-pressed={adminSection === 'holidays'} className={adminSection === 'holidays' ? 'selected' : ''} onClick={() => setAdminSection('holidays')}>Ngày lễ</button>
                <button type="button" aria-pressed={adminSection === 'products'} className={adminSection === 'products' ? 'selected' : ''} onClick={() => setAdminSection('products')}>Lễ vật & giá</button>
                <button type="button" aria-pressed={adminSection === 'prayers'} className={adminSection === 'prayers' ? 'selected' : ''} onClick={() => setAdminSection('prayers')}>Văn khấn</button>
              </div>

              {adminSection === 'holidays' && (
                <div className="admin-content-layout">
                  <div className="account-card">
                    <h3>{editingAdminHoliday ? 'Chỉnh sửa ngày lễ' : 'Thêm ngày lễ'}</h3>
                    <p className="account-muted">Chọn kiểu ngày để ngày lễ được gắn đúng vào lịch.</p>
                    <form key={editingAdminHoliday?.id ?? 'new-admin-holiday'} className="account-form admin-form" onSubmit={saveAdminHoliday}>
                      <label>Tên ngày lễ<input name="title" defaultValue={editingAdminHoliday?.title} maxLength={120} required /></label>
                      <label>Nhóm<input name="category" defaultValue={editingAdminHoliday?.category} maxLength={60} placeholder="Ví dụ: Lễ lớn, Lễ vừa, Hàng tháng" required /></label>
                      <label>Kiểu ngày
                        <select
                          name="dateType"
                          value={adminHolidayDateType}
                          onChange={(event) => setAdminHolidayDateType(event.target.value as typeof adminHolidayDateType)}
                        >
                          <option value="lunar">Ngày âm lịch cố định</option>
                          <option value="monthly">Lặp ngày âm mỗi tháng</option>
                          <option value="solar">Ngày dương lịch cố định</option>
                          <option value="easter">Tính theo lễ Phục Sinh</option>
                        </select>
                      </label>
                      {adminHolidayDateType === 'lunar' && (
                        <>
                          <label>Ngày âm<input name="lunarDay" type="number" min="1" max="30" defaultValue={editingAdminHoliday?.lunarDay ?? ''} required /></label>
                          <label>Tháng âm<input name="lunarMonth" type="number" min="1" max="12" defaultValue={editingAdminHoliday?.lunarMonth ?? ''} required /></label>
                        </>
                      )}
                      {adminHolidayDateType === 'monthly' && (
                        <label>Ngày âm hằng tháng<input name="lunarDay" type="number" min="1" max="30" defaultValue={editingAdminHoliday?.lunarDay ?? ''} required /></label>
                      )}
                      {adminHolidayDateType === 'solar' && (
                        <>
                          <label>Ngày dương<input name="solarDay" type="number" min="1" max="31" defaultValue={editingAdminHoliday?.solarDay ?? ''} required /></label>
                          <label>Tháng dương<input name="solarMonth" type="number" min="1" max="12" defaultValue={editingAdminHoliday?.solarMonth ?? ''} required /></label>
                        </>
                      )}
                      {adminHolidayDateType === 'easter' && (
                        <label>Số ngày lệch so với Phục Sinh<input name="easterOffsetDays" type="number" min="-60" max="60" defaultValue={editingAdminHoliday?.easterOffsetDays ?? 0} required /></label>
                      )}
                      <label>Tôn giáo
                        <select name="religion" defaultValue={editingAdminHoliday?.religion ?? ''}>
                          <option value="">Dân gian / không gắn tôn giáo</option>
                          <option value="Phật giáo">Phật giáo</option>
                          <option value="Thiên Chúa giáo">Thiên Chúa giáo</option>
                        </select>
                      </label>
                      <label>Vùng miền
                        <select name="region" defaultValue={editingAdminHoliday?.region ?? 'Tất cả'}>
                          {regions.map((region) => <option key={region}>{region}</option>)}
                        </select>
                      </label>
                      <label className="admin-full-field">Ngày hiển thị<input name="countdown" defaultValue={editingAdminHoliday?.countdown} maxLength={100} placeholder="Ví dụ: Theo lịch âm" /></label>
                      <label className="admin-full-field">Mô tả<textarea name="description" defaultValue={editingAdminHoliday?.description} maxLength={2000} rows={3} /></label>
                      <div className="form-actions admin-full-field">
                        <button className="primary-button" type="submit">{editingAdminHoliday ? 'Lưu ngày lễ' : 'Thêm ngày lễ'}</button>
                        {editingAdminHoliday && <button className="secondary-button" type="button" onClick={() => setEditingAdminHoliday(null)}>Hủy sửa</button>}
                      </div>
                    </form>
                  </div>
                  <div className="account-card admin-managed-list">
                    <h3>Ngày lễ đã thêm ({managedHolidays.length})</h3>
                    {managedHolidays.length === 0 ? <p className="account-muted">Chưa có ngày lễ do admin thêm.</p> : managedHolidays.map((holiday) => (
                      <article className="admin-item" key={holiday.id}>
                        <div><b>{holiday.title}</b><span>{holiday.lunar || holiday.solar} · {holiday.category}</span></div>
                        <div className="form-actions">
                          <button className="link-button" onClick={() => {
                            setEditingAdminHoliday(holiday)
                            setAdminHolidayDateType(
                              holiday.easterOffsetDays !== null ? 'easter'
                                : holiday.solarDay !== null ? 'solar'
                                  : holiday.everyLunarMonth ? 'monthly' : 'lunar',
                            )
                          }}>Sửa</button>
                          <button className="link-button danger-link" onClick={() => deleteAdminHoliday(holiday)}>Xóa</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {adminSection === 'products' && (
                <div className="admin-content-layout">
                  <div className="account-card">
                    <h3>{editingAdminProduct ? 'Chỉnh sửa lễ vật' : 'Thêm lễ vật tham khảo'}</h3>
                    <p className="account-muted">Giá chỉ là mức tham khảo, không phải chức năng bán hàng.</p>
                    <form key={editingAdminProduct?.id ?? 'new-admin-product'} className="account-form admin-form" onSubmit={saveAdminProduct}>
                      <label>Tên mặt hàng<input name="name" defaultValue={editingAdminProduct?.name} maxLength={120} required /></label>
                      <label>Nhóm mặt hàng<input name="category" defaultValue={editingAdminProduct?.category} maxLength={60} placeholder="Vàng mã, Hương, Mâm lễ..." required /></label>
                      <label>Giá dự kiến (đồng)<input name="price" type="number" min="0" max="1000000000" step="1000" defaultValue={editingAdminProduct?.price ?? ''} required /></label>
                      <label>Đơn vị<input name="unit" defaultValue={editingAdminProduct?.unit} maxLength={30} placeholder="bộ, gói, bó..." required /></label>
                      <label>Minh họa
                        <select name="illustration" defaultValue={editingAdminProduct?.illustration ?? 'offering'}>
                          <option value="offering">Bộ vàng mã</option>
                          <option value="incense">Nhang</option>
                          <option value="altar-set">Bộ lễ</option>
                          <option value="fruit">Hoa quả</option>
                          <option value="lantern">Đèn lồng</option>
                          <option value="tea">Trà</option>
                          <option value="paper-car">Xe giấy</option>
                          <option value="paper-clothes">Quần áo giấy</option>
                          <option value="paper-house">Nhà giấy</option>
                          <option value="paper-horse">Ngựa giấy</option>
                          <option value="incense-coil">Nhang vòng</option>
                          <option value="incense-cone">Nhang nụ</option>
                          <option value="colored-candle">Nến màu</option>
                          <option value="lotus-candle">Nến hoa sen</option>
                          <option value="led-lamp">Đèn điện</option>
                        </select>
                      </label>
                      <label>Nhãn<input name="badge" defaultValue={editingAdminProduct?.badge} maxLength={40} placeholder="Nổi bật (không bắt buộc)" /></label>
                      <label>Vùng miền
                        <select name="region" defaultValue={editingAdminProduct?.region ?? 'Tất cả'}>
                          {regions.map((region) => <option key={region}>{region}</option>)}
                        </select>
                      </label>
                      <div className="form-actions admin-full-field">
                        <button className="primary-button" type="submit">{editingAdminProduct ? 'Lưu lễ vật' : 'Thêm lễ vật'}</button>
                        {editingAdminProduct && <button className="secondary-button" type="button" onClick={() => setEditingAdminProduct(null)}>Hủy sửa</button>}
                      </div>
                    </form>
                  </div>
                  <div className="account-card admin-managed-list">
                    <h3>Lễ vật đã thêm ({managedProducts.length})</h3>
                    {managedProducts.length === 0 ? <p className="account-muted">Chưa có lễ vật do admin thêm.</p> : managedProducts.map((product) => (
                      <article className="admin-item" key={product.id}>
                        <div><b>{product.name}</b><span>{product.category} · ~{formatCurrency(product.price)} / {product.unit}</span></div>
                        <div className="form-actions">
                          <button className="link-button" onClick={() => setEditingAdminProduct(product)}>Sửa</button>
                          <button className="link-button danger-link" onClick={() => deleteAdminProduct(product)}>Xóa</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {adminSection === 'prayers' && (
                <div className="admin-content-layout">
                  <div className="account-card">
                    <h3>{editingAdminPrayer ? 'Chỉnh sửa văn khấn' : 'Thêm văn khấn theo vùng miền'}</h3>
                    <p className="account-muted">Văn khấn đã lưu sẽ thay nội dung gợi ý mặc định cho ngày lễ và vùng tương ứng.</p>
                    <form key={editingAdminPrayer ? `${editingAdminPrayer.holidayId}-${editingAdminPrayer.region}` : 'new-admin-prayer'} className="account-form admin-form" onSubmit={saveAdminPrayer}>
                      <label>Ngày lễ
                        <select name="holidayId" defaultValue={editingAdminPrayer?.holidayId ?? allHolidays[0].id} disabled={Boolean(editingAdminPrayer)}>
                          {allHolidays.map((holiday) => <option key={holiday.id} value={holiday.id}>{holiday.title}</option>)}
                        </select>
                      </label>
                      <label>Vùng miền
                        <select name="region" defaultValue={editingAdminPrayer?.region ?? 'Bắc'} disabled={Boolean(editingAdminPrayer)}>
                          {(['Bắc', 'Trung', 'Nam'] as const).map((region) => <option key={region}>{region}</option>)}
                        </select>
                      </label>
                      <label className="admin-full-field">Nội dung văn khấn<textarea name="content" defaultValue={editingAdminPrayer?.content} rows={12} maxLength={10000} required /></label>
                      <div className="form-actions admin-full-field">
                        <button className="primary-button" type="submit">{editingAdminPrayer ? 'Lưu văn khấn' : 'Thêm văn khấn'}</button>
                        {editingAdminPrayer && <button className="secondary-button" type="button" onClick={() => setEditingAdminPrayer(null)}>Hủy sửa</button>}
                      </div>
                    </form>
                  </div>
                  <div className="account-card admin-managed-list">
                    <h3>Văn khấn đã thêm ({managedPrayers.length})</h3>
                    {managedPrayers.length === 0 ? <p className="account-muted">Chưa có văn khấn tùy chỉnh. Ứng dụng vẫn hiển thị nội dung gợi ý mặc định.</p> : managedPrayers.map((prayer) => (
                      <article className="admin-item" key={`${prayer.holidayId}-${prayer.region}`}>
                        <div>
                          <b>{allHolidays.find((holiday) => holiday.id === prayer.holidayId)?.title ?? prayer.holidayId}</b>
                          <span>Miền {prayer.region} · {prayer.content.slice(0, 100)}{prayer.content.length > 100 ? '…' : ''}</span>
                        </div>
                        <div className="form-actions">
                          <button className="link-button" onClick={() => setEditingAdminPrayer(prayer)}>Sửa</button>
                          <button className="link-button danger-link" onClick={() => deleteAdminPrayer(prayer)}>Xóa</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section className="section-block container page-section account-section">
              <div className="account-card login-card">
                <h2>Không có quyền truy cập</h2>
                <p>Tài khoản này chưa được cấp quyền quản trị nội dung.</p>
                <button className="secondary-button" onClick={() => navigate(demoUser ? 'profile' : 'login')}>Quay lại</button>
              </div>
            </section>
          )
        )}

      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="brand-name">Cúng Kiến Tâm Linh</div>
            <p>Đồng hành gìn giữ phong tục tâm linh người Việt chu đáo, thành kính và tiện lợi.</p>
          </div>
          <div>
            <b>Tra cứu & tiện ích</b>
            <p>Lịch âm dương<br />Danh sách ngày lễ<br />Ngày giỗ gia đình<br />Văn khấn tham khảo</p>
          </div>
          <div>
            <b>Tham khảo lễ vật</b>
            <p>Giá dự kiến<br />Lập dự toán chi phí<br />Tìm địa điểm mua gần bạn</p>
          </div>
          <div><b>Lưu ý</b><p>Không bán hàng hoặc nhận đơn<br />Giá thực tế thay đổi theo nơi bán<br />Vui lòng xác nhận trực tiếp với cửa hàng</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Cúng Kiến Tâm Linh. Gìn giữ bản sắc truyền thống Việt Nam.</span><span>Điều khoản sử dụng · Chính sách bảo mật</span></div>
      </footer>
      <nav className="bottom-nav" aria-label="Điều hướng nhanh">
        <button className={view === 'calendar' ? 'selected' : ''} onClick={() => navigate('calendar')}><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>Lịch</button>
        <button className={view === 'shop' ? 'selected' : ''} onClick={() => navigate('shop')}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 8h16l-1 12H5L4 8Z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></svg>Cửa hàng</button>
        <button className={view === 'cart' ? 'selected' : ''} onClick={() => navigate('cart')}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3.75h9l4 4v12.5H6z" /><path d="M15 3.75v4h4M9 12h7M9 16h7" /></svg>Dự toán</button>
        <button className={['login', 'profile', 'anniversaries'].includes(view) ? 'selected' : ''} onClick={() => openAccountView(demoUser ? 'profile' : 'login')}><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>Tôi</button>
      </nav>
      {notice && <div className="app-notice" role="status">{notice}</div>}
      {storageError && <div className="app-notice error-notice" role="alert">{storageError}<button onClick={() => setStorageError('')} aria-label="Đóng thông báo">×</button></div>}
    </div>
  )
}

export default App

const VIETNAM_TIME_ZONE = 7
const SYNODIC_MONTH = 29.530588853
const FIRST_SUPPORTED_YEAR = 1800
const LAST_SUPPORTED_YEAR = 2199
const DEG_TO_RAD = Math.PI / 180

export type LunarDate = {
  day: number
  month: number
  year: number
  isLeapMonth: boolean
}

function julianDayFromDate(day: number, month: number, year: number) {
  const adjustedYear = year + 4800 - Math.floor((14 - month) / 12)
  const adjustedMonth = month + 12 * Math.floor((14 - month) / 12) - 3
  let julianDay = day
    + Math.floor((153 * adjustedMonth + 2) / 5)
    + 365 * adjustedYear
    + Math.floor(adjustedYear / 4)
    - Math.floor(adjustedYear / 100)
    + Math.floor(adjustedYear / 400)
    - 32045

  if (julianDay < 2299161) {
    julianDay = day
      + Math.floor((153 * adjustedMonth + 2) / 5)
      + 365 * adjustedYear
      + Math.floor(adjustedYear / 4)
      - 32083
  }
  return julianDay
}

function newMoonDay(k: number) {
  const time = k / 1236.85
  const timeSquared = time * time
  const timeCubed = timeSquared * time
  const firstJulianDay = 2415020.75933
    + SYNODIC_MONTH * k
    + 0.0001178 * timeSquared
    - 0.000000155 * timeCubed
  const correctedJulianDay = firstJulianDay
    + 0.00033 * Math.sin((166.56 + 132.87 * time - 0.009173 * timeSquared) * DEG_TO_RAD)
  const meanSunAnomaly = 359.2242
    + 29.10535608 * k
    - 0.0000333 * timeSquared
    - 0.00000347 * timeCubed
  const meanMoonAnomaly = 306.0253
    + 385.81691806 * k
    + 0.0107306 * timeSquared
    + 0.00001236 * timeCubed
  const moonArgument = 21.2964
    + 390.67050646 * k
    - 0.0016528 * timeSquared
    - 0.00000239 * timeCubed
  const equationOfCenter = (0.1734 - 0.000393 * time) * Math.sin(meanSunAnomaly * DEG_TO_RAD)
    + 0.0021 * Math.sin(2 * meanSunAnomaly * DEG_TO_RAD)
    - 0.4068 * Math.sin(meanMoonAnomaly * DEG_TO_RAD)
    + 0.0161 * Math.sin(2 * meanMoonAnomaly * DEG_TO_RAD)
    - 0.0004 * Math.sin(3 * meanMoonAnomaly * DEG_TO_RAD)
    + 0.0104 * Math.sin(2 * moonArgument * DEG_TO_RAD)
    - 0.0051 * Math.sin((meanSunAnomaly + meanMoonAnomaly) * DEG_TO_RAD)
    - 0.0074 * Math.sin((meanSunAnomaly - meanMoonAnomaly) * DEG_TO_RAD)
    + 0.0004 * Math.sin((2 * moonArgument + meanSunAnomaly) * DEG_TO_RAD)
    - 0.0004 * Math.sin((2 * moonArgument - meanSunAnomaly) * DEG_TO_RAD)
    - 0.0006 * Math.sin((2 * moonArgument + meanMoonAnomaly) * DEG_TO_RAD)
    + 0.001 * Math.sin((2 * moonArgument - meanMoonAnomaly) * DEG_TO_RAD)
    + 0.0005 * Math.sin((2 * meanMoonAnomaly + meanSunAnomaly) * DEG_TO_RAD)
  const deltaTime = time < -11
    ? 0.001 + 0.000839 * time + 0.0002261 * timeSquared - 0.00000845 * timeCubed - 0.000000081 * timeSquared * timeSquared
    : -0.000278 + 0.000265 * time + 0.000262 * timeSquared
  const newMoonJulianDay = correctedJulianDay + equationOfCenter - deltaTime
  return Math.floor(newMoonJulianDay + 0.5 + VIETNAM_TIME_ZONE / 24)
}

function sunLongitudeSector(julianDay: number) {
  const time = (julianDay - 2451545.5 - VIETNAM_TIME_ZONE / 24) / 36525
  const timeSquared = time * time
  const meanAnomaly = 357.5291
    + 35999.0503 * time
    - 0.0001559 * timeSquared
    - 0.00000048 * timeSquared * time
  const meanLongitude = 280.46645
    + 36000.76983 * time
    + 0.0003032 * timeSquared
  const equationOfCenter = (1.9146 - 0.004817 * time - 0.000014 * timeSquared) * Math.sin(meanAnomaly * DEG_TO_RAD)
    + (0.019993 - 0.000101 * time) * Math.sin(2 * meanAnomaly * DEG_TO_RAD)
    + 0.00029 * Math.sin(3 * meanAnomaly * DEG_TO_RAD)
  let longitude = meanLongitude + equationOfCenter
  longitude -= 360 * Math.floor(longitude / 360)
  return Math.floor(longitude / 30)
}

function lunarMonthEleven(year: number) {
  const offset = julianDayFromDate(31, 12, year) - 2415021
  const k = Math.floor(offset / SYNODIC_MONTH)
  let newMoon = newMoonDay(k)
  if (sunLongitudeSector(newMoon) >= 9) newMoon = newMoonDay(k - 1)
  return newMoon
}

function leapMonthOffset(monthEleven: number) {
  const k = Math.floor(0.5 + (monthEleven - 2415021.076998695) / SYNODIC_MONTH)
  let monthIndex = 1
  let sector = sunLongitudeSector(newMoonDay(k + monthIndex))
  while (monthIndex < 14) {
    const nextSector = sunLongitudeSector(newMoonDay(k + monthIndex + 1))
    monthIndex += 1
    if (nextSector === sector) break
    sector = nextSector
  }
  return monthIndex - 1
}

export function solarToLunar(date: Date): LunarDate | null {
  if (Number.isNaN(date.getTime())) return null
  const solarYear = date.getFullYear()
  if (solarYear < FIRST_SUPPORTED_YEAR || solarYear > LAST_SUPPORTED_YEAR) return null

  const dayNumber = julianDayFromDate(date.getDate(), date.getMonth() + 1, solarYear)
  const k = Math.floor((dayNumber - 2415021.076998695) / SYNODIC_MONTH)
  let monthStart = newMoonDay(k + 1)
  if (monthStart > dayNumber) monthStart = newMoonDay(k)

  let monthEleven = lunarMonthEleven(solarYear)
  let nextMonthEleven = monthEleven
  let lunarYear: number
  if (monthEleven >= monthStart) {
    lunarYear = solarYear
    monthEleven = lunarMonthEleven(solarYear - 1)
  } else {
    lunarYear = solarYear + 1
    nextMonthEleven = lunarMonthEleven(solarYear + 1)
  }

  const lunarDay = dayNumber - monthStart + 1
  const monthOffset = Math.floor((monthStart - monthEleven) / 29)
  let lunarMonth = monthOffset + 11
  let isLeapMonth = false
  if (nextMonthEleven - monthEleven > 365) {
    const leapOffset = leapMonthOffset(monthEleven)
    if (monthOffset >= leapOffset) {
      lunarMonth = monthOffset + 10
      isLeapMonth = monthOffset === leapOffset
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12
  if (lunarMonth >= 11 && monthOffset < 4) lunarYear -= 1

  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeapMonth }
}

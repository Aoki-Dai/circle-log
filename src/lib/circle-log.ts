export type Activity = {
  id: string
  name: string
  startHour: number
  startMinute: number
  durationMinutes: number
  color: string
  date: string
}

export type Category = {
  id: string
  name: string
  color: string
}

export type ActivityDraft = {
  categoryId: string
  startHour: string
  startMinute: string
  durationMinutes: string
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '8f5f6d1a-4c2b-4d6e-9f20-2cb35c8a71a1', name: '睡眠', color: '#3B82F6' },
  { id: '2b3c4d5e-6f70-4a81-8b92-1c3d4e5f6071', name: '仕事', color: '#EF4444' },
  { id: '3c4d5e6f-7081-4b92-9ca3-2d4e5f607182', name: '食事', color: '#F59E0B' },
  { id: '4d5e6f70-8192-4ca3-8db4-3e5f60718293', name: '休憩', color: '#10B981' },
  { id: '5e6f7081-92a3-4db4-9ec5-4f60718293a4', name: '運動', color: '#8B5CF6' },
  { id: '6f708192-a3b4-4ec5-8fd6-50718293a4b5', name: '移動', color: '#6B7280' },
]

export const STORAGE_KEY = 'circleLog_activities'

const DAY_MINUTES = 1440

export function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  return `${y}-${m}-${d}`
}

export function parseDateISO(dateISO: string): Date {
  const [y, m, d] = dateISO.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function formatDateSlash(dateISO: string): string {
  const [y, m, d] = dateISO.split('-')
  return `${y}/${m}/${d}`
}

const WEEKDAYS_JP = ['日', '月', '火', '水', '木', '金', '土'] as const

export function formatDateLabel(dateISO: string): string {
  const d = parseDateISO(dateISO)
  return `${formatDateSlash(dateISO)} (${WEEKDAYS_JP[d.getDay()]})`
}

export function shiftDate(dateISO: string, offsetDays: number): string {
  const d = parseDateISO(dateISO)
  d.setDate(d.getDate() + offsetDays)
  return formatDateISO(d)
}

export function formatStartTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`
}

export function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  return `${hours}:${pad2(minutes)}`
}

export function toMinutes(hour: number, minute: number): number {
  return hour * 60 + minute
}

export function calcStartAngle(hour: number, minute: number): number {
  return (toMinutes(hour, minute) / DAY_MINUTES) * 360 - 90
}

export function calcSweepAngle(durationMinutes: number): number {
  return (durationMinutes / DAY_MINUTES) * 360
}

export function buildWedgePath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  sweepAngle: number,
): string {
  if (sweepAngle <= 0) {
    return ''
  }

  if (sweepAngle >= 360) {
    return [
      `M ${cx} ${cy - radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius}`,
      'Z',
    ].join(' ')
  }

  const startRad = (startAngle * Math.PI) / 180
  const endRad = ((startAngle + sweepAngle) * Math.PI) / 180

  const x1 = cx + radius * Math.cos(startRad)
  const y1 = cy + radius * Math.sin(startRad)
  const x2 = cx + radius * Math.cos(endRad)
  const y2 = cy + radius * Math.sin(endRad)

  const largeArcFlag = sweepAngle > 180 ? 1 : 0

  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    'Z',
  ].join(' ')
}

export function isIntegerString(input: string): boolean {
  return /^\d+$/.test(input)
}

export function validateDraft(draft: ActivityDraft): boolean {
  if (!draft.categoryId) {
    return false
  }

  if (!isIntegerString(draft.startHour)) {
    return false
  }
  if (!isIntegerString(draft.startMinute)) {
    return false
  }
  if (!isIntegerString(draft.durationMinutes)) {
    return false
  }

  const startHour = Number(draft.startHour)
  const startMinute = Number(draft.startMinute)
  const durationMinutes = Number(draft.durationMinutes)

  return (
    startHour >= 0 &&
    startHour <= 23 &&
    startMinute >= 0 &&
    startMinute <= 59 &&
    durationMinutes >= 1 &&
    durationMinutes <= 1440
  )
}

export function getActivitiesByDate(activities: Activity[], selectedDate: string): Activity[] {
  return activities
    .filter((a) => a.date === selectedDate)
    .sort((a, b) => toMinutes(a.startHour, a.startMinute) - toMinutes(b.startHour, b.startMinute))
}

export type CategorySummary = {
  name: string
  durationMinutes: number
  percent: number
}

export function summarizeByCategory(activities: Activity[]): CategorySummary[] {
  const totalByCategory = new Map<string, number>()

  for (const activity of activities) {
    totalByCategory.set(
      activity.name,
      (totalByCategory.get(activity.name) ?? 0) + activity.durationMinutes,
    )
  }

  return [...totalByCategory.entries()]
    .filter(([, duration]) => duration > 0)
    .map(([name, durationMinutes]) => ({
      name,
      durationMinutes,
      percent: Math.round((durationMinutes / DAY_MINUTES) * 1000) / 10,
    }))
    .sort((a, b) => b.durationMinutes - a.durationMinutes)
}

export function safeLoadActivities(storage: Pick<Storage, 'getItem'> | null): Activity[] {
  if (!storage) {
    return []
  }

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item): item is Activity => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.startHour === 'number' &&
        typeof item.startMinute === 'number' &&
        typeof item.durationMinutes === 'number' &&
        typeof item.color === 'string' &&
        typeof item.date === 'string'
      )
    })
  } catch {
    return []
  }
}

export function safeSaveActivities(
  storage: Pick<Storage, 'setItem'> | null,
  activities: Activity[],
): void {
  if (!storage) {
    return
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(activities))
  } catch {
    // localStorage unavailable; ignore to keep memory-only operation.
  }
}

export function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function createEmptyDraft(categoryId = ''): ActivityDraft {
  return {
    categoryId,
    startHour: '',
    startMinute: '',
    durationMinutes: '',
  }
}

export type State = {
  activities: Activity[]
  selectedDate: string
  isAddDialogOpen: boolean
  addDraft: ActivityDraft
  deleteTargetId: string | null
}

export type Action =
  | { type: 'openAddDialog'; categoryId?: string }
  | { type: 'closeAddDialog' }
  | { type: 'updateDraft'; field: keyof ActivityDraft; value: string }
  | { type: 'addActivity'; activity: Activity }
  | { type: 'requestDelete'; id: string }
  | { type: 'cancelDelete' }
  | { type: 'confirmDelete' }
  | { type: 'setDate'; date: string }
  | { type: 'replaceActivities'; activities: Activity[] }

export function createInitialState(todayISO: string, activities: Activity[]): State {
  return {
    activities,
    selectedDate: todayISO,
    isAddDialogOpen: false,
    addDraft: createEmptyDraft(),
    deleteTargetId: null,
  }
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'openAddDialog':
      return {
        ...state,
        isAddDialogOpen: true,
        addDraft: createEmptyDraft(action.categoryId ?? ''),
      }
    case 'closeAddDialog':
      return {
        ...state,
        isAddDialogOpen: false,
        addDraft: createEmptyDraft(),
      }
    case 'updateDraft':
      return {
        ...state,
        addDraft: {
          ...state.addDraft,
          [action.field]: action.value,
        },
      }
    case 'addActivity':
      return {
        ...state,
        activities: [...state.activities, action.activity],
        isAddDialogOpen: false,
        addDraft: createEmptyDraft(),
      }
    case 'requestDelete':
      return {
        ...state,
        deleteTargetId: action.id,
      }
    case 'cancelDelete':
      return {
        ...state,
        deleteTargetId: null,
      }
    case 'confirmDelete':
      if (!state.deleteTargetId) {
        return state
      }
      return {
        ...state,
        activities: state.activities.filter((a) => a.id !== state.deleteTargetId),
        deleteTargetId: null,
      }
    case 'setDate':
      return {
        ...state,
        selectedDate: action.date,
      }
    case 'replaceActivities':
      return {
        ...state,
        activities: action.activities,
      }
    default:
      return state
  }
}

export function createActivityFromDraft(params: {
  draft: ActivityDraft
  categories: Category[]
  date: string
}): Activity | null {
  const { draft, categories, date } = params

  if (!validateDraft(draft)) {
    return null
  }

  const category = categories.find((c) => c.id === draft.categoryId)
  if (!category) {
    return null
  }

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `activity-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  return {
    id,
    name: category.name,
    color: category.color,
    startHour: Number(draft.startHour),
    startMinute: Number(draft.startMinute),
    durationMinutes: Number(draft.durationMinutes),
    date,
  }
}

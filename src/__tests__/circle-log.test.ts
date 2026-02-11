import { describe, expect, it } from 'vitest'

import {
  buildWedgePath,
  calcStartAngle,
  calcSweepAngle,
  createInitialState,
  formatDuration,
  formatStartTime,
  reducer,
  safeLoadActivities,
  safeSaveActivities,
  summarizeByCategory,
  validateDraft,
} from '@/lib/circle-log'

describe('円グラフ角度計算', () => {
  it('仕様サンプル: 0:00 420分は開始角度-90度、弧105度', () => {
    expect(calcStartAngle(0, 0)).toBe(-90)
    expect(calcSweepAngle(420)).toBe(105)
  })

  it('仕様サンプル: 13:30 60分は開始角度112.5度、弧15度', () => {
    expect(calcStartAngle(13, 30)).toBe(112.5)
    expect(calcSweepAngle(60)).toBe(15)
  })

  it('full dayのpath文字列を生成できる', () => {
    const path = buildWedgePath(200, 200, 180, -90, 360)
    expect(path).toContain('A 180 180 0 1 1')
  })
})

describe('時刻と活動時間フォーマット', () => {
  it('開始時刻はHH:MMでゼロ埋めされる', () => {
    expect(formatStartTime(0, 0)).toBe('00:00')
    expect(formatStartTime(8, 5)).toBe('08:05')
  })

  it('活動時間はH:MMで表示される', () => {
    expect(formatDuration(420)).toBe('7:00')
    expect(formatDuration(30)).toBe('0:30')
    expect(formatDuration(15)).toBe('0:15')
  })
})

describe('バリデーション', () => {
  it('境界値: 0時59分1分は有効', () => {
    expect(
      validateDraft({
        categoryId: 'c-sleep',
        startHour: '0',
        startMinute: '59',
        durationMinutes: '1',
      }),
    ).toBe(true)
  })

  it('範囲外や空入力は無効', () => {
    expect(
      validateDraft({
        categoryId: '',
        startHour: '',
        startMinute: '0',
        durationMinutes: '60',
      }),
    ).toBe(false)

    expect(
      validateDraft({
        categoryId: 'c-sleep',
        startHour: '24',
        startMinute: '0',
        durationMinutes: '60',
      }),
    ).toBe(false)

    expect(
      validateDraft({
        categoryId: 'c-sleep',
        startHour: '23',
        startMinute: '60',
        durationMinutes: '60',
      }),
    ).toBe(false)

    expect(
      validateDraft({
        categoryId: 'c-sleep',
        startHour: '23',
        startMinute: '30',
        durationMinutes: '0',
      }),
    ).toBe(false)
  })
})

describe('カテゴリ集計', () => {
  it('仕様サンプルどおりにカテゴリ合計と割合を算出する', () => {
    const result = summarizeByCategory([
      {
        id: '1',
        name: '睡眠',
        startHour: 0,
        startMinute: 0,
        durationMinutes: 420,
        color: '#3B82F6',
        date: '2026-02-11',
      },
      {
        id: '2',
        name: '食事',
        startHour: 7,
        startMinute: 0,
        durationMinutes: 60,
        color: '#F59E0B',
        date: '2026-02-11',
      },
      {
        id: '3',
        name: '仕事',
        startHour: 8,
        startMinute: 30,
        durationMinutes: 480,
        color: '#EF4444',
        date: '2026-02-11',
      },
      {
        id: '4',
        name: '食事',
        startHour: 12,
        startMinute: 0,
        durationMinutes: 30,
        color: '#F59E0B',
        date: '2026-02-11',
      },
    ])

    expect(result).toEqual([
      { name: '仕事', durationMinutes: 480, percent: 33.3 },
      { name: '睡眠', durationMinutes: 420, percent: 29.2 },
      { name: '食事', durationMinutes: 90, percent: 6.3 },
    ])
  })
})

describe('reducer', () => {
  it('活動追加時にダイアログが閉じて活動が追加される', () => {
    const initial = createInitialState('2026-02-11', [])
    const opened = reducer(initial, { type: 'openAddDialog' })
    const next = reducer(opened, {
      type: 'addActivity',
      activity: {
        id: 'a1',
        name: '睡眠',
        startHour: 0,
        startMinute: 0,
        durationMinutes: 60,
        color: '#3B82F6',
        date: '2026-02-11',
      },
    })

    expect(next.activities).toHaveLength(1)
    expect(next.isAddDialogOpen).toBe(false)
    expect(next.addDraft.categoryId).toBe('')
  })

  it('削除確認後に対象活動が削除される', () => {
    const initial = createInitialState('2026-02-11', [
      {
        id: 'a1',
        name: '睡眠',
        startHour: 0,
        startMinute: 0,
        durationMinutes: 60,
        color: '#3B82F6',
        date: '2026-02-11',
      },
      {
        id: 'a2',
        name: '仕事',
        startHour: 8,
        startMinute: 0,
        durationMinutes: 120,
        color: '#EF4444',
        date: '2026-02-11',
      },
    ])

    const requested = reducer(initial, { type: 'requestDelete', id: 'a1' })
    const next = reducer(requested, { type: 'confirmDelete' })

    expect(next.activities.map((a) => a.id)).toEqual(['a2'])
  })
})

describe('localStorageフォールバック', () => {
  it('storageがnullでも例外なく動作する', () => {
    expect(safeLoadActivities(null)).toEqual([])
    expect(() => safeSaveActivities(null, [])).not.toThrow()
  })

  it('不正JSONは空配列として扱う', () => {
    const storage = {
      getItem: () => '{invalid',
    }

    expect(safeLoadActivities(storage)).toEqual([])
  })
})

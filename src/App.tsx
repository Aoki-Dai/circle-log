import { useEffect, useMemo, useReducer } from 'react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DEFAULT_CATEGORIES,
  buildWedgePath,
  calcStartAngle,
  calcSweepAngle,
  createActivityFromDraft,
  createInitialState,
  formatDateISO,
  formatDateLabel,
  formatDateSlash,
  formatDuration,
  formatStartTime,
  getActivitiesByDate,
  getStorage,
  reducer,
  safeLoadActivities,
  safeSaveActivities,
  shiftDate,
  summarizeByCategory,
  validateDraft,
} from '@/lib/circle-log'

const CHART_SIZE = 400
const CENTER = CHART_SIZE / 2
const RADIUS = 180
const CLOCK_LABELS = [0, 3, 6, 9, 12, 15, 18, 21]

function getLabelPosition(hour: number): { x: number; y: number } {
  const angle = ((hour * 60) / 1440) * 360 - 90
  const rad = (angle * Math.PI) / 180
  const labelRadius = RADIUS + 18
  return {
    x: CENTER + labelRadius * Math.cos(rad),
    y: CENTER + labelRadius * Math.sin(rad),
  }
}

function App() {
  const todayISO = formatDateISO(new Date())

  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => createInitialState(todayISO, safeLoadActivities(getStorage())),
  )

  const selectedDateActivities = useMemo(
    () => getActivitiesByDate(state.activities, state.selectedDate),
    [state.activities, state.selectedDate],
  )

  const selectedDateSummary = useMemo(
    () => summarizeByCategory(selectedDateActivities),
    [selectedDateActivities],
  )

  const isSaveDisabled = !validateDraft(state.addDraft)

  const deleteTarget = state.activities.find((a) => a.id === state.deleteTargetId) ?? null

  useEffect(() => {
    safeSaveActivities(getStorage(), state.activities)
  }, [state.activities])

  return (
    <main className="mx-auto w-[800px] p-6">
      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            data-testid="prev-date-btn"
            onClick={() => dispatch({ type: 'setDate', date: shiftDate(state.selectedDate, -1) })}
          >
            ◀
          </Button>
          <div data-testid="current-date-label" className="min-w-44 text-center font-semibold">
            {formatDateLabel(state.selectedDate)}
          </div>
          <Button
            variant="outline"
            data-testid="next-date-btn"
            onClick={() => dispatch({ type: 'setDate', date: shiftDate(state.selectedDate, 1) })}
          >
            ▶
          </Button>
          <Button
            variant="outline"
            data-testid="today-btn"
            onClick={() => dispatch({ type: 'setDate', date: todayISO })}
          >
            今日
          </Button>
        </div>

        <div className="flex justify-center">
          <svg
            data-testid="circle-chart"
            width={CHART_SIZE}
            height={CHART_SIZE}
            viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          >
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#E5E7EB" />

            {selectedDateActivities.map((activity) => {
              const startAngle = calcStartAngle(activity.startHour, activity.startMinute)
              const sweepAngle = calcSweepAngle(activity.durationMinutes)
              const path = buildWedgePath(CENTER, CENTER, RADIUS, startAngle, sweepAngle)

              return (
                <path
                  key={activity.id}
                  data-testid={`segment-${activity.id}`}
                  d={path}
                  fill={activity.color}
                />
              )
            })}

            {CLOCK_LABELS.map((hour) => {
              const pos = getLabelPosition(hour)
              return (
                <text
                  key={hour}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#374151"
                >
                  {hour}
                </text>
              )
            })}

            <text
              x={CENTER}
              y={CENTER}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="18"
              fontWeight="600"
              fill="#111827"
            >
              {formatDateSlash(state.selectedDate)}
            </text>
          </svg>
        </div>

        <div className="mt-4">
          <Button data-testid="add-activity-btn" onClick={() => dispatch({ type: 'openAddDialog' })}>
            追加
          </Button>
        </div>

        <div className="mt-6" data-testid="activity-list">
          {selectedDateActivities.length === 0 ? (
            <p data-testid="empty-message">活動が記録されていません</p>
          ) : (
            <ul className="space-y-2">
              {selectedDateActivities.map((activity) => (
                <li key={activity.id} className="flex items-center justify-between rounded border px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span
                      data-testid={`activity-color-${activity.id}`}
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: activity.color }}
                    />
                    <span data-testid={`activity-name-${activity.id}`}>{activity.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span data-testid={`activity-start-${activity.id}`}>
                      {formatStartTime(activity.startHour, activity.startMinute)}
                    </span>
                    <span data-testid={`activity-duration-${activity.id}`}>
                      {formatDuration(activity.durationMinutes)}
                    </span>
                    <Button
                      size="xs"
                      variant="outline"
                      data-testid={`delete-activity-${activity.id}`}
                      onClick={() => dispatch({ type: 'requestDelete', id: activity.id })}
                    >
                      ×
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6" data-testid="summary-section">
          <h2 className="mb-2 font-semibold">合計</h2>
          {selectedDateSummary.length === 0 ? (
            <p>表示する合計がありません</p>
          ) : (
            <ul className="space-y-1">
              {selectedDateSummary.map((summary) => (
                <li key={summary.name} className="flex items-center gap-4">
                  <span data-testid={`summary-name-${summary.name}`} className="w-16">
                    {summary.name}
                  </span>
                  <span data-testid={`summary-duration-${summary.name}`} className="w-16">
                    {formatDuration(summary.durationMinutes)}
                  </span>
                  <span data-testid={`summary-percent-${summary.name}`} className="w-16">
                    {summary.percent.toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          data-testid="quick-add-container"
          className="mt-6 flex gap-2 overflow-x-auto whitespace-nowrap pb-1"
        >
          {DEFAULT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              data-testid={`quick-add-${category.name}`}
              type="button"
              className="rounded px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: category.color, color: '#FFFFFF' }}
              onClick={() => dispatch({ type: 'openAddDialog', categoryId: category.id })}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <Dialog
        open={state.isAddDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            dispatch({ type: 'closeAddDialog' })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="add-dialog-title">活動を追加</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label htmlFor="category">カテゴリ</label>
              <select
                id="category"
                data-testid="select-category"
                className="h-9 w-full rounded-md border border-input px-3 text-sm"
                value={state.addDraft.categoryId}
                onChange={(e) =>
                  dispatch({ type: 'updateDraft', field: 'categoryId', value: e.target.value })
                }
              >
                <option value="">選択してください</option>
                {DEFAULT_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="start-hour">開始時刻（時）</label>
              <Input
                id="start-hour"
                type="number"
                data-testid="input-start-hour"
                min={0}
                max={23}
                value={state.addDraft.startHour}
                onChange={(e) =>
                  dispatch({ type: 'updateDraft', field: 'startHour', value: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="start-minute">開始時刻（分）</label>
              <Input
                id="start-minute"
                type="number"
                data-testid="input-start-minute"
                min={0}
                max={59}
                value={state.addDraft.startMinute}
                onChange={(e) =>
                  dispatch({ type: 'updateDraft', field: 'startMinute', value: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="duration">活動時間（分）</label>
              <Input
                id="duration"
                type="number"
                data-testid="input-duration"
                min={1}
                max={1440}
                value={state.addDraft.durationMinutes}
                onChange={(e) =>
                  dispatch({ type: 'updateDraft', field: 'durationMinutes', value: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => dispatch({ type: 'closeAddDialog' })}>
              キャンセル
            </Button>
            <Button
              data-testid="save-activity-btn"
              disabled={isSaveDisabled}
              onClick={() => {
                const activity = createActivityFromDraft({
                  draft: state.addDraft,
                  categories: DEFAULT_CATEGORIES,
                  date: state.selectedDate,
                })

                if (!activity) {
                  return
                }

                dispatch({ type: 'addActivity', activity })
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={state.deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            dispatch({ type: 'cancelDelete' })
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>削除確認</AlertDialogTitle>
            <AlertDialogDescription data-testid="delete-confirm-message">
              {deleteTarget ? `「${deleteTarget.name}」を削除しますか？` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-testid="cancel-delete-btn"
              onClick={() => dispatch({ type: 'cancelDelete' })}
            >
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-delete-btn"
              onClick={() => dispatch({ type: 'confirmDelete' })}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

export default App

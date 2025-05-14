import { sub } from "date-fns"

interface DateRange {
  startQuickRange: Date;
  endQuickRange: Date;
}

export function getTimeRangeFromQuickRange(quickRange: string): DateRange {
  const now = new Date()
  let startQuickRange: Date, endQuickRange: Date

  endQuickRange = now
  if (quickRange === "l-30-min") {
    startQuickRange = sub(endQuickRange, { minutes: 30 })
  }
  else if (quickRange === "l-1-hr") {
    startQuickRange = sub(endQuickRange, { hours: 1 })
  }
  else if (quickRange === "l-3-hr") {
    startQuickRange = sub(endQuickRange, { hours: 3 })
  }
  else if (quickRange === "l-6-hr") {
    startQuickRange = sub(endQuickRange, { hours: 6 })
  }
  else if (quickRange === "l-12-hr") {
    startQuickRange = sub(endQuickRange, { hours: 12 })
  }
  else if (quickRange === "l-24-hr") {
    startQuickRange = sub(endQuickRange, { hours: 24 })
  }
  else if (quickRange === "l-2-day") {
    startQuickRange = sub(endQuickRange, { days: 2 })
  }
  else if (quickRange === "l-7-day") {
    startQuickRange = sub(endQuickRange, { days: 7 })
  }
  else if (quickRange === "l-15-day") {
    startQuickRange = sub(endQuickRange, { days: 15 })
  }
  else if (quickRange === "l-30-day") {
    startQuickRange = sub(endQuickRange, { days: 30 })
  }
  else if (quickRange === "l-90-day") {
    startQuickRange = sub(endQuickRange, { days: 90 })
  }
  else if (quickRange === "l-6-month") {
    startQuickRange = sub(endQuickRange, { months: 6 })
  }
  else if (quickRange === "l-1-year") {
    startQuickRange = sub(endQuickRange, { years: 1 })
  }
  // Rangos de tiempo mayores a 1 año colapsan el backend
  // else if (quickRange === "l-5-year") {
  //   startQuickRange = sub(endQuickRange, { years: 5 })
  // }
  else {
    startQuickRange = endQuickRange
  }

  return { startQuickRange, endQuickRange }  
} 
const moment = require("moment-timezone")

/**
 * @param {Date} date 
 * @param {boolean} applyDST 
 * @returns {Date} 
 */
export const convertToChileTime = (date: Date, applyDST = true) => {
  const timezone = "America/Santiago"
  if (applyDST) {
    return moment.tz(date, timezone).toDate()
  } else {
    return moment.tz(date, timezone).utcOffset("-03:00").toDate()
  }
}



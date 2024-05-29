import {get} from "lodash";

export function iso () {
  let logDate = new Date()

  const now = Date.now()
  logDate.setTime(now)

  return { now, isoDate: logDate.toISOString() }
}

export function errorToString (err: Error): string {
  const errorString = get(err, 'response.data.message', null) || get(err, 'message', null) || `${err}`
  const { statusCode, statusMessage, responseUrl } = get(err, 'request.res', { statusCode: -1, statusMessage: null, responseUrl: null })
  if (statusCode > 0 && statusMessage && responseUrl) {
    return `${errorString} at URL ${responseUrl}`
  }
  return errorString
}

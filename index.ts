import { isEmpty, isString, repeat } from 'lodash'
import * as chalk from 'chalk'
import { errorToString, iso } from './utils'

export interface LogOptions {
  throttle?: number
  tags?: string[]
  trace?: boolean
  data?: any
}

export interface LoggerOptions {
  isDev?: boolean
  isTest?: boolean
}

export interface BaseLoggerMeta {
  type: string
  id: string
}

export type LogLevel = 'error' | 'warning' | 'info' | 'verbose' | 'debug'

export interface EnabledFlags {
  error: boolean
  warning: boolean
  info: boolean
  verbose: boolean
  debug: boolean
}

const space = '    '

const validLevels: Set<LogLevel> = new Set<LogLevel>(['error', 'warning', 'info', 'verbose', 'debug'])

const instances: BaseStreamLogger[] = []

const lastEntries = new Map<string, number>()

export const findLogger = (meta: any) => instances.find(logger => logger.hasMeta(meta))

export class BaseStreamLogger {
  private readonly _meta: BaseLoggerMeta
  private readonly _enabled: EnabledFlags
  private readonly _isDev: boolean
  private readonly _isTest: boolean

  constructor (meta: BaseLoggerMeta, initialLevel: LogLevel = 'verbose', options?: LoggerOptions) {
    this._isTest = !!options?.isTest
    this._isDev = !!options?.isDev

    this._meta = meta

    this._enabled = {
      error: true,
      warning: false,
      info: false,
      verbose: false,
      debug: false
    }

    this.setLevel(initialLevel)

    instances.push(this)
  }

  hasMeta (meta?: Partial<BaseLoggerMeta>) {
    if (!meta || isEmpty(meta)) {
      return false
    }

    for (const key in meta) {
      if (this._meta[key] !== meta[key]) {
        return false
      }
    }

    return true
  }

  setLevel (level: LogLevel) {
    if (!validLevels.has(level)) {
      return
    }

    this._enabled.error = true
    this._enabled.warning = false
    this._enabled.info = false
    this._enabled.verbose = false
    this._enabled.debug = false

    if (this._isTest || level === 'error') {
      // no other loggers enabled
    } else if (level === 'warning') {
      this._enabled.warning = true
    } else if (level === 'info') {
      this._enabled.warning = true
      this._enabled.info = true
    } else if (level === 'verbose') {
      this._enabled.warning = true
      this._enabled.info = true
      this._enabled.verbose = true
    } else if (level === 'debug') {
      this._enabled.warning = true
      this._enabled.info = true
      this._enabled.verbose = true
      this._enabled.debug = true
    }

    return this
  }

  get prefix (): string {
    const { id, type } = this._meta
    if (id) {
      return `${type}.${id}`
    } else {
      return `${type}`
    }
  }

  private _logWithLevel (level: LogLevel, what: any, options?: LogOptions): void {
    const { now, isoDate } = iso()

    const msgRaw = [level as string, this.prefix, what].join(' ')

    const message = this._isDev ? `${isoDate} ${msgRaw}` : msgRaw

    if (options?.throttle) {
      const last = lastEntries.get(msgRaw)
      if (last && ((now - last) < options.throttle)) {
        return // skip repeated logs
      } else {
        lastEntries.set(msgRaw, now)
      }
    }

    const shouldWriteToConsole = (level === 'error') ||
      (level === 'debug' && this._enabled.debug) ||
      (level === 'info' && this._enabled.info) ||
      (level === 'verbose' && this._enabled.verbose) ||
      (level === 'warning' && this._enabled.warning)

    if (!shouldWriteToConsole) {
      // skip this step
    } else if (level === 'info') {
      console.log(chalk.green(message))
    } else if (level === 'error') {
      console.log(chalk.red(message))
    } else if (level === 'warning') {
      console.log(chalk.yellow(message))
    } else {
      console.log(message)
    }

    if (options?.trace) {
      console.trace()
    }
  }

  debug (what: any, options?: LogOptions): void {
    this._logWithLevel('debug', what, options)
  }

  verbose (what: any, options?: LogOptions): void {
    this._logWithLevel('verbose', what, options)
  }

  info (what: any, options?: LogOptions): void {
    this._logWithLevel('info', what, options)
  }

  warn (what: any, options?: LogOptions): void {
    this._logWithLevel('warning', what, options)
  }

  error (what: any, error?: Error, options?: LogOptions): void {
    if (error) {
      this._logWithLevel('error', `${what} ${errorToString(error)}`, options)
    } else {
      this._logWithLevel('error', what, options)
    }
  }

  silly (what: any): void {
    if (Math.random() < 0) {
      this.verbose(what)
    }
  }

  prettyPrint (what: string): void {
    if (!this._isTest && isString(what)) {
      const text = space + what + space
      const line = repeat('-', text.length)
      const prefix = this._isDev ? `${iso().isoDate} info: ` : 'info: '

      console.log(prefix, line)
      console.log(prefix, text)
      console.log(prefix, line)
    }
  }
}

export function createLogger(meta: BaseLoggerMeta): BaseStreamLogger {
  return new BaseStreamLogger(meta)
}

export function getLoggerForService (id: string): BaseStreamLogger {
  const meta: BaseLoggerMeta = { type: 'service', id }
  return findLogger(meta) || createLogger(meta)
}

export function getLoggerForRoute (id: string): BaseStreamLogger {
  const meta: BaseLoggerMeta = { type: 'route', id }
  return findLogger(meta) || createLogger(meta)
}

export function getAllLoggers (): BaseStreamLogger[] {
  return instances
}

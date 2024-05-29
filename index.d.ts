export interface LogOptions {
    throttle?: number;
    tags?: string[];
    trace?: boolean;
    data?: any;
}
export interface LoggerOptions {
    isDev?: boolean;
    isTest?: boolean;
}
export interface BaseLoggerMeta {
    type: string;
    id: string;
}
export declare type LogLevel = 'error' | 'warning' | 'info' | 'verbose' | 'debug';
export interface EnabledFlags {
    error: boolean;
    warning: boolean;
    info: boolean;
    verbose: boolean;
    debug: boolean;
}
export declare const findLogger: (meta: any) => BaseStreamLogger;
export declare class BaseStreamLogger {
    private readonly _meta;
    private readonly _enabled;
    private readonly _isDev;
    private readonly _isTest;
    constructor(meta: BaseLoggerMeta, initialLevel?: LogLevel, options?: LoggerOptions);
    hasMeta(meta?: Partial<BaseLoggerMeta>): boolean;
    setLevel(level: LogLevel): this;
    get prefix(): string;
    private _logWithLevel;
    debug(what: any, options?: LogOptions): void;
    verbose(what: any, options?: LogOptions): void;
    info(what: any, options?: LogOptions): void;
    warn(what: any, options?: LogOptions): void;
    error(what: any, error?: Error, options?: LogOptions): void;
    silly(what: any): void;
    prettyPrint(what: string): void;
}
export declare function createLogger(meta: BaseLoggerMeta): BaseStreamLogger;
export declare function getLoggerForService(id: string): BaseStreamLogger;
export declare function getLoggerForRoute(id: string): BaseStreamLogger;
export declare function getAllLoggers(): BaseStreamLogger[];

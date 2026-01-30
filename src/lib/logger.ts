// =====================================================
// LOGGING UTILITY
// =====================================================
// Centralized logging with levels and structured metadata
// =====================================================

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMeta {
    [key: string]: unknown;
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    meta?: LogMeta;
}

// Environment check for log visibility
const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV !== "production";

// Log level priority (lower = more verbose)
const LOG_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

// Minimum level to show in production
const PROD_MIN_LEVEL: LogLevel = "info";

function shouldLog(level: LogLevel): boolean {
    if (isDev) return true;
    return LOG_PRIORITY[level] >= LOG_PRIORITY[PROD_MIN_LEVEL];
}

function formatMeta(meta?: LogMeta): string {
    if (!meta || Object.keys(meta).length === 0) return "";
    try {
        return " " + JSON.stringify(meta);
    } catch {
        return " [meta serialization failed]";
    }
}

function createLogEntry(
    level: LogLevel,
    message: string,
    meta?: LogMeta
): LogEntry {
    return {
        level,
        message,
        timestamp: new Date().toISOString(),
        meta,
    };
}

// ------------------- Logger API -------------------

export const logger = {
    /**
     * Debug level - development only, stripped in production
     */
    debug(message: string, meta?: LogMeta): void {
        if (!shouldLog("debug")) return;
        const entry = createLogEntry("debug", message, meta);
        console.debug(
            `%c[DEBUG]%c ${entry.timestamp} ${message}${formatMeta(meta)}`,
            "color: gray; font-weight: bold",
            "color: gray"
        );
    },

    /**
     * Info level - general operational information
     */
    info(message: string, meta?: LogMeta): void {
        if (!shouldLog("info")) return;
        const entry = createLogEntry("info", message, meta);
        console.info(
            `%c[INFO]%c ${entry.timestamp} ${message}${formatMeta(meta)}`,
            "color: blue; font-weight: bold",
            "color: inherit"
        );
    },

    /**
     * Warn level - potential issues that don't break functionality
     */
    warn(message: string, meta?: LogMeta): void {
        if (!shouldLog("warn")) return;
        const entry = createLogEntry("warn", message, meta);
        console.warn(
            `%c[WARN]%c ${entry.timestamp} ${message}${formatMeta(meta)}`,
            "color: orange; font-weight: bold",
            "color: inherit"
        );
    },

    /**
     * Error level - failures requiring attention
     */
    error(message: string, error?: Error | unknown, meta?: LogMeta): void {
        if (!shouldLog("error")) return;
        const errorMeta: LogMeta = { ...meta };
        if (error instanceof Error) {
            errorMeta.errorMessage = error.message;
            errorMeta.errorStack = error.stack;
        } else if (error) {
            errorMeta.error = error;
        }
        const entry = createLogEntry("error", message, errorMeta);
        console.error(
            `%c[ERROR]%c ${entry.timestamp} ${message}${formatMeta(errorMeta)}`,
            "color: red; font-weight: bold",
            "color: inherit"
        );
    },

    /**
     * Group related logs together
     */
    group(label: string): void {
        if (isDev) console.group(label);
    },

    /**
     * End a log group
     */
    groupEnd(): void {
        if (isDev) console.groupEnd();
    },

    /**
     * Time an operation
     */
    time(label: string): void {
        if (isDev) console.time(label);
    },

    /**
     * End timing an operation
     */
    timeEnd(label: string): void {
        if (isDev) console.timeEnd(label);
    },
};

export default logger;

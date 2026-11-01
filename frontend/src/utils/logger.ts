type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function formatPrefix(level: LogLevel, scope: string): string {
    const now = new Date().toISOString().slice(11, 23);
    return `[AetherVR ${now}] [${level}] [${scope}]`;
}

export const logger = {
    debug(scope: string, message: string, data?: unknown) {
        if (import.meta.env.DEV) {
            if (data !== undefined) {
                console.debug(formatPrefix('DEBUG', scope), message, data);
            } else {
                console.debug(formatPrefix('DEBUG', scope), message);
            }
        }
    },
    info(scope: string, message: string, data?: unknown) {
        if (data !== undefined) {
            console.info(formatPrefix('INFO', scope), message, data);
        } else {
            console.info(formatPrefix('INFO', scope), message);
        }
    },
    warn(scope: string, message: string, data?: unknown) {
        if (data !== undefined) {
            console.warn(formatPrefix('WARN', scope), message, data);
        } else {
            console.warn(formatPrefix('WARN', scope), message);
        }
    },
    error(scope: string, message: string, error?: unknown) {
        if (error !== undefined) {
            console.error(formatPrefix('ERROR', scope), message, error);
        } else {
            console.error(formatPrefix('ERROR', scope), message);
        }
    },
};

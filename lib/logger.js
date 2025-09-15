/**
 * Logs an informational message.
 * @param {*} message 
 */
export function info(message) {
    console.log(`[INFO] ${message}`);
}

/**
 * Logs a warning message.
 * @param {*} message 
 */
export function warn(message) {
    console.warn(`[WARN] ${message}`);
}

/**
 * Logs an error message.
 * @param {*} message 
 */
export function error(message) {
    console.error(`[ERROR] ${message}`);
}
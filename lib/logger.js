/**
 * Logs an informational message.
 * @param {*} message 
 */
function info(message) {
    console.log(`[INFO] ${message}`);
}

/**
 * Logs a warning message.
 * @param {*} message 
 */
function warn(message) {
    console.warn(`[WARN] ${message}`);
}

/**
 * Logs an error message.
 * @param {*} message 
 */
function error(message) {
    console.error(`[ERROR] ${message}`);
}

module.exports = { info, warn, error };
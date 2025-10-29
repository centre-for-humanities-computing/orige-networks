/**
 * Whether a string is not null and not empty, i.e., has a length > 0
 * @param {string} str
 * @return {boolean}
 */
export function isNotNullNotEmptyString(str) {
    return str && typeof str === "string" && str.length > 0;
}

/**
 * Case-insensitive string search method
 * @param {string} str
 * @param {string} searchStr
 * @return {boolean}
 */
export function stringContainsIgnoreCase(str, searchStr) {
    return str.toLowerCase().includes(searchStr.toLowerCase());
}
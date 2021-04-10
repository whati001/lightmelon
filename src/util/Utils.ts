/**
 * Send the thread to sleep for given delay
 * @param delay set in milliseconds
 * @returns Promise when we wake up again
 */
export const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

/**
 * Convert seconds to milliseconds, if a negative value is passed, it will return 0
 * @param minute to convert into ms
 * @returns millisecond from seconds
 */
export const getMsFromMinute = (minute: number) => {
  return (minute >= 0) ? minute * 60 * 1000 : 0;
};

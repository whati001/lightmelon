
export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

export const getMsFromMinute = (minute: number) => { return minute * 60 * 1000; };
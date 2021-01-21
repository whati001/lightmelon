/**
 * Page configuration
 */
export type PageConfig = {
  name: string,
  url: string,
  interval: number,
  auth?: string
}
export type PageConfigs = PageConfig[];
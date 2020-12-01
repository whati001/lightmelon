
export interface PageBasicAuth {
  user: string,
  pwd: string
}
export type PageAuth = PageBasicAuth;

export interface PageConfig {
  url: string,
  interval: number,
  auth?: PageAuth
}

export type PagesConfig = PageConfig[];

export interface OutConfig {
  folder: string
}
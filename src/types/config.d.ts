
export interface PageBasicAuth {
  user: string,
  pwd: string
}
export type PageAuth = PageBasicAuth;

export interface PageConfig {
  name: string,
  url: string,
  interval: number,
  auth?: PageAuth
}

export type PagesConfig = PageConfig[];

export interface FileOutput {
  type: string,
  folder: string
}

export type ReportOutput = FileOutput;
export type ReportOutputs = ReportOutput[];

export type AppConfig = {
  output: ReportOutputs,
  workerInterval: number
}

/*
// TODO: handle it somehow
export interface PageBasicAuth {
  user: string,
  pwd: string
}
export type PageAuth = PageBasicAuth;
*/

export interface PageConfig {
  name: string,
  url: string,
  interval: number
}

export type PagesConfig = PageConfig[];

export interface FileOutput {
  type: string,
  folder: string
}

export type ReportOutput = FileOutput;
export type ReportOutputs = ReportOutput[];

export type BrowserConfig = string;
// TODO: for the POC, keep it as simple as possible
// export interface BrowserConfig {
//   executable: string,
//   profilePath: string,
//   userProfile: string
// }

export type AppConfig = {
  output: ReportOutputs,
  workerInterval: number,
  browserExecutable: BrowserConfig
}
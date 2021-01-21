
/**
 * Output configuration
 */
export type FileOutput = {
  type: string,
  folder: string
}

export type ReportOutput = FileOutput;
export type ReportOutputs = ReportOutput[];

export type UserAuth = {
  email: string,
  pwd: string
}

/**
 * Browser configuration
 */
export type BrowserConfig = {
  type: string,
  executable: string,
  headless: boolean,
  auth: UserAuth
}

/**
 * AppConfig
 */
export type AppConfig = {
  output: ReportOutputs,
  workerInterval: number,
  browser: BrowserConfig
}
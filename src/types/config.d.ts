export type BrowserConfig = {
  executable: string;
  headless: boolean;
};

export type WorkerConfig = {
  instances: number;
  sleepInterval: number;
};

export type FileOutputConfig = {
  type: string;
  folder: string;
};

export type HttpOutputConfig = {
  type: string;
  method: string;
  url: string;
};

export type OutputConfig = FileOutputConfig | HttpOutputConfig;

export type AppOutputConfig = OutputConfig[];

export type AppConfig = {
  browser: BrowserConfig;
  worker: WorkerConfig;
  output: AppOutputConfig;
};

type AbstractAuthConfig = {
  type: string;
  name: string;
  impl: string;
};

export interface WinAdAuthConfig extends AbstractAuthConfig {
  userMail: string;
  userPwd: string;
}

export type WinUserAuthConfig = WinAdAuthConfig;

export interface BasicAuthConfig extends AbstractAuthConfig {
  user: string;
  pwd: string;
}

export type AuthConfig = WinAdAuthConfig | BasicAuthConfig;

export type PageAuthConfig = AuthConfig[];

export type PageConfig = {
  name: string;
  url: string;
  interval: number;
  auth: string;
};

export type PagesConfig = PageConfig[];

export type LighthouseConfig = {
  app: AppConfig;
  auth: PageAuthConfig;
  pages: PagesConfig;
};

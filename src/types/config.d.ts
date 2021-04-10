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

export type WinAdAuthConfig = {
  userMail: string;
};

export type BasicUserAuthConfig = {
  user: string;
  pwd: string;
};

export type AuthConfig = WinAdAuthConfig | BasicUserAuthConfig;

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

import puppeteer from 'puppeteer-core';
import { AuthConfig } from './config';

/**
 * Authentication schemes
 */
export interface Auth {
  login(browser: puppeteer.Browser, auth: AuthConfig): Promise<boolean>;
  isLoggedIn(browser: puppeteer.Browser): Promise<boolean>;
  logout(browser: puppeteer.Browser): Promise<boolean>;
}
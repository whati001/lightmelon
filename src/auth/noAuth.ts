import { Auth } from './../types/auth';
import puppeteer from 'puppeteer-core';
import { UserAuth } from '../types/appConfig';


export default class NoAuth implements Auth {
  public async login(browser: puppeteer.Browser, auth: UserAuth): Promise<boolean> {
    return true;
  }
  public async isLoggedIn(browser: puppeteer.Browser): Promise<boolean> {
    return true;
  }
  public async logout(browser: puppeteer.Browser): Promise<boolean> {
    return true;
  }
}
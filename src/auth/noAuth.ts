import { Auth } from "./../types/auth";
import puppeteer from "puppeteer-core";
import { AuthConfig } from "../types/config";

export default class NoAuth implements Auth {
  public async login(
    browser: puppeteer.Browser,
    auth: AuthConfig,
  ): Promise<boolean> {
    return true;
  }
  public async isLoggedIn(browser: puppeteer.Browser): Promise<boolean> {
    return true;
  }
  public async logout(browser: puppeteer.Browser): Promise<boolean> {
    return true;
  }
}

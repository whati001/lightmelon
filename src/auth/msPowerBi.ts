import { Auth } from "./../types/auth";
import { AuthConfig } from "./../types/config";
import puppeteer from "puppeteer-core";
import { catAuth } from "./../util/Logger";

const LOGIN_URL = "https://login.microsoftonline.com/";
const VALIDATE_URL = "https://app.powerbi.com/home";
const WAIT_TIME = 10 * 1000;

export default class MsPowerBi implements Auth {
  public async login(
    browser: puppeteer.Browser,
    auth: AuthConfig,
  ): Promise<boolean> {
    try {
      const page = await browser.newPage();
      await page.goto(LOGIN_URL);
      await page.waitForTimeout(WAIT_TIME);

      const emailInput = await page.$(".input[type=email]");
      if (emailInput) {
        await page.type(".input[type=email]", auth.email);
        await page.click("input[type=submit]");
        await page.waitForTimeout(WAIT_TIME);

        if (await this.isLoggedIn(browser)) {
          return true;
        }

        await page.authenticate({ username: auth.email, password: auth.pwd });
        await page.goto(LOGIN_URL);
        await page.waitForTimeout(WAIT_TIME);

        await page.type(".input[type=email]", auth.email);
        await page.click("input[type=submit]");
        await page.waitForTimeout(WAIT_TIME);
      }

      return this.isLoggedIn(browser);
    } catch (e) {
      catAuth.error(
        "Failed to create a new page for user authentication",
        new Error("Brower failed to open new page"),
      );
      return false;
    }
  }
  public async isLoggedIn(browser: puppeteer.Browser): Promise<boolean> {
    try {
      const page = await browser.newPage();
      await page.goto(VALIDATE_URL);
      await page.waitForTimeout(WAIT_TIME);
      const elem = await page.$(".powerBILogoText");
      await page.close();
      return ((elem) ? true : false);
    } catch (e) {
      catAuth.error(
        "Failed to create a new page for user authentication",
        new Error("Brower failed to open new page"),
      );
      return false;
    }
  }

  public async logout(browser: puppeteer.Browser): Promise<boolean> {
    return true;
  }
}

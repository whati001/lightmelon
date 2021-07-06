import { Auth } from "./../types/auth";
import { AuthConfig, WinAdAuthConfig, WinUserAuthConfig } from "./../types/config";
import puppeteer from "puppeteer-core";
import { getLogger } from "./../util/Logger";

const LOGIN_URL = "https://login.microsoftonline.com/";
const VALIDATE_URL = "https://app.powerbi.com/home";
const WAIT_TIME = 10 * 1000;
const LOGGER = getLogger("AuthMSPowerBi").unwrap();

export default class MsPowerBi implements Auth {

  private async _loginPageInputMailAndSubmit(page: puppeteer.Page, email:string) : Promise<boolean> {
    LOGGER.info("Start to load main office login page and enter mail address");
    await page.goto(LOGIN_URL);
    await page.waitForTimeout(WAIT_TIME);

    const emailInput = await page.$(".input[type=email]");
    if (emailInput) {
      await page.type(".input[type=email]", email);
      await page.click("input[type=submit]");
      await page.waitForTimeout(WAIT_TIME);
      return true;
    }
    LOGGER.warn("Failed to submit user mail to main portal: " + LOGIN_URL);
    return false
  }

  public async login(
    browser: puppeteer.Browser,
    auth: AuthConfig,
  ): Promise<boolean> {
    try {
      LOGGER.info("Start login to PowerBi via method: " + auth.type);
      const page = await browser.newPage();
      switch (auth.type) {
        case "WinAdAuth": {

          const authInfo = auth as WinAdAuthConfig;
          await this._loginPageInputMailAndSubmit(page, authInfo.userMail);

          LOGGER.info("Perform authentication against page with user mail and password");
          await page.authenticate({
            username: authInfo.userMail,
            password: authInfo.userPwd,
          });

          await this._loginPageInputMailAndSubmit(page, authInfo.userMail);

          return this.isLoggedIn(browser);
        }
        case "WinUserAuth": {
          const authInfo = auth as WinUserAuthConfig;
          await this._loginPageInputMailAndSubmit(page, authInfo.userMail);

          LOGGER.info("Perform authentication against page with user mail and password");
          await page.type("#passwordInput", authInfo.userPwd);
          await page.click("#submitButton");
          await page.waitForTimeout(WAIT_TIME);
          
          return this.isLoggedIn(browser);
        }
        default: {
          LOGGER.warn("Undefined Authentication type choose, please checkout documentation");
          return false;
        }
      }
    } catch (e) {
      LOGGER.error(
        "Failed to create a new page for user authentication",
        new Error("Brower failed to open new page"),
      );
      LOGGER.error(JSON.stringify(e));
      return false;
    }
  }
  public async isLoggedIn(browser: puppeteer.Browser): Promise<boolean> {
    try {
      LOGGER.info("Check if user authenticated against PowerBi")
      const page = await browser.newPage();
      await page.goto(VALIDATE_URL);
      await page.waitForTimeout(WAIT_TIME);
      const elem = await page.$(".powerBILogoText");
      await page.close();
      if (elem) {
        LOGGER.info("User is authenticated against PowerBi portal");
        return true;
      } else {
        LOGGER.info("User is NOT authenticated against PowerBi portal");
        return false;
      }
    } catch (e) {
      LOGGER.error(
        "Failed to create a new page for user authentication",
        new Error("Brower failed to open new page"),
      );
      LOGGER.error(JSON.stringify(e));
      return false;
    }
  }

  public async logout(browser: puppeteer.Browser): Promise<boolean> {
    return true;
  }
}

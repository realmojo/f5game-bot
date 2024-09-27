const axios = require("axios");
const marked = require("marked");
const webdriver = require("selenium-webdriver");
const robot = require("robotjs");
const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

global.driver = "";
// Mac Os 터미널에서 실행
// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="~/ChromeProfile"

const users = [
  {
    id: "hotsixlight",
    pw: "zoahzjvl!@3",
    max: 30,
    current: 0,
  },
];

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const logWait = async (message = "기다립니다", ms = 1) => {
  console.log(message);
  await global.driver.sleep(ms * 1000);
};

const typeStringAutomatically = async (text) => {
  for (let char of text) {
    console.log(char);
    robot.typeString(char);
    await sleep(200); // 100 밀리초 지연 (필요에 따라 조절 가능)
  }
};

const run = async () => {
  const chromeOptions = new chrome.Options();
  chromeOptions.debuggerAddress("127.0.0.1:9222");
  global.driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  console.log("start");

  await logWait("네이버를 접속 합니다", 1);
  const naverUrl = "https://naver.com";
  await driver.get(naverUrl);

  try {
    await logWait("로그인이 되어 있다면 로그아웃 합니다.", 1);
    const logoutElement = await driver.findElement(
      By.className("MyView-module__btn_logout___bsTOJ")
    );

    if (logoutElement) {
      logoutElement.click();
      await logWait("잠시 대기합니다.", 1);
    }
  } catch (e) {
    console.log(e);
  }

  await logWait("로그인 버튼을 클릭합니다", 1);
  await driver
    .findElement(By.className("MyView-module__link_login___HpHMW"))
    .click();

  await logWait("아이디를 창을 클릭 합니다", 1);
  await driver.findElement(By.id("id")).click();

  await logWait("아이디를 입력 합니다", 1);
  await typeStringAutomatically(users[0].id);
  // await driver.findElement(By.id("id")).sendKeys(users[0].id);
  await logWait("비밀번호 창을 클릭 합니다", 1);
  await driver.findElement(By.id("pw")).click();

  await logWait("비밀번호를 입력 합니다", 1);
  await typeStringAutomatically(users[0].pw);
  // await driver.findElement(By.id("pw")).sendKeys(users[0].pw);
  await logWait("비밀번호를 보이게 합니다", 1);
  await driver.findElement(By.id("pw")).click();

  await logWait("로그인을 합니다", 1);
  await driver.findElement(By.id("log.login")).click();

  await logWait("지식인을 접속 합니다", 1);

  let urls = [];
  for (let i = 5; i > 0; i--) {
    const kinCategoryUrl = `https://kin.naver.com/qna/list.naver?dirId=4&page=${i}`;
    await driver.get(kinCategoryUrl);

    await logWait("스크립트를 삽입합니다.", 1);
    const getUrlScript = fs.readFileSync("getUrls.js", "utf8");
    const u = await driver.executeScript(getUrlScript);
    urls = urls.concat(u);
    await logWait("URL을 가져옵니다.", 1);
  }

  console.log(urls);
  await logWait("잠시 대기합니다.", 10);
  await logWait("시작합니다.", 1);

  let index = 1;
  if (urls.length > 0) {
    for (const url of urls) {
      await logWait(`${index++}, ${url} 이동 합니다.`, 1);
      await driver.get(url);
      await logWait("포스팅 스크립트를 삽입합니다.", 1);
      const kinInitScript = fs.readFileSync("kinInit.js", "utf8");
      await driver.executeScript(kinInitScript);

      let timer = 120;
      await logWait("스크립트를 삽입하였습니다.", 1);
      for (let i = timer; i > 0; i--) {
        await logWait(`대기가 ${i}초 남았습니다.`, 1);
      }
    }
  }
};
run();

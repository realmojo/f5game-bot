const webdriver = require("selenium-webdriver");
const robot = require("robotjs");
const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

global.driver = "";
// Mac Os 터미널에서 실행
// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="~/ChromeProfile"
// C:\Program Files\Google\Chrome\Application\chrome.exe --remote-debugging-port=9222 --user-data-dir="C:/ChromeTEMP"
// C:\Program Files (x86)\Google\Chrome\Application\chrome.exe --remote-debugging-port=9222 --user-data-dir="C:/ChromeTEMP"

const users = [
  {
    id: "crinex88",
    pw: "zoahzjvl!@3",
    max: 30,
    current: 0,
    dirId: 8, // 생활
  },
  {
    id: "tedevspace",
    pw: "zoahzjvl!@3",
    max: 30,
    current: 0,
    dirId: 1, // 컴퓨터통신
  },
  {
    id: "g3andg2",
    pw: "zoahzjvl!@3",
    max: 30,
    current: 0,
    dirId: 4, // 경제
  },
  {
    id: "hotsixlight",
    pw: "zoahzjvl!@3",
    max: 30,
    current: 0,
    dirId: 6, // 사회, 정치
  },
  {
    id: "unixseen",
    pw: "zoahzjvl!@3",
    max: 30,
    current: 0,
    dirId: 4, // 경제
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

const closeAlertIfPresent = async (driver) => {
  try {
    // Alert 창이 나타날 때까지 최대 3초 대기
    await driver.wait(until.alertIsPresent(), 1000);

    // Alert 창으로 전환
    let alert = await driver.switchTo().alert();

    // Alert 메시지 출력 (옵션)
    let alertText = await alert.getText();
    console.log("발생한 Alert 메시지:", alertText);

    // Alert 수락 (확인 버튼 클릭)
    await alert.accept();
    console.log("Alert 창을 닫았습니다.");

    if (alertText.indexOf("등급에서 하루에") !== -1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.name === "TimeoutError") {
      // Alert 창이 나타나지 않음
      console.log("Alert 창이 존재하지 않습니다. 계속 진행합니다.");
      return false;
    } else {
      // 다른 예외 처리
      console.error("Alert 처리 중 오류 발생:", error);
    }
  }
};

const run = async () => {
  const clipboardy = await import("clipboardy");
  const chromeOptions = new chrome.Options();
  chromeOptions.debuggerAddress("127.0.0.1:9222");
  global.driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  console.log("start");

  for (const user of users) {
    await logWait(`${user.id}로 작업을 진행 합니다`, 3);

    await logWait("네이버를 접속 합니다", 1);
    const naverUrl = "https://naver.com";
    await driver.get(naverUrl);

    try {
      await logWait("로그인이 되어 있다면 로그아웃 합니다.", 1);
      const logoutElements = await driver.findElements(
        By.xpath("//button[text()='로그아웃']")
      );

      if (logoutElements.length > 0) {
        logoutElements[0].click();
        await logWait("잠시 대기합니다.", 1);
      }
    } catch (e) {
      console.log(e);
      await logWait("로그인을 계속 진행 합니다.", 1);
    }

    await logWait("로그인 버튼을 클릭합니다", 1);
    // await driver
    //   .findElement(By.xpath("//a[contains(text(), '로그인')]"))
    //   .click();

    await driver
      .findElement(By.className("MyView-module__link_login___HpHMW"))
      .click();

    await logWait("아이디를 복사 합니다", 1);
    await clipboardy.default.writeSync(user.id);
    await logWait("아이디를 창을 클릭 합니다", 2);
    await driver.findElement(By.id("id")).click();

    await logWait("아이디를 입력 합니다", 2);
    await driver.findElement(By.id("id")).sendKeys(Key.chord(Key.COMMAND, "v"));
    // await clipboardy.default.readSync();

    // await typeStringAutomatically(users[0].id);
    // await driver.findElement(By.id("id")).sendKeys(user.id);
    await logWait("비밀번호를 복사 합니다", 1);
    await clipboardy.default.writeSync(user.pw);
    await logWait("비밀번호 창을 클릭 합니다", 2);
    await driver.findElement(By.id("pw")).click();

    await logWait("비밀번호를 입력 합니다", 2);
    await driver.findElement(By.id("pw")).sendKeys(Key.chord(Key.COMMAND, "v"));
    // await typeStringAutomatically(users[0].pw);
    // await driver.findElement(By.id("pw")).sendKeys(user.pw);

    await logWait("로그인 하기전 5초 대기 합니다", 5);
    await driver.findElement(By.id("log.login")).click();

    await logWait("5초 잠시 대기합니다.", 5);

    await logWait("지식인을 접속 합니다", 1);

    let urls = [];
    for (let i = 1; i < 6; i++) {
      const kinCategoryUrl = `https://kin.naver.com/qna/list.naver?dirId=${user.dirId}&page=${i}`;
      await driver.get(kinCategoryUrl);

      await logWait("스크립트를 삽입합니다.", 1);
      const getUrlScript = fs.readFileSync("getUrls.js", "utf8");
      const u = await driver.executeScript(getUrlScript);
      urls = urls.concat(u);
      await logWait("URL을 가져옵니다.", 1);
    }

    console.log(urls);
    await logWait("잠시 대기합니다.", 3);
    await logWait("시작합니다.", 1);

    if (urls.length > 0) {
      let index = 1;
      for (const url of urls) {
        try {
          const isAlert = await closeAlertIfPresent(driver);

          if (isAlert) {
            user.current = 50;
            break;
          } else if (user.current < 50) {
            await logWait(`${index++}. ${url} 이동 합니다.(${user.id})`, 1);
            await driver.get(url);
            await logWait("포스팅 스크립트를 삽입합니다.", 1);
            const kinInitScript = fs.readFileSync("kinInit.js", "utf8");
            await driver.executeScript(kinInitScript);
            await logWait("포스팅을 진행합니다.", 1);

            let timer = 90;
            for (let i = timer; i > 0; i--) {
              await logWait(`${i}초 남았습니다.`, 1);
            }
            user.current++;
          }
        } catch (e) {
          console.log(e);
          await logWait(
            "해당 포스팅에 오류가 있어 10초 후 다음으로 넘어갑니다.",
            10
          );
        }
      }
    }
  }
};
run();

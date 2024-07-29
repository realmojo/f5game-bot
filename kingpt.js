const axios = require("axios");
const marked = require("marked");
const webdriver = require("selenium-webdriver");
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");
const shortid = require("shortid");
const robot = require("robotjs");
const WPAPI = require("wpapi");

// clipboardy를 동적으로 import
const getClipboardy = async () => {
  const clipboardy = await import("clipboardy");
  const d = clipboardy.default.readSync();
  const f = JSON.parse(d);
  return f;
};

global.driver = "";
// Mac Os 터미널에서 실행
// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="~/ChromeProfile"

const replaceAll = (str, searchStr, replaceStr) => {
  return str.split(searchStr).join(replaceStr);
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const typeStringAutomatically = async (text) => {
  for (let char of text) {
    console.log(char);
    if (char === ".") {
      robot.keyTap("enter");
    }
    robot.typeString(char);
    await sleep(100); // 100 밀리초 지연 (필요에 따라 조절 가능)
  }
};

const logWait = async (message = "기다립니다", ms = 1) => {
  console.log(message);
  await global.driver.sleep(ms * 1000);
};

const doPost = (title, content) => {
  const wp = new WPAPI({
    endpoint: "https://techupbox.com/wp-json",
    username: process.env.WP_TECHUPBOX_ID || "strikers1999",
    password: process.env.WP_TECHUPBOX_PW || "wjdaksrud!@3",
  });

  return new Promise((resolve) => {
    wp.posts()
      .create({
        title: title,
        content: content,
        categories: [60],
        // featured_media: 999,
        status: "publish",
      })
      .then(function (res) {
        resolve(res.link);
      });
  });
};

const run = async () => {
  const chromeOptions = new chrome.Options();
  chromeOptions.debuggerAddress("127.0.0.1:9222");
  // const service = nChrome.ServiceBuilder("./chromedriver").build();
  // chrome.setDefaultService(service);
  global.driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  console.log("start");

  await logWait("지식인으로 이동합니다", 1);
  const kinUrl =
    "https://kin.naver.com/qna/detail.naver?d1id=1&dirId=1061203&docId=473194451";
  await driver.get(kinUrl);

  await logWait("지식인 제목을 가져옵니다", 1);
  let kinTitle = await driver
    .findElement(By.className("endTitleSection"))
    .getText();
  kinTitle = kinTitle.split("\n")[1].trim();

  await logWait(kinTitle, 1);

  const url = "https://chatgpt.com/g/g-LOeTLdZeR-beulrogeu-kontenceu-mandeulgi";

  // 창 focus 변경
  const window = await driver.getWindowHandle();
  await driver.switchTo().window(window);

  await logWait("챗지피티 접속을 합니다", 1);
  await driver.get(url);

  let title = `[${kinTitle}]에 대한 글을 작성해주고, data-ca-pub는 [ca-pub-1963334904140891] data-ad-slot 광고코드는 [8545344748] 값으로 세팅해줘. 그리고 주제는 title, 내용은 content로 해주고 content는 html코드로 변환한 다음 <h1> 태그의 내용은 꼭 삭제해줘. 그리고 결과값은 json만 반환해줘`;
  console.log(title);
  await logWait("좀만 기달려", 3);
  try {
    // 모든 요소 찾기
    await logWait("프롬프트 창을 클릭", 3);
    await driver.findElement(By.id("prompt-textarea")).click();
    await logWait("질문을 입력", 3);
    await driver.findElement(By.id("prompt-textarea")).sendKeys(title);
    await logWait("버튼 클릭", 3);
    await driver.findElement(By.css('[data-testid="send-button"]')).click();
    await logWait("내용이 다 나올때까지 2분 기다린다", 120);

    // let elements = await driver.findElements(
    //   By.css(".cursor-pointer.absolute")
    // );

    // console.log("밑으로 내려가기 있으면 클릭");
    // if (elements.length > 0) {
    //   let element = elements[0];
    //   await element.click();
    // }

    // await logWait("내용이 다 나올때까지 10초 기다린다", 10);

    // 요소가 있으면 부모 요소 클릭
    // let rotateElements = await driver.findElements(By.className("-rotate-180"));

    // if (rotateElements.length > 0) {
    //   let rotateElement = rotateElements[0];
    //   let parentElement = await rotateElement.findElement(By.xpath(".."));
    //   await parentElement.click();
    // }

    await logWait("내용이 다 나왔습니다. 내용 복사를 진행합니다.", 1);
    // elements = await driver.findElements(By.css(".flex.gap-1.items-center"));
    let xpathExpression =
      "//*[contains(concat(' ', normalize-space(@class), ' '), ' flex ')" +
      " and contains(concat(' ', normalize-space(@class), ' '), ' gap-1 ')" +
      " and contains(concat(' ', normalize-space(@class), ' '), ' items-center ')" +
      " and not(contains(concat(' ', normalize-space(@class), ' '), ' ') and not(contains(@class, 'flex gap-1 items-center')))]";

    elements = await driver.findElements(By.xpath(xpathExpression));

    // 요소가 있으면 클릭
    if (elements.length > 0) {
      let element = elements[0];
      await element.click();
    }
    // elements = await driver.findElements(By.className("icon-md-heavy"));
    // if (elements.length >= 2) {
    //   let secondElement = elements[1];
    //   await secondElement.click();
    // }
    await logWait("복사를 완료 하였습니다.", 1);

    let d = await getClipboardy();

    await logWait("워드프레스에 업로드 합니다.", 1);
    title = d.title;
    content = d.content;
    console.log(title);
    console.log(content);
    const link = await doPost(title, content);
    // const link =
    //   "https://techupbox.com/%ec%a7%88%eb%ac%b8%eb%b3%b4%ea%b4%80%ec%86%8c/25397";

    await logWait("지식인에 접속합니다.", 3);
    await driver.get(kinUrl);

    // 하단으로 내리기
    await driver.executeScript(
      "window.scrollTo(0, document.body.scrollHeight);"
    );

    const window = await driver.getWindowHandle();
    await driver.switchTo().window(window);

    await logWait("하단으로 내립니다.", 3);

    await logWait("답변을 클릭합니다.", 3);
    await driver.findElement(By.id("answerButtonArea")).click();
    // await driver
    //   .findElements(By.css(".endAnswerButton._answerWriteButton._scrollToEditor"))
    //   .click();

    await logWait("에디터 잠시 기다립니다.1", 3);
    await driver.findElement(By.className("se-component-content")).click();
    await logWait("에디터 잠시 기다립니다.2", 3);

    await typeStringAutomatically(
      `${kinTitle}에 대한 내용입니다. 참고해 보시길 바랍니다.\n ${link}\n`
      // `삼성페이 모바일신분증에 대한 내용입니다. 참고해 보시길 바랍니다.\n ${link}\n`
    );

    await logWait("링크를 기다립니다..", 20);

    await driver.findElement(By.id("answerRegisterButton")).click();
    await logWait("등록을 기다립니다.", 20);
  } catch (e) {
    console.log(e);
  }
};

run();

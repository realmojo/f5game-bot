const axios = require("axios");
const marked = require("marked");
const webdriver = require("selenium-webdriver");
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");
const shortid = require("shortid");
const robot = require("robotjs");

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
    robot.typeString(char);
    await sleep(100); // 100 밀리초 지연 (필요에 따라 조절 가능)
  }
};

const d = fs.readFileSync("./naverSample.txt", "utf-8");

const run = async () => {
  const chromeOptions = new chrome.Options();
  chromeOptions.debuggerAddress("127.0.0.1:9222");
  // const service = nChrome.ServiceBuilder("./chromedriver").build();
  // chrome.setDefaultService(service);
  const driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  console.log("start");

  const url = "https://blog.naver.com/sdfddf?Redirect=Write&";

  await driver.sleep(1000);

  // 창 focus 변경
  const window = await driver.getWindowHandle();
  await driver.switchTo().window(window);

  await driver.get(url);
  await driver.sleep(2000);

  // iframe으로 전환
  await driver.switchTo().frame(await driver.findElement(By.id("mainFrame")));

  // 특정 클래스명을 가진 요소가 로드될 때까지 기다림
  const titleElement = await driver.wait(
    until.elementLocated(By.className("se-documentTitle")),
    3000
  );

  // 요소가 보일 때까지 기다림
  await driver.wait(until.elementIsVisible(titleElement), 3000);

  // 요소에 포커스를 맞추기 위해 클릭
  await titleElement.click();

  // 약간의 지연 후 포커스 이동
  await sleep(1000); // 1초 대기

  const sentence = "Hello, this is an automated typing!";
  await typeStringAutomatically(sentence);

  // 특정 클래스명을 가진 요소가 로드될 때까지 기다림
  const contentElement = await driver.wait(
    until.elementLocated(By.className("se-placeholder")),
    3000
  );

  // 요소가 보일 때까지 기다림
  await driver.wait(until.elementIsVisible(contentElement), 3000);
  // 요소에 포커스를 맞추기 위해 클릭
  await contentElement.click();

  await driver.sleep(1000);

  const sentence1 = "Hello, this is an automated typing!!!!!";
  await typeStringAutomatically(sentence1);
  // await driver.get(url);
  // await driver.sleep(2000);

  // console.log("스크립트 삽입, 이미지 다운로드");
  // const script = fs.readFileSync("crawl.js", "utf8");
  // await driver.executeScript(script);

  // console.log("제목 추출");
  // const script1 = fs.readFileSync("getItem.js", "utf8");
  // let result = await driver.executeScript(script1);
  // await driver.sleep(10000);
  // // 이미지 업로드

  // const filePath = "/Users/realmojo/Downloads/capture.png";
  // await driver.sleep(1000);
  // // 파일 이름 추출
  // const fileName = path.basename(filePath);
  // // 파일 내용 읽기
  // const fileContent = fs.readFileSync(filePath);

  // console.log("이미지 업로드");
  // const imageUrl = await upload(fileName, fileContent);
  // await driver.sleep(1000);
  // // console.log(result);

  // console.log("워프 작성");
  // await doPost(result.title, `<p><img src="${imageUrl}" /></p>`);

  // console.log("파일 삭제");
  // fs.unlinkSync(filePath);

  // // 공개 발행 클릭
  // // await driver.findElement(By.id("publish-btn")).click();
  // console.log("한시간 쉽니다.");
  // await driver.sleep(1000 * 60 * 60);
};

run();

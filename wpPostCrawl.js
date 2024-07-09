const axios = require("axios");
const marked = require("marked");
const webdriver = require("selenium-webdriver");
const { By, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const shortid = require("shortid");
const WPAPI = require("wpapi");

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_SECRET_KEY,
  region: "ap-northeast-2",
});

// Mac Os 터미널에서 실행
// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="~/ChromeProfile"

const replaceAll = (str, searchStr, replaceStr) => {
  return str.split(searchStr).join(replaceStr);
};

const upload = async (fileName, fileContent) => {
  // S3 업로드 파라미터 설정

  const ext = fileName.split(".")[1];

  const params = {
    Bucket: "newstiz",
    Key: `images/${shortid()}.${ext}`,
    Body: fileContent,
  };

  // S3에 파일 업로드
  return new Promise((resolve) => {
    s3.upload(params, (err, data) => {
      if (err) {
        console.error(`File upload failed: ${err.message}`);
      } else {
        resolve(data.Location);
        console.log(`File uploaded successfully. Location: ${data.Location}`);
      }
    });
  });
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
        categories: [41],
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
  const driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  console.log("start");

  const url = "https://theqoo.net/hot/3313185233";

  await driver.sleep(1000);

  await driver.get(url);
  await driver.sleep(2000);

  console.log("스크립트 삽입, 이미지 다운로드");
  const script = fs.readFileSync("crawl.js", "utf8");
  await driver.executeScript(script);

  console.log("제목 추출");
  const script1 = fs.readFileSync("getItem.js", "utf8");
  let result = await driver.executeScript(script1);
  await driver.sleep(10000);
  // 이미지 업로드

  const filePath = "/Users/realmojo/Downloads/capture.png";
  await driver.sleep(1000);
  // 파일 이름 추출
  const fileName = path.basename(filePath);
  // 파일 내용 읽기
  const fileContent = fs.readFileSync(filePath);

  console.log("이미지 업로드");
  const imageUrl = await upload(fileName, fileContent);
  await driver.sleep(1000);
  // console.log(result);

  console.log("워프 작성");
  await doPost(result.title, `<p><img src="${imageUrl}" /></p>`);

  console.log("파일 삭제");
  fs.unlinkSync(filePath);

  // 공개 발행 클릭
  // await driver.findElement(By.id("publish-btn")).click();
  console.log("한시간 쉽니다.");
  await driver.sleep(1000 * 60 * 60);
};

run();

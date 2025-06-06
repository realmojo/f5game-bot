const axios = require("axios");
const crypto = require("crypto");
const cheerio = require("cheerio");
const { replaceAll } = require("../../utils/util");

// Access Key, Secret Key, Customer ID를 상수로 정의
const accessLicense = process.env.NAVER_ACCESS_LICENSE;
const secretKey = process.env.NAVER_SECRET_KEY;
const customerId = process.env.NAVER_CUSTOMER_ID;

// HMAC-SHA256 암호화를 이용하여 서명(signature)을 생성
const createSignature = async (secretKey, timestamp, method, api_url) => {
  // TextEncoder를 이용하여 입력 데이터를 UTF-8 형식으로 인코딩
  const encoder = new TextEncoder();
  const data = encoder.encode(`${timestamp}.${method}.${api_url}`);

  // 암호화에 사용할 키를 생성
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // 생성한 키와 입력 데이터를 이용하여 서명을 생성
  const signatureArrayBuffer = await crypto.subtle.sign("HMAC", key, data);

  // 서명 결과를 base64로 인코딩
  const signature = btoa(
    String.fromCharCode(...new Uint8Array(signatureArrayBuffer))
  );
  return signature;
};

// 네이버 키워드 검색 API를 이용하여 주어진 키워드에 대한 검색 결과 반환
const fetchKeyword = async (keywords, isStat = false) => {
  // API 호출에 필요한 인자들을 정의
  const method = "GET";
  const api_url = "/keywordstool";
  const timestamp = Date.now().toString();

  // HMAC-SHA256 암호화를 이용하여 서명(signature)을 생성
  const signature = await createSignature(
    secretKey,
    timestamp,
    method,
    api_url
  );

  let queryString = `format=json&hintKeywords=${encodeURIComponent(
    keywords
  )}&showDetail=1`;
  if (isStat) {
    queryString = `?format=json&siteId=&month=&biztpId=&event=&includeHintKeywords=0&showDetail=1&keyword=${encodeURIComponent(
      keywords
    )}`;
  }

  console.log(`https://api.naver.com/keywordstool?${queryString}`);
  // 생성한 서명과 함께 API를 호출하여 검색 결과 반환
  console.log(isStat, {
    "X-Timestamp": timestamp,
    "X-API-KEY": accessLicense,
    "X-CUSTOMER": customerId,
    "X-Signature": signature,
  });
  const response = await fetch(
    `https://api.naver.com/keywordstool?${queryString}`,
    {
      headers: {
        "X-Timestamp": timestamp,
        "X-API-KEY": accessLicense,
        "X-CUSTOMER": customerId,
        "X-Signature": signature,
      },
    }
  );

  // console.log(response);

  // 검색 결과를 출력하는 함수를 호출
  const data = await response.json();

  const items = displayResults(data);
  return items;
};

// 검색 결과 출력
const displayResults = (data) => {
  // 최대 검색 결과 개수를 20개로 설정
  // let maxResults = 20;
  const d = [];
  if (data.keywordList.length > 0) {
    for (let i = 0; i < data.keywordList.length; i++) {
      const keyword = data.keywordList[i];
      const pCount =
        typeof keyword.monthlyPcQcCnt === "string"
          ? Number(keyword.monthlyPcQcCnt.replace("< ", ""))
          : keyword.monthlyPcQcCnt;
      const mCount =
        typeof keyword.monthlyMobileQcCnt === "string"
          ? Number(keyword.monthlyMobileQcCnt.replace("< ", ""))
          : keyword.monthlyMobileQcCnt;
      d.push({
        keyword: keyword.relKeyword.trim(),
        pc: pCount,
        mobile: mCount,
        total: pCount + mCount,
        today: Math.floor((pCount + mCount) / 30),
        pcClickCnt: keyword.monthlyAvePcClkCnt,
        mobileClickCnt: keyword.monthlyAveMobileClkCnt,
        pcCtr: keyword.monthlyAvePcCtr,
        mobileCtr: keyword.monthlyAveMobileCtr,
        complex: keyword.compIdx,
      });
    }

    d.sort((a, b) => {
      // first criteria
      if (a.total > b.total) return -1;
      if (a.total < b.total) return 1;

      // second criteria
      if (a.mobileCtr > b.mobileCtr) return 1;
      if (a.mobileCtr < b.mobileCtr) return -1;
    });
  }

  return d;
};

const getKeywordList = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (keyword) {
      const { data } = await axios.get(
        `https://api.mindpang.com/api/keyword/list.php?keyword=${encodeURIComponent(
          keyword
        )}`
      );
      return res.status(200).send(data);
    } else {
      const { data } = await axios.get(
        `https://api.mindpang.com/api/keyword/list.php`
      );
      return res.status(200).send(data);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

const getKeyword = async (req, res) => {
  try {
    let { keyword } = req.query;
    if (!keyword) {
      throw new Error("no keyword");
    }
    keyword = replaceAll(keyword, " ", "");
    const data = await fetchKeyword(keyword, false);
    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

const getKeywordStat = async (req, res) => {
  try {
    let { keyword } = req.query;
    if (!keyword) {
      throw new Error("no keyword");
    }
    keyword = replaceAll(keyword, " ", "");
    const data = await fetchKeyword(keyword, true);
    console.log(data);
    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

const addKeyword = async (req, res) => {
  try {
    let { keyword } = req.query;

    keyword = replaceAll(keyword, " ", "");
    const items = await fetchKeyword(keyword, false);
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const data = {
      items: items,
    };
    const { data: response } = await axios.post(
      "https://api.mindpang.com/api/keyword/add.php",
      data,
      config
    );

    return res.status(200).send({ status: response, keyword, items });
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};

const transBlogUrl = (url) => {
  const d = url.split("/");
  return `https://blog.naver.com/PostView.naver?blogId=${
    d[d.length - 2]
  }&logNo=${d[d.length - 1]}`;
};

const getBlogAnalysisInfo = async (req, res) => {
  try {
    const { urls } = req.body;
    const items = [];

    for (let url of urls) {
      let type = "";
      let imageCount = 0;
      let linkCount = 0;
      let trimExcludeWords = 0;
      let wordInfo = "";
      if (url.indexOf("tistory.com") !== -1) {
        type = "티스토리";
        items.push({
          type,
          imageCount: 0,
          wordCount: 0,
          wordSpaceCount: 0,
          linkCount: 0,
        });
        continue;
      } else if (
        url.indexOf("blog.naver.com") !== -1 ||
        url.indexOf("in.naver.com") !== -1
      ) {
        type = "인플루언서";
        if (url.indexOf("blog.naver.com") !== -1) {
          type = "블로그";
          url = transBlogUrl(url);
        }
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const d = $(".se-main-container");
        imageCount = d.find(".se-image-resource").length.toLocaleString() || 0;
        linkCount = d.find("a").length.toLocaleString() || 0;
        wordInfo = d.find(".se-text-paragraph").text() || "";

        trimExcludeWords = replaceAll(wordInfo, " ", "");
      } else if (url.indexOf("post.naver.com") !== -1) {
        type = "포스트";

        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const d = $(".se_component_wrap");
        imageCount = d.find(".se_mediaImage").length.toLocaleString() || 0;
        linkCount = d.find("a").length.toLocaleString() || 0;
        wordInfo = d.find(".se_textarea").text() || "";

        trimExcludeWords = replaceAll(wordInfo, " ", "");
      } else if (url.indexOf("cafe.naver.com") !== -1) {
        type = "카페";
        items.push({
          type,
          imageCount: 0,
          wordCount: 0,
          wordSpaceCount: 0,
          linkCount: 0,
        });
        continue;
      } else {
        type = "홈페이지";
        items.push({
          type,
          imageCount: 0,
          wordCount: 0,
          wordSpaceCount: 0,
          linkCount: 0,
        });
        continue;
      }

      items.push({
        type,
        imageCount,
        wordCount: trimExcludeWords.length.toLocaleString(),
        wordSpaceCount: wordInfo.length.toLocaleString(),
        linkCount,
      });
    }

    return res.status(200).send(items);
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};
module.exports = {
  getKeywordList,
  getKeywordStat,
  getKeyword,
  addKeyword,
  getBlogAnalysisInfo,
};

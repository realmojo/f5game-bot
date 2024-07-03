const axios = require("axios");
const crypto = require("crypto");
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
const fetchKeyword = async (keywords) => {
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

  // 생성한 서명과 함께 API를 호출하여 검색 결과 반환
  const response = await fetch(
    `https://api.naver.com/keywordstool?hintKeywords=${encodeURIComponent(
      keywords
    )}&showDetail=1`,
    {
      headers: {
        "X-Timestamp": timestamp,
        "X-API-KEY": accessLicense,
        "X-CUSTOMER": customerId,
        "X-Signature": signature,
      },
    }
  );

  // 검색 결과를 출력하는 함수를 호출
  const data = await response.json();
  const items = displayResults(data);
  console.log(items);
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
        keyword: keyword.relKeyword,
        pc: pCount,
        mobile: mCount,
        total: pCount + mCount,
        today: Math.floor((pCount + mCount) / 30),
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

const getList = async (req, res) => {
  try {
    let { keyword } = req.query;

    keyword = replaceAll(keyword, " ", "");
    const items = await fetchKeyword(keyword);
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

module.exports = {
  getList,
};

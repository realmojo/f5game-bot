const axios = require("axios");
const crypto = require("crypto");
const iconv = require("iconv-lite");

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

const doCreateQrUrl = async (req, res) => {
  try {
    const { title, link } = req.query;

    const url = "https://qr-web.naver.com/code/createCode";
    const params = {
      infoType: "url",
      qrColorBorderCd: "#03C75A",
      qrDesc: "",
      qrDirectLink: link,
      qrDirectLinkTypeCd: 29,
      qrName: title,
      qrSaveStatusCd: 79,
      qrShape: 1,
      sessions: [
        {
          attachment: {
            title,
            desc: "",
          },
          orderId: 0,
          type: "Basic",
        },
        {
          attachment: {
            linkSubject: `web-${new Date().getTime()}`,
          },
          attachments: [{ linkUrl: link }],
          orderId: 1,
          type: "Link",
        },
      ],
    };

    const NID_AUT =
      "8k+dFKu1a5/1y5RdEzxK2269LTuwNBTd1GboYGkMg2yXTSG0wN915rjOZs2d4lWW";
    const NID_SES =
      "AAABi9FtleKltv4CqXGkIp9ojN9PSlp0ffMU0tCuCeAamyaGlSWxJr5uH1uWNHIb/MtQVDyufBYiwQBHVtOwXWUIVdpYvUJVTP+Iu07zLmLOKFasvy3I0+Fvay3obv+DEW3hOnvj+RsHoBm70NGG4Cv1G7otfcXdUliWjgwjlGLXDY39LF45l9iuH7F1fbRd/VcW7OBbar0Lfjc+K4SMRzRs4bNcJzA0j+axvy6cPZ5mGGcGJkLwkAjDRmz6nzX+lXdFUOCPVyZqMlgyP5lTs1NSi8Nq6yLo4CvM4wDmLIy+dekqXXhkjogoVSx94fXT7fv4Uo0lVl325cCjxSFJKeXZOFJDfvcRx27pRoKYlxWYAbiOomERAeLjZfcRDLDVXq8ea1ZBGOYHmX1g69BJ18RD4zYizo223ZU7ezOjOtd6UEhtO+xdWQPIHOmd7ojnmAJeBtHFTUKoGzd7rvNA3i8UQYUksYP8KVQRHZK8m5MIsXvjABImedW75UCAUAIJVmj2fHpZQ6IiPc80SLeuu6CJsEU=";

    const headers = {
      Cookie: `NID_AUT=${NID_AUT}; NID_SES=${NID_SES}`,
    };

    const { data } = await axios.post(url, params, { headers });
    if (data?.data) {
      return res.status(200).send(`https://m.site.naver.com/${data?.data}`);
    }
    return res.status(200).send(link);
  } catch (e) {
    return res.status(200).send("no data");
  }
};

const getKeywords = async (req, res) => {
  try {
    const { keyword } = req.query;
    console.log("keyword: ", keyword);
    const naverItems = [];
    const googleItems = [];
    const totalItems = [];

    const { data: naverResult } = await axios.get(
      `https://ac.search.naver.com/nx/ac?q=${keyword}&con=1&frm=nv&ans=2&r_format=json&r_enc=UTF-8&r_unicode=0&t_koreng=1&run=2&rev=4&q_enc=UTF-8&st=100`
    );

    for (const item of naverResult.items[0]) {
      naverItems.push(item[0]);
      totalItems.push(item[0]);
    }

    const response = await axios({
      method: "get",
      url: `https://www.google.com/complete/search?q=${encodeURIComponent(
        keyword
      )}&cp=2&client=gws-wiz&xssi=t&gs_pcrt=undefined&hl=ko&authuser=0&psi=N9ADZ_zIF73e2roPuMmq6Q4.1728303159789&dpr=1`, // euc-kr 인코딩된 응답을 반환하는 URL
      responseType: "arraybuffer",
    });

    if (response.data) {
      const decodedData = iconv.decode(response.data, "euc-kr");
      const f = JSON.parse(decodedData.toString().replace(")]}'", ""));
      for (const item of f[0]) {
        let a = replaceAll(item[0], "<b>", "");
        a = replaceAll(a, "</b>", "");
        googleItems.push(a);
        totalItems.push(a);
      }
    }

    const uniqueTotalItems = [...new Set(totalItems)];

    return res
      .status(200)
      .send({ naverItems, googleItems, totalItems: uniqueTotalItems });
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};

module.exports = {
  getList,
  doCreateQrUrl,
  getKeywords,
};

const axios = require("axios");
const WPAPI = require("wpapi");
const moment = require("moment");
const crypto = require("crypto");
var request = require("request");
var { google } = require("googleapis");
const { replaceAll } = require("../../utils/util");

const headers = {
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
};

const naverIndexingApi = async (link) => {
  console.log("네이버인덱싱: ", link);
  const res = await axios.get(
    `https://searchadvisor.naver.com/indexnow?url=${link}&key=aec34b39906648a0872fdad9356d4f79`
  );
  return link;
};

/**
 * 여기는 꿈해몽
 */

const getCategoryNumber = (value) => {
  let number = 0;
  if (value === "행동,행위") {
    number = 101;
  } else if (value === "태몽") {
    number = 117;
  } else if (value === "죽음,질병") {
    number = 106;
  } else if (value === "장소") {
    number = 108;
  } else if (value === "자연") {
    number = 111;
  } else if (value === "인물") {
    number = 100;
  } else if (value === "이성") {
    number = 102;
  } else if (value === "음식") {
    number = 107;
  } else if (value === "신체") {
    number = 104;
  } else if (value === "식물") {
    number = 113;
  } else if (value === "배설물,분비물") {
    number = 105;
  } else if (value === "물건") {
    number = 110;
  } else if (value === "로또,복권") {
    number = 118;
  } else if (value === "동물") {
    number = 112;
  } else if (value === "교통수단") {
    number = 115;
  } else if (value === "광물,금속,보석") {
    number = 116;
  } else if (value === "곤충,벌레") {
    number = 114;
  } else if (value === "건물") {
    number = 109;
  } else if (value === "감정,감각") {
    number = 103;
  }
  return number;
};

const removeDuplicateLinks = (arr) => {
  const seenLinks = new Set(); // 중복을 체크하기 위한 Set
  return arr.filter((item) => {
    if (seenLinks.has(item.link)) {
      return false; // 중복된 링크는 제외
    } else {
      seenLinks.add(item.link); // 새로운 링크는 Set에 추가
      return true; // 중복이 아니므로 유지
    }
  });
};

const getRandomElement = (arr) => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

const doTechupboxPost = async (title, content, categories = 61) => {
  const fea = [];
  for (let i = 26328; i <= 26341; i++) {
    fea.push(i);
  }
  fea.push(26457);
  fea.push(26458);
  fea.push(26459);
  fea.push(26460);
  fea.push(26461);
  fea.push(26462);
  fea.push(26464);
  fea.push(26465);
  fea.push(26466);
  fea.push(26467);
  fea.push(26468);
  fea.push(26469);
  fea.push(26470);
  fea.push(26472);

  return new Promise((resolve) => {
    try {
      const wp = new WPAPI({
        endpoint: "https://techupbox.com/wp-json",
        username: process.env.WP_TECHUPBOX_ID || "",
        password: process.env.WP_TECHUPBOX_PW || "",
      });

      wp.posts()
        .create({
          title: title,
          content: content,
          categories: [categories],
          featured_media: getRandomElement(fea),
          status: "publish",
        })
        .then(async (res) => {
          resolve(res.link);
          // await naverIndexingApi(res.link);
          // await googleIndexingApi(res.link);
        });
    } catch (e) {
      resolve("wp err");
    }
  });
};

const getModels = async () => {
  try {
    const { data } = await axios.get(
      "https://api.openai.com/v1/models",
      headers
    );
    return data;
  } catch (e) {
    console.log(e);
  }
};

const getProductKeyword = async (title, topic) => {
  "keyword는 메인주제와 메인설명에 대해 상품과 관련된 키워드를 1개만 작성해줘. 상품과 관련된 키워드가 없는거 같으면 아무 상품 키워드나 1개 추천해줘.";
  try {
    const systemMessage = {
      role: "system",
      content: `keyword는 메인주제와 메인설명에 대해 상품과 관련된 키워드를 1개만 작성해줘. 상품과 관련된 키워드가 없는거 같으면 아무 상품 키워드나 1개 추천해줘.
        결과값 keyword를 string으로 반환해줘`,
    };
    const userMessage = {
      role: "user",
      content: `[질문: 메인주제(${title.trim()})에 대한, 메인설명(${topic})]에 대해서 상품키워드를 추출해줘`,
    };
    console.log(userMessage);
    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [systemMessage, userMessage],
        temperature: 0.95,
      },
      headers
    );

    return data.choices[0].message.content;
  } catch (e) {
    return "";
  }
};

// CHAT GPT API 요청 생성
const generateBlogContent = async (title, topic) => {
  try {
    let productKeyword = await getProductKeyword(title, topic);
    let landingUrl = "";
    productKeyword = replaceAll(productKeyword, '"', "");
    console.log("productKeyword: ", productKeyword);
    if (productKeyword) {
      const coupangItems = await getTop10Data(productKeyword);
      landingUrl = coupangItems?.landingUrl || "";
    }

    const systemMessage = {
      role: "system",
      content: `포스팅의 소제목은 주제 키워드를 가끔씩 포함하고 설명은 1000자 이내로 작성해줘.(필수)
포스팅의 글자수 길이는 공백을 제외하고 5000자 작성을 해야해.(필수)
고유한 단어는 최소 700자 이상 필요해(필수)
표절이 없게끔 작성하는 것이 가장 중요해(필수)
글 내용을 워드프레스에 올릴 수 있게 HTML코드로 변환해서 작성해줘.(필수)
쿠팡파트너스 버튼 링크를 <button class="tech-link"><a href="${landingUrl}" target="_blank">👉 ${productKeyword} 알아보기</a></button> 첫 번째 소제목 h2, p 태그 바로 다음에 작성해줘(필수)
최신 뉴스나 블로그등 웹사이트에서 대한 정보를 제공해주고, 그에 대한 출처 실제 링크도 함께 <button class="tech-link"><a href="링크주소 넣기" target="_blank">👉 자세히 알아보기</a></button>을 두 번째 소제목과 설명 사이에 한 개만 제공해줘(필수)
출처링크 제공할 때 https://example.com 도메인은 추천하지 말아주고 대한민국의 다른 사이트의 링크를 넣어줘.
글 예시는 아래와 같이 해줘, 소제목과 소제목에 대한 설명은 최소 3개 이상 만들어줘.
소제목 (주제에 대한 키워드 일부만 넣기)
소제목에 대한 설명(ul, li 문법과 p문법을 2:1 비율로 혼합해서 작성)
title은 [질문]을 요약해서 만들어줘
content에는 h1 태그를 적지 말아줘(필수)
answer는 content를 기반으로 요약해서 200자 정도로 해주고 말투는 합니다, 했습니다 등의 부드럽고 공손한 텍스트로 작성해줘

결과값 title, content, answer를 json으로 반환해줘`,
    };
    const userMessage = {
      role: "user",
      content: `[질문: 메인주제(${title.trim()})에 대한, 메인설명(${topic})]에 대해서 글을 작성해줘`,
    };

    console.log(userMessage);
    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [systemMessage, userMessage],
        temperature: 0.95,
      },
      headers
    );
    return data;
  } catch (e) {
    console.log(e.response.status, e.response.statusText);
    console.log(e.response.data);
  }
};

/**
 *
 * @param {Indexing API} link
 * @returns
 */

const googleIndexingApi = async (link) => {
  console.log("구글인덱싱: ", link);
  return new Promise((resolve) => {
    const jwtClient = new google.auth.JWT(
      process.env.techtoktok_client_email,
      null,
      process.env.techtoktok_private_key,
      ["https://www.googleapis.com/auth/indexing"],
      null
    );

    jwtClient.authorize(function (err, tokens) {
      if (err) {
        console.log(err);
        return;
      }
      let options = {
        url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
        method: "POST",
        // Your options, which must include the Content-Type and auth headers
        headers: {
          "Content-Type": "application/json",
        },
        auth: { bearer: tokens.access_token },
        // Define contents here. The structure of the content is described in the next step.
        json: {
          url: link,
          type: "URL_UPDATED",
        },
      };
      request(options, function (error, response, body) {
        // Handle the response
        console.log(body);
        resolve(body);
      });
    });
  });
};

const qrCreate = async (title, link, NID_AUT, NID_SES) => {
  try {
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

    const headers = {
      Cookie: `NID_AUT=${NID_AUT}; NID_SES=${NID_SES}`,
    };

    const { data } = await axios.post(url, params, { headers });
    if (data?.data) {
      return `https://m.site.naver.com/${data?.data}`;
    }
    return link;
  } catch (e) {
    return "no data";
  }
};

const getTop10Data = async (keyword) => {
  const DOMAIN = "https://api-gateway.coupang.com";
  const REQUEST_METHOD = "GET";
  const URL = "/v2/providers/affiliate_open_api/apis/openapi/products/search";
  const url = `${URL}?subId=techupbox&limit=3&srpLinkOnly=true&keyword=${encodeURI(
    keyword
  )}`;
  const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
  const SECRET_KEY = process.env.COUPANG_SECRET_KEY;

  const authorization = generateHmac(
    REQUEST_METHOD,
    url,
    SECRET_KEY,
    ACCESS_KEY
  );

  console.log(url);
  console.log(ACCESS_KEY);
  console.log(SECRET_KEY);
  console.log(authorization);
  axios.defaults.baseURL = DOMAIN;
  return new Promise(async (resolve) => {
    try {
      const response = await axios.request({
        method: REQUEST_METHOD,
        url: url,
        headers: { Authorization: authorization },
        // data: REQUEST,
      });

      resolve({
        data: response.data.data.productData,
        landingUrl: response.data.data.landingUrl,
      });
    } catch (err) {
      // console.error(err.response.data);
    }
  });
};

const generateHmac = (method, url, secretKey, accessKey) => {
  const parts = url.split(/\?/);
  const [path, query = ""] = parts;
  const datetime = moment.utc().format("YYMMDD[T]HHmmss[Z]");
  const message = datetime + method + path + query;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("hex");

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
};

module.exports = {
  naverIndexingApi,
  googleIndexingApi,
  generateBlogContent,
  getCategoryNumber,
  getModels,
  doTechupboxPost,
  removeDuplicateLinks,
  qrCreate,
  getTop10Data,
};

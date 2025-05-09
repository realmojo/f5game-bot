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
          status: "publish",
        })
        .then(async (res) => {
          resolve(res.link);
          // await naverIndexingApi(res.link);
          // googleIndexingApi(res.link);
        });
    } catch (e) {
      resolve("wp err");
    }
  });
};

const doKinTechupboxPost = async (title, content, categories = 2) => {
  const fea = [];

  for (let i = 7; i <= 34; i++) {
    fea.push(i);
  }

  return new Promise((resolve) => {
    try {
      const wp = new WPAPI({
        endpoint: "https://kin.techupbox.com/wp-json",
        username: process.env.WP_TECHUPBOX_ID || "",
        password: process.env.WP_TECHUPBOX_PW || "",
      });

      wp.posts()
        .create({
          title: title,
          content: content,
          categories: [categories],
          status: "publish",
        })
        .then(async (res) => {
          resolve(res.link);
          // await naverIndexingApi(res.link);
          // googleIndexingApi(res.link);
        });
    } catch (e) {
      resolve("wp err");
    }
  });
};

// const getProductKeyword = async (title, topic) => {
//   try {
//     const systemMessage = {
//       role: "system",
//       content: `keyword는 메인주제와 메인설명에 대해 상품과 관련된 키워드를 1개만 작성해줘.`,
//     };
//     const userMessage = {
//       role: "user",
//       content: `[질문: 메인주제(${title.trim()})에 대한, 메인설명(${topic})]에 대해서 상품키워드를 추출해줘`,
//     };
//     console.log(userMessage);
//     const { data } = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-4o-mini",
//         messages: [systemMessage, userMessage],
//         temperature: 0.95,
//       },
//       headers
//     );

//     return data.choices[0].message.content;
//   } catch (e) {
//     return "";
//   }
// };

// CHAT GPT API 요청 생성
const generateBlogContent = async (title, topic) => {
  try {
    // let productKeyword = await getProductKeyword(title, topic);
    // let landingUrl = "";
    // let secondKeyword = "";
    // let secondLandingUrl = "";
    // let thirdKeyword = "";
    // let thirdLandingUrl = "";
    // productKeyword = replaceAll(productKeyword, '"', "");
    // console.log("productKeyword: ", productKeyword);
    // if (productKeyword) {
    //   const coupangItems = await getTop10Data(productKeyword);
    //   console.log(coupangItems);
    //   landingUrl = coupangItems?.landingUrl || "";

    //   secondKeyword = coupangItems?.data[0]?.productName || "";
    //   secondLandingUrl = coupangItems?.data[0]?.productUrl || "";
    //   thirdKeyword = coupangItems?.data[1]?.productName
    //     ? coupangItems?.data[1]?.productName
    //     : coupangItems?.data[0]?.productName;
    //   thirdLandingUrl = coupangItems?.data[1]?.productUrl
    //     ? coupangItems?.data[1]?.productUrl
    //     : coupangItems?.data[0]?.productUrl;
    // }

    const systemMessage = {
      role: "system",
      //       content: `글 내용을 워드프레스에 올릴 수 있게 HTML코드로 변환해서 작성해줘.(필수)
      // 첫 번째 소제목에는 쿠팡파트너스 버튼 링크를 <a href="${landingUrl}" target="_blank"><button class="tech-link">👉 ${productKeyword} 알아보기</button></a> 첫 번째 소제목 h2, p 태그 바로 다음에 작성해줘(필수)
      // 두 번째 소제목에는 쿠팡파트너스 버튼 링크를 <a href="${secondLandingUrl}" target="_blank"><button class="tech-link">👉 ${secondKeyword} 알아보기</button></a> 두 번째 소제목 h2, p 태그 바로 다음에 작성해줘(필수)
      // 세 번째 소제목에는 쿠팡파트너스 버튼 링크를 <a href="${thirdLandingUrl}" target="_blank"><button class="tech-link">👉 ${thirdKeyword} 알아보기</button></a> 세 번째 소제목 h2, p 태그 바로 다음에 작성해줘(필수)
      // 글 예시는 아래와 같이 해줘, 소제목과 소제목에 대한 설명은 5개 만들어줘.
      // 소제목 (h2 태그 주제에 대한 키워드 일부만 넣기)
      // 쿠팡파트너스 링크
      // 소제목에 대한 설명
      // title은 [질문]을 요약해서 만들어줘
      // content에는 h1 태그를 적지 말아줘(필수)
      // answer는 content를 기반으로 요약해서 400자 정도로 해주고 말투는 합니다, 했습니다 등의 부드럽고 공손한 텍스트로 작성해줘

      // 결과값 title, content, answer를 json으로 반환해줘(필수)`,
      //       content: `글 내용을 워드프레스에 올릴 수 있게 HTML코드로 변환해서 작성해줘.(필수)
      // content는 html 코드로 내용을 최대한 길게 작성해줘(필수)
      // answer는 내용을 기반으로 요약해서 1000자 정도로 해주고 말투는 합니다, 했습니다 등의 부드럽고 공손한 텍스트로 작성해줘(필수)
      // 결과값 title, content, answer를 json으로 반환해줘(필수)`,
      content: `You are ChatGPT, a large language model trained by OpenAI.
                Follow these specific instructions:
                1. 응답은 한글 4000자 이상 작성이 필요합니다.
                2. 여러 토픽에 대해 고유한 의견을 제공하며, 중복 답변을 피합니다.
                3. 영어 문서를 찾아 한글로 번역한 후 작성합니다.
                4. 구글SEO, 네이버SEO에 최적화된 글을 작성합니다.
                5. content에 대제목<h1>을 포함하지 않습니다.
                6. 글의 소제목<h2>은 주제 키워드를 포함하고, 1000자 이내로 설명합니다.
                7. 글의 총 길이는 공백 제외 4000자 내외로 작성합니다.
                8. 표절이 없도록 작성하고, 사람이 쓴 것처럼 자연스럽게 작성합니다.
                9. 글의 중간에 적절한 이모티콘을 사용합니다.
title은 제목과 내용을 토대로 작성해줘
content는 html 코드로 내용을 최대한 길게 작성해줘(필수)
answer는 내용을 기반으로 요약해서 2000자 정도로 해주고 이모지콘도 적당히 넣어주고 말투는 해요, 합니다, 했습니다 등의 부드럽고 공손한 텍스트로 작성해줘(필수)
결과값 title, content, answer를 json으로 반환해줘(필수)`,
    };
    const userMessage = {
      role: "user",
      content: `[${title.trim()}, ${topic}]에 대한 해결책을 작성해줘`,
    };

    console.log(userMessage);
    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [systemMessage, userMessage],
        temperature: 0.95,
        max_tokens: 10000,
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
  const url = `${URL}?subId=techupbox&limit=3&keyword=${encodeURI(keyword)}`;
  const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
  const SECRET_KEY = process.env.COUPANG_SECRET_KEY;

  const authorization = generateHmac(
    REQUEST_METHOD,
    url,
    SECRET_KEY,
    ACCESS_KEY
  );

  console.log(url);
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

const insertBreaksAtSecondPeriod = (text) => {
  // 마침표와 공백을 기준으로 split
  let parts = text.split(". ");

  // 만약 두 번째 부분이 존재하면
  if (parts.length > 2) {
    // 두 번째 마침표 이후에 <br /><br /> 추가
    return (
      parts.slice(0, 2).join(". ") + "<br /><br />" + parts.slice(2).join(". ")
    );
  }

  // 만약 두 번째 마침표가 없으면 원래 텍스트 반환
  return text;
};

module.exports = {
  naverIndexingApi,
  googleIndexingApi,
  generateBlogContent,
  getCategoryNumber,
  doTechupboxPost,
  doKinTechupboxPost,
  removeDuplicateLinks,
  qrCreate,
  getTop10Data,
  insertBreaksAtSecondPeriod,
};

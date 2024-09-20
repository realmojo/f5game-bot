const axios = require("axios");
const WPAPI = require("wpapi");
var request = require("request");
var { google } = require("googleapis");

const headers = {
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
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
  // const fea = [76, 79, 88, 104, 107, 109, 122, 124, 146, 152];
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
          // featured_media: getRandomElement(fea),
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

// CHAT GPT API 요청 생성
const generateBlogContent = async (topic) => {
  try {
    const systemMessage = {
      role: "system",
      content: `글을 만들 때 영어(English)로 문서를 찾고 한글(Korean)로 번역해서 작성해줘.(필수)
글의 소제목은 주제 키워드를 가끔씩 포함하고 설명은 1000자 이내로 작성해줘.(필수)
글의 총 길이는 공백을 제외하고 3000자 정도 작성을 해야해.(필수)
고유한 단어는 700자 이상 필요해(필수)
표절이 없게끔 작성하는 것이 가장 중요해(필수)
글 내용을 워드프레스에 올릴 수 있게 HTML코드로 변환해서 작성해줘.(필수)

글 예시는 아래와 같이 해줘, 소제목과 소제목에 대한 설명은 최소 3개 이상 만들어줘.
소제목 (주제에 대한 키워드 일부만 넣기)
소제목에 대한 설명(li 문법과 p문법을 적당히 혼용해서 작성)
title은 [질문]을 요약해서 만들어줘
content에는 h1 태그를 적지 말아줘(필수)
answer는 content를 기반으로 요약해서 200자 정도 텍스트로 작성해줘

결과값 title, content, answer를 json으로 반환해줘`,
    };
    const userMessage = {
      role: "user",
      content: `[질문: ${topic}]에 대해서 글을 작성해줘`,
    };

    console.log(userMessage);
    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [systemMessage, userMessage],
        temperature: 0.8,
        top_p: 0.9,
      },
      headers
    );
    console.log(data);
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
module.exports = {
  naverIndexingApi,
  googleIndexingApi,
  generateBlogContent,
  getCategoryNumber,
  getModels,
  doTechupboxPost,
  removeDuplicateLinks,
};

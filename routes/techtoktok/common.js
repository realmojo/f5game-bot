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

const doTechtoktokPost = async (title, content) => {
  const wp = new WPAPI({
    endpoint: "https://techtoktok.com/wp-json",
    username: process.env.WP_TECHTOKTOK_ID || "",
    password: process.env.WP_TECHTOKTOK_PW || "",
  });

  wp.posts()
    .create({
      title: title,
      content: content,
      categories: [128],
      status: "publish",
    })
    .then(async (res) => {
      // await naverIndexingApi(res.link);
      // await googleIndexingApi(res.link);
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
    const userMessage = {
      role: "user",
      content: `[[주제:${topic}]]글을 SEO맞게 작성해줘. 전체 글은 4000자 정도로 작성해줘. 형식은 마크다운 형식을 사용해줘. 대제목에는 주제 키워드를 넣고 창의적으로 작성해주고 소제목에는 주제에 관련된 키워드를 포함해서 4개를 만들어주고 각각 상세한 설명은 1000자 내외 최대한 창의적으로 작성해줘. 마무리도 직접 작성해서 상세히 설명해줘.`,
    };

    console.log(`주제 [${topic}]에 대해서 작성합니다..`);
    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [userMessage],
        temperature: 0.6,
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
  doTechtoktokPost,
  removeDuplicateLinks,
};

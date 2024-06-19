const axios = require("axios");
const fs = require("fs");
const WPAPI = require("wpapi");
const drugInfo = require("./drug.json");
const drugLists = require("./drugArr.json");
var request = require("request");
var { google } = require("googleapis");
// var key = require("./wpServiceAccount.json");

const cron = require("node-cron");

// utc 시간 적용 +9 -> 24시 === 새벽 0시
cron.schedule("*/15 * * * *", async () => {
  try {
    const { data } = await axios.get(
      `https://api.mindpang.com/api/drug/item.php`
    );
    if (data.lastId) {
      const previousIndex = drugLists.findIndex(
        (item) => item.code === data.lastId
      );
      const nextCode = drugLists[previousIndex + 1].code;
      await doPost(nextCode);
      await axios.get(
        `https://api.mindpang.com/api/drug/add.php?lastId=${nextCode}`
      );
    }
  } catch (e) {
    console.log(e);
  }
});

const intro = [
  "현대인의 건강 관리에 필수적인 약학정보, 이번 포스팅에서는 올바른 약물 복용법과 주의사항에 대해 자세히 알아보겠습니다. 올바른 약물 사용은 질병 예방과 치료의 핵심입니다.",
  "약물의 효능과 부작용에 대한 정확한 정보를 제공하여 건강을 지키는 첫걸음을 내딛어보세요. 이번 포스팅에서는 약학정보의 중요성과 안전한 약물 사용법을 다룹니다.",
  "다양한 의약품의 특성과 사용법을 이해하고 안전하게 복용하는 방법에 대해 알아보겠습니다. 정확한 정보는 건강 관리의 핵심이며, 이를 통해 부작용을 최소화할 수 있습니다.",
  "약물 복용 시 주의해야 할 사항과 올바른 보관 방법에 대해 알아보는 시간을 가져보세요. 건강을 지키기 위한 필수 정보를 제공하며, 이를 통해 약물의 효과를 극대화할 수 있습니다.",
  "복잡한 약학 정보를 쉽게 이해할 수 있도록 도와드리겠습니다. 이번 포스팅을 통해 약물 복용에 대한 모든 궁금증을 해결하고 건강한 생활을 유지하세요.",
  "약물의 올바른 사용법과 부작용 대처 방법을 통해 건강을 지키는 방법을 소개합니다. 안전한 약물 사용은 건강 관리의 기본이며, 이를 통해 삶의 질을 향상시킬 수 있습니다.",
  "전문 의약품과 일반 의약품의 차이점과 올바른 사용법에 대해 알아보겠습니다. 약물의 특성을 이해하고 적절하게 사용하는 것은 매우 중요합니다.",
  "약물 상호작용에 대한 이해와 안전한 약물 복용법을 소개합니다. 올바른 정보는 건강한 삶의 필수 요소이며, 이를 통해 예상치 못한 문제를 예방할 수 있습니다.",
  "다양한 약물의 효능과 부작용을 상세히 살펴보는 시간을 가져보세요. 정확한 정보는 건강 관리의 첫걸음이며, 이를 통해 약물의 효과를 극대화할 수 있습니다.",
  "건강한 생활을 위한 필수 정보, 약학정보에 대해 알아보겠습니다. 올바른 약물 사용은 건강한 삶의 시작이며, 이를 통해 질병을 예방하고 관리할 수 있습니다.",
  "약물의 정확한 복용법과 주의사항을 통해 건강을 지키는 방법을 소개합니다. 이번 포스팅에서 필요한 모든 정보를 확인하고 건강한 생활을 유지하세요.",
  "의약품 사용 시 주의해야 할 점과 부작용에 대한 정보를 제공하겠습니다. 건강한 약물 사용을 위한 필수 정보를 담고 있으며, 이를 통해 부작용을 최소화할 수 있습니다.",
  "건강한 약물 사용을 위한 필수 정보, 약학정보의 중요성을 알아보세요. 안전한 복용은 건강의 기본이며, 이를 통해 삶의 질을 향상시킬 수 있습니다.",
  "올바른 약물 복용법과 주의사항을 통해 건강을 지키는 방법을 소개합니다. 이번 포스팅에서 모든 정보를 확인하고 안전한 약물 사용을 실천하세요.",
  "약물의 효능과 부작용에 대한 정보를 통해 안전한 복용법을 알아보세요. 건강한 삶을 위한 필수 정보를 제공하며, 이를 통해 질병을 효과적으로 관리할 수 있습니다.",
  "다양한 약물의 사용법과 주의사항을 상세히 살펴보겠습니다. 올바른 약물 사용은 건강 관리의 핵심이며, 이를 통해 부작용을 최소화할 수 있습니다.",
  "건강한 약물 사용을 위한 기본 정보와 주의사항을 알아보세요. 정확한 정보는 건강을 지키는 첫걸음이며, 이를 통해 약물의 효과를 극대화할 수 있습니다.",
  "약물 복용 시 주의해야 할 사항과 올바른 보관 방법을 소개합니다. 건강을 지키기 위한 필수 정보를 제공하며, 이를 통해 약물의 효과를 극대화할 수 있습니다.",
  "약학정보를 통해 다양한 의약품의 효능과 부작용을 이해해보세요. 올바른 복용법은 건강한 삶의 시작이며, 이를 통해 질병을 예방하고 관리할 수 있습니다.",
  "건강을 지키기 위한 필수 정보, 약물의 올바른 사용법과 주의사항을 알아보세요. 이번 포스팅에서 모든 궁금증을 해결하고 건강한 생활을 유지하세요.",
];

const getRandomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const getData = async (code) => {
  return new Promise((resolve) => {
    axios
      .get(
        `https://www.health.kr/searchDrug/ajax/ajax_result_drug2.asp?drug_cd=${code}`
      )
      .then((res) => {
        resolve(res.data[0]);
      });
  });
};

const numberReplace = (item) => {
  item = item.replace(`-`, "");
  for (let i = 0; i < 100; i++) {
    item = item.replace(`${i}. `, "");
  }

  return item;
};

const getEffect = (item) => {
  const dd = item.split("brbr");
  let html = ``;

  for (const d of dd) {
    if (d) {
      html += `<li>${numberReplace(d)}</li>`;
    }
  }
  return html;
};
const getMediguide = (item) => {
  const dd = item.split("brbr");
  let html = ``;

  for (const d of dd) {
    if (d) {
      html += `<li>${numberReplace(d)}</li>`;
    }
  }
  return html;
};
const getCaution = (t) => {
  const d = t.split("\r\n");
  const f = d.map((item) => {
    item = item.replace("<P></P>", "");
    return item;
  });
  const g = f.map((item) => {
    for (let i = 0; i < 50; i++) {
      if (item.indexOf(`${i}. `) !== -1) {
        // console.log(item);
      } else {
        item = item.replace(`(${i})`, "-");
        item = item.replace(`${i})`, "-");
      }
    }
    return item;
  });
  const a = [];
  let b = [];
  let title = "";
  let description = [];
  for (const gd of g) {
    if (gd.indexOf("-") !== -1 || isNaN(Number(gd[0]))) {
      description.push(gd.replace("-", "").trim());
    } else {
      // console.log("title: ", gd);
      if (title && description.length > 0 && gd.indexOf("-") === -1) {
        a.push({
          title,
          description,
        });
        title = "";
        description = [];
      }
      title = gd;
    }
  }

  let html = "";
  for (const xx of a) {
    html += '<h3 class="wp-block-heading">';
    html += `${xx.title}`;
    html += "</h3>";
    html += "<ul>";
    for (const list of xx.description) {
      if (list) {
        html += `<li>${list}</li>`;
      }
    }
    html += "</ul>";
  }
  return html;
};
const getDosage = (item) => {
  const dd = item.split("brbr");
  let html = ``;

  for (const d of dd) {
    const f = d.replace("<P></P>", "");
    html += `${f}`;
  }
  return html;
};

const getHtml = (item) => {
  let ss = item.drug_pic !== undefined ? item.drug_pic.split("|") : "";
  let drug_pic = ss.length === 2 ? ss[1] : "";
  const drugItem = drugInfo[item.drug_code];

  let html = `
<p>${intro[getRandomInRange(0, 19)]}</p>
<div class="wp-block-buttons is-content-justification-center is-layout-flex wp-container-core-buttons-is-layout-1 wp-block-buttons-is-layout-flex" style="margin-bottom: 20px;">
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://www.health.kr/searchDrug/result_drug.asp?drug_cd=${
    item.drug_code
  }">${item.drug_name} 상세보기 👉</a></div>
</div>
<figure class="wp-block-image size-large"><img decoding="async" src="${drug_pic}" alt="${
    item.drug_name
  }"></figure>

<h2 class="wp-block-heading">${item.drug_name} 기본 정보</h2>

<figure class="wp-block-table"><table><tbody><tr><td>약 명칭</td><td>${
    item.drug_name || ""
  }</td></tr><tr><td>영어 명칭</td><td>${
    item.drug_enm || ""
  }</td></tr><tr><td>성분/함량</td><td>${
    item.list_sunb_name || ""
  }</td></tr><tr><td>첨가제</td><td>${
    item.additives || ""
  }</td></tr><tr><td>제형</td><td>${item.drug_form || ""} / ${
    drugItem.type || ""
  }</td></tr><tr><td>가로</td><td>${
    drugItem.width || ""
  }</td></tr><tr><td>세로</td><td>${
    drugItem.height || ""
  }</td></tr><tr><td>두께</td><td>${
    drugItem.thick || ""
  }</td></tr><tr><td>성상</td><td>${
    item.charact_new || ""
  }</td></tr><tr><td>식약처 분류</td><td>${item.cls_code || ""}/ ${
    item.cls_code_num || ""
  }</td></tr><tr><td>보관방법</td><td>${
    item.stmt || ""
  }</td></tr></tbody></table></figure>

<h2 class="wp-block-heading">${item.drug_name} 효능 효과 정보</h2>
<p>${item.medititle}</p>
<ul>
${getEffect(item.effect)}
</ul>

<h2 class="wp-block-heading">${item.drug_name} 주의사항</h2>
  ${getCaution(item.caution)}
<h2 class="wp-block-heading">${item.drug_name} 용법 용량</h2>
<p>
${getDosage(item.dosage)}
</p>
<h2 class="wp-block-heading">${item.drug_name} 복약정보</h2>
<ul>
${getMediguide(item.mediguide)}
</ul>
<p>효능 효과 부작용에 대해서 상세하게 알아보았습니다. 상세하게 알려드리다보니 길이가 좀 길어졌네요. 하지만 약을 제대로 알지 못하고 드시는 경우에는 심각한 부작용이 있을 수도 있으니 꼭 주의하시고 드셔야 합니다. 약을 드시면서 몸에 조금이라도 이상이 있는거 같다 싶으면 약을 중단하시고 바로 병원에 가셔야 합니다.</p>
<p>긴 글 읽어주셔서 감사하고 다음번엔 더 좋은 내용으로 찾아뵙도록 하겠습니다</p>
<!-- CONTENT END 3 -->`;
  return html;
};

const sleep = (ms) => {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
};

const googleIndexingApi = async (link) => {
  return new Promise((resolve) => {
    const jwtClient = new google.auth.JWT(
      process.env.client_email,
      null,
      process.env.private_key,
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
        resolve("ok");
      });
    });
  });
};

const naverIndexingApi = async (link) => {
  const res = await axios.get(
    `https://searchadvisor.naver.com/indexnow?url=${link}&key=d1a17bfe470a410085399775403f1f55`
  );
  console.log(res);
};

const post = (title, html) => {
  return new Promise((resolve) => {
    const wp = new WPAPI({
      endpoint: "https://techupbox.com/wp-json",
      username: process.env.WP_TECHUPBOX_ID || "",
      password: process.env.WP_TECHUPBOX_PW || "",
    });

    wp.posts()
      .create({
        title: title,
        content: html,
        categories: [48],
        tags: [49, 50, 51],
        // featured_media: 999,
        status: "publish",
      })
      .then(function (res) {
        resolve(res.link);
      });
  });
};

const doPost = async (code) => {
  const item = await getData(code);
  if (item) {
    const html = await getHtml(item);

    console.log(item);
    console.log(html);
    const link = await post(
      `${item.drug_name} 효능 효과 부작용 용법에 대해 알아보세요`,
      html
    );

    await naverIndexingApi(link);
    await googleIndexingApi(link);

    console.log(link);
  }

  // console.log(link);
  // const min = getRandomInRange(10, 15);
  // console.log(`잠시 ${min}분 기다립니다.`);
  // sleep(1000 * 60 * min);
  return "ok";
};

const getList = async (req, res) => {
  res.status(200).send("ok");
};

module.exports = {
  getList,
};

const axios = require("axios");
const cheerio = require("cheerio");
const WPAPI = require("wpapi");
const moment = require("moment");
const cron = require("node-cron");
const marked = require("marked");
const dreams = require("./dream.json");
const {
  naverIndexingApi,
  googleIndexingApi,
  generateBlogContent,
  getCategoryNumber,
  getModels,
} = require("./common");
const {
  doTheqooPost,
  doBobaedreamPost,
  doNatepannPost,
  doTeamblindPost,
  doDdanziPost,
  doInstizPost,
  getLinks,
} = require("./community");
const { delay } = require("../../utils/util");

// utc 시간 적용 +9 -> 24시 === 새벽 0시
cron.schedule("2 15 * * *", async () => {
  await axios.get("https://f5game-bot.vercel.app/techtoktok/doPostFortune");
  console.log("good~");
});

// utc 시간 적용 +9 -> 24시 === 새벽 0시
cron.schedule("0 */3 * * *", async () => {
  try {
    const links = await getLinks();

    for (const link of links) {
      if (link.type === "theqoo") {
        doTheqooPost(link);
      } else if (link.type === "bobaedream") {
        doBobaedreamPost(link);
      } else if (link.type === "natepann") {
        doNatepannPost(link);
      } else if (link.type === "teamblind") {
        doTeamblindPost(link);
      } else if (link.type === "ddanzi") {
        doDdanziPost(link);
      } else if (link.type === "instiz") {
        doInstizPost(link);
      }
      console.log(`${link.type}: ${link.link} 포스팅 완료.`);
      await delay(10000);
    }
    console.log("good~");
  } catch (e) {
    console.log(e);
  }
});

//
// cron.schedule("*/8 * * * *", async () => {
// try {
//   const { data: autoItem } = await axios.get(
//     "https://api.mindpang.com/api/autopost/item.php"
//   );
//   if (autoItem.dream === "on") {
//     const { data } = await axios.get(
//       `https://api.mindpang.com/api/dream/item.php`
//     );
//     if (data.lastId) {
//       const nextIndex = Number(data.lastId) + 1;
//       const result = await postDream(nextIndex);
//       if (result.link) {
//         console.log("다음글 해몽 번호를 DB에 입력합니다.");
//         await axios.get(
//           `https://api.mindpang.com/api/dream/add.php?lastId=${nextIndex}`
//         );
//       }
//     }
//   } else {
//     console.log("Dream 오토모드가 까져있습니다..");
//   }
// } catch (e) {
//   console.log(e);
//   return res.status(200).send(e);
// }
// });

const sleep = (ms) => {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
};

/**
 *
 * @param {운세 자동 봇} req
 * @param {*} res
 * @returns
 */

const postApiFortune = async (req, res) => {
  try {
    const zodiacs = [
      "쥐",
      "소",
      "호랑이",
      "토끼",
      "용",
      "뱀",
      "말",
      "양",
      "원숭이",
      "닭",
      "개",
      "돼지",
    ];
    const d = [];
    const regex = /[^0-9]/g;

    for (const item of zodiacs) {
      const url = `https://search.naver.com/search.naver?where=nexearch&sm=tab_etc&qvt=0&query=${encodeURIComponent(
        `${item}띠 운세`
      )}`;
      console.log(url);
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const todayText = $(
        "#yearFortune > .infors > ._resultPanel:eq(0) > .detail > p"
      )
        .text()
        .trim();
      const yearArr = $(
        "#yearFortune > .infors > ._resultPanel:eq(0) > ._cs_fortune_list > div"
      );
      const f = [];
      for (const year of yearArr) {
        const y = $(year).find("dt").text();
        const y2 = y.replace(regex, "");
        f.push({
          year: Number(y2) > 45 ? `19${y2}년생` : `20${y2}년생`,
          description: $(year).find("dd").text(),
        });
      }
      d.push({
        name: item,
        todayText: todayText,
        yearArr: f,
      });
      sleep(1000);
    }

    await postFortune(d);
    return res.status(200).send(d);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

const getFotrtuneContent = (item) => {
  let table = '<figure class="wp-block-table"><table><tbody>';

  for (const f of item.yearArr) {
    table += `<tr><td>${f.year}</td><td>${f.description}</td></tr>`;
  }

  table += "</tbody></table></figure>";

  return `<h2 class="wp-block-heading"><span class="ez-toc-section" id="${encodeURIComponent(
    item.name
  )}" ez-toc-data-id="#${item.name}"></span>${
    item.name
  }<span class="ez-toc-section-end"></span></h2>
  <p>${item.todayText}</p>
  ${table}`;
};

const getFortuneHtml = (items) => {
  let contents = "";
  let image = `<figure class="wp-block-image size-large"><img fetchpriority="high" decoding="async" width="1024" height="585" src="https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-1024x585.webp" alt="" class="wp-image-999" srcset="https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-1024x585.webp 1024w, https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-300x171.webp 300w, https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-768x439.webp 768w, https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-1536x878.webp 1536w, https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim.webp 1792w" sizes="(max-width: 1024px) 100vw, 1024px"></figure>`;

  for (const item of items) {
    contents += getFotrtuneContent(item);
  }

  return `${image}${contents}`;
};

const postFortune = (items) => {
  const wp = new WPAPI({
    endpoint: "https://techtoktok.com/wp-json",
    username: process.env.WP_TECHTOKTOK_ID || "",
    password: process.env.WP_TECHTOKTOK_PW || "",
  });

  let d = moment().add(1, "days").format("YYYY-MM-DD");
  const [year, month, day] = d.split("-");

  wp.posts()
    .create({
      title: `[오늘의 운세] ${year}년 ${month}월 ${day}일 띠별 운세`,
      content: getFortuneHtml(items),
      categories: [70],
      tags: [73],
      featured_media: 999,
      status: "publish",
    })
    .then(async (res) => {
      await naverIndexingApi(res.link);
      // await googleIndexingApi(res.link);
    });
};

const postWpDream = (title, html, categories, tags = [119, 124, 126, 127]) => {
  // 꿈, 꿈해몽, 길몽, 흉몽
  return new Promise((resolve) => {
    const wp = new WPAPI({
      endpoint: "https://techtoktok.com/wp-json",
      username: process.env.WP_TECHTOKTOK_ID || "",
      password: process.env.WP_TECHTOKTOK_PW || "",
    });

    wp.posts()
      .create({
        title: title,
        content: html,
        categories: categories,
        tags: tags,
        featured_media: 1108,
        status: "publish",
      })
      .then(function (res) {
        resolve(res);
      });
  });
};

const postDream = async (nextIndex) => {
  try {
    const item = dreams[nextIndex];

    const data = await generateBlogContent(item.title);
    console.log("res data", data);
    const result = data.choices[0].message.content;
    console.log(result);
    let html = marked.parse(result).split("\n");
    let findH1Index = -1;
    findH1Index = html.findIndex((htmlItem) => htmlItem.indexOf("<h1>") !== -1);
    let title = "";
    let feat = "";
    if (findH1Index !== -1) {
      html[findH1Index] = html[findH1Index].replace("<h1>", "");
      html[findH1Index] = html[findH1Index].replace("</h1>", "");
      if (item.final_category) {
        feat = `(${item.final_category})`;
      } else if (item.sub_category) {
        feat = `(${item.sub_category})`;
      } else {
        feat = `(${item.category})`;
      }
      const sTitle = html[findH1Index].split(":");
      html[findH1Index] =
        sTitle.length === 2 ? sTitle[0].trim() : html[findH1Index].trim();
      title = `${html[findH1Index]}${feat}`;
    }
    html.shift();
    const reHtml = html.map((htmlItem) => {
      if (htmlItem.indexOf("<h2>") !== -1) {
        return htmlItem.replace("<h2>", '<h2 class="wp-block-heading">');
      } else if (htmlItem.indexOf("SEO에 맞게") !== -1) {
        return htmlItem.replace("SEO에 맞게 ", "");
      } else if (htmlItem.indexOf("SEO에") !== -1) {
        return htmlItem.replace("SEO에 ", "");
      } else if (htmlItem.indexOf("SEO") !== -1) {
        return htmlItem.replace("SEO", "");
      } else {
        return htmlItem;
      }
    });
    reHtml.unshift(`<p>${item.description}</p>`);
    const newHtml = reHtml.join("");
    console.log(reHtml);
    console.log(title, getCategoryNumber(item.category));
    const { id: postId, link } = await postWpDream(
      title,
      newHtml,
      getCategoryNumber(item.category)
    );
    const naverApi = await naverIndexingApi(link);
    // const googleApi = await googleIndexingApi(link);

    console.log("히스토리 작성을 합니다.");
    const params = {
      id: nextIndex,
      postId: postId,
      title: item.title,
      category: item.category,
    };
    console.log(params);
    await axios.post(
      `https://api.mindpang.com/api/dream/addHistory.php`,
      params
    );
    return {
      link,
      // googleApi,
      naverApi,
    };
  } catch (e) {
    console.log(e);
  }
};

const postApiDream = async (req, res) => {
  try {
    console.log("해몽을 작성합니다.");
    const { data } = await axios.get(
      `https://api.mindpang.com/api/dream/item.php`
    );
    console.log("data:", data);
    if (data.lastId) {
      const nextIndex = Number(data.lastId) + 1;
      const result = await postDream(nextIndex);

      if (result.link) {
        console.log("다음글 해몽 번호를 DB에 입력합니다.");
        await axios.get(
          `https://api.mindpang.com/api/dream/add.php?lastId=${nextIndex}`
        );
      }

      return res.status(200).send(result);
    }
  } catch (e) {
    console.log(e);
    return res.status(200).send(e);
  }
};

const getModelList = async (req, res) => {
  try {
    const data = await getModels();
    res.status(200).send(data);
  } catch (e) {
    console.log(e);
  }
};

const getApiTest = async (req, res) => {
  try {
    const { data } = await axios.get(
      `https://api.mindpang.com/api/dream/item.php`
    );
    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "err", message: e.message });
  }
};

const getCrawl = async (req, res) => {
  try {
    const links = await getLinks();

    for (const link of links) {
      if (link.type === "theqoo") {
        doTheqooPost(link);
      } else if (link.type === "bobaedream") {
        doBobaedreamPost(link);
      } else if (link.type === "natepann") {
        doNatepannPost(link);
      } else if (link.type === "teamblind") {
        doTeamblindPost(link);
      } else if (link.type === "ddanzi") {
        doDdanziPost(link);
      } else if (link.type === "instiz") {
        doInstizPost(link);
      }
      console.log(`${link.type}: ${link.link} 포스팅 완료.`);
      await delay(10000);
    }
    return res.status(200).send("ok");
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "err" });
  }
};

module.exports = {
  postFortune,
  postApiFortune,
  postDream,
  postApiDream,
  getModelList,
  getApiTest,
  getCrawl,
};

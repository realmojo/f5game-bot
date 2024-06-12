const axios = require("axios");
const cheerio = require("cheerio");
const WPAPI = require("wpapi");
const moment = require("moment");
const cron = require("node-cron");

// utc 시간 적용 +9 -> 24시 === 새벽 0시
cron.schedule("2 15 * * *", async () => {
  await axios.get("https://f5game-bot.herokuapp.com/techtoktok/fortune");
  console.log("good~");
});

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

const sleep = (ms) => {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
};
const getFortune = async (req, res) => {
  try {
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

const getContent = (item) => {
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

const getHtml = (items) => {
  let contents = "";
  let image = `<figure class="wp-block-image size-large"><img fetchpriority="high" decoding="async" width="1024" height="585" src="https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-1024x585.webp" alt="" class="wp-image-999" srcset="https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-1024x585.webp 1024w, https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-300x171.webp 300w, https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-768x439.webp 768w, https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim-1536x878.webp 1536w, https://techtoktok.com/wp-content/uploads/2024/06/DALL·E-2024-06-11-21.03.44-A-vibrant-and-detailed-image-showcasing-the-12-zodiac-signs.-Each-sign-should-be-represented-by-its-traditional-symbol-and-positioned-in-a-circle-sim.webp 1792w" sizes="(max-width: 1024px) 100vw, 1024px"></figure>`;

  for (const item of items) {
    contents += getContent(item);
  }

  return `${image}${contents}`;
};

const postFortune = (items) => {
  const wp = new WPAPI({
    endpoint: "https://techtoktok.com/wp-json",
    username: process.env.WP_ID || "",
    password: process.env.WP_PW || "",
  });

  let d = moment().add(1, "days").format("YYYY-MM-DD");
  const [year, month, day] = d.split("-");

  wp.posts()
    .create({
      title: `[오늘의 운세] ${year}년 ${month}월 ${day}일 띠별 운세`,
      content: getHtml(items),
      categories: [70],
      tags: [73],
      featured_media: 999,
      status: "publish",
    })
    .then(function (res) {
      console.log(res);
    });
};

module.exports = {
  getFortune,
  postFortune,
};

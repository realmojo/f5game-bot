const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");
const path = require("path");

const { doTechtoktokPost, removeDuplicateLinks } = require("../common");
const {
  delay,
  uploadImageToS3,
  replaceAll,
  shuffle,
} = require("../../../utils/util");
const axiosRetry = require("axios-retry").default;

// axios-retry 설정
axiosRetry(axios, {
  retries: 3, // 최대 재시도 횟수
  retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return retryCount * 1000; // 재시도 간격 (1초, 2초, 3초)
  },
  retryCondition: (error) => {
    console.log("err", error);
    // 기본 조건 외에 추가적인 조건을 설정할 수 있습니다.
    // return error.response && error.response.status >= 500; // 500 이상 서버 오류일 경우에만 재시도
    return true; // 500 이상 서버 오류일 경우에만 재시도
  },
});

const getTheqooLinks = async () => {
  try {
    console.log("더쿠 링크를 가져옵니다.");
    const { data: r } = await axios.get("https://theqoo.net/hot");
    const $ = cheerio.load(r);

    const links = [];
    $(".theqoo_board_table tbody tr:not(.notice):not(.notice_expand)").each(
      function () {
        const d = $(this).find(".title a:eq(0)");
        let href = d.attr("href");
        if (href.indexOf("#") === -1 && href.indexOf("hot") !== -1) {
          links.push({
            type: "theqoo",
            link: `https://theqoo.net${href}`,
            title: d.text().trim(),
          });
        }
      }
    );

    return links;
  } catch (e) {
    return [];
  }
};

const doTheqooPost = async (item) => {
  try {
    const { data: lists } = await axios.get(item.link);
    const $ = cheerio.load(lists);

    let article = $('article[itemprop="articleBody"]');
    const imgs = article.find("img");
    const pathname = `images/${moment().format("YYYY-MM-DD")}`;
    for (let img of imgs) {
      let imgSrc = $(img).attr("src");

      const fileName = `${pathname}/${path.basename(imgSrc)}`;
      const imageUrl = await uploadImageToS3(imgSrc, "techtoktok", fileName);
      $(img).attr("src", imageUrl);
    }

    let title = item.title;
    let content = article.html();
    let wpLink = await doTechtoktokPost(title, content);

    return wpLink;
  } catch (e) {
    console.log("err: ", e);
    return "err";
  }
};

const getBobaedreamLinks = async () => {
  try {
    console.log("보배드림 링크를 가져옵니다.");
    const { data: r } = await axios.get(
      "https://www.bobaedream.co.kr/list?code=best"
    );
    const $ = cheerio.load(r);

    const links = [];
    $("#boardlist tbody tr td .bsubject").each(function () {
      const href = $(this).attr("href");
      links.push({
        type: "bobaedream",
        link: `https://www.bobaedream.co.kr${href}`,
        title: $(this).text().trim(),
      });
    });
    return links;
  } catch (e) {
    return [];
  }
};

const doBobaedreamPost = async (item) => {
  try {
    const { data: lists } = await axios.get(item.link);
    const $ = cheerio.load(lists);

    let article = $('div[itemprop="articleBody"]');
    const imgs = article.find("img");
    const pathname = `images/${moment().format("YYYY-MM-DD")}`;
    for (let img of imgs) {
      let imgSrc = $(img).attr("src");

      const fileName = `${pathname}/${path.basename(imgSrc)}`;
      const imageUrl = await uploadImageToS3(imgSrc, "techtoktok", fileName);
      $(img).attr("src", imageUrl);
    }

    let title = item.title;
    let content = article.html();

    let wpLink = await doTechtoktokPost(title, content);

    return wpLink;
  } catch (e) {
    console.log(e.response.data);
    return "err";
  }
};

const getNatepannLinks = async () => {
  try {
    console.log("네이트판 링크를 가져옵니다.");
    const { data: r } = await axios.get("https://pann.nate.com/talk/ranking");
    const $ = cheerio.load(r);

    const links = [];
    $(".post_wrap li dl dt h2 a").each(function () {
      const href = $(this).attr("href");
      links.push({
        type: "natepann",
        link: `https://pann.nate.com${href}`,
        title: $(this).text().trim(),
      });
    });
    return links;
  } catch (e) {
    return [];
  }
};

const doNatepannPost = async (item) => {
  try {
    const { data: lists } = await axios.get(item.link);

    const $ = cheerio.load(lists);
    let article = $("#contentArea");

    if (
      article.html().indexOf("video") !== -1 ||
      article.html().indexOf("Video") !== -1 ||
      article.html().indexOf("mp4") !== -1
    ) {
      console.log(item.link, "비디오라서 넘어갑니다.");
      return "err";
    }
    const imgs = article.find("img");
    const pathname = `images/${moment().format("YYYY-MM-DD")}`;
    for (let img of imgs) {
      let imgSrc = $(img).attr("src");

      const fileName = `${pathname}/${path.basename(imgSrc)}`;
      const imageUrl = await uploadImageToS3(imgSrc, "techtoktok", fileName);
      $(img).attr("src", imageUrl);
      $(img).parent().attr("src", imageUrl);
    }

    let title = item.title;
    let content = article.html();

    let wpLink = await doTechtoktokPost(title, content);

    return wpLink;
  } catch (e) {
    console.log(e.response.data);
    return "err";
  }
};

const getTeamblindLinks = async () => {
  try {
    console.log("블라인드 링크를 가져옵니다.");
    const { data: r } = await axios.get("https://www.teamblind.com/kr/");
    const $ = cheerio.load(r);

    let links = [];
    $(".topic-list .article a").each(function () {
      const href = $(this).attr("href");
      if (href && href.indexOf("post") !== -1) {
        links.push({
          type: "teamblind",
          link: `https://www.teamblind.com${href}`,
          title: $(this).text().trim(),
        });
      }
    });
    links = removeDuplicateLinks(links);

    return links;
  } catch (e) {
    return [];
  }
};

const doTeamblindPost = async (item) => {
  try {
    const { data: lists } = await axios.get(item.link);
    const $ = cheerio.load(lists);
    let article = $(".article-view-contents");

    article.find(".article_info").remove();
    const imgs = article.find("img");
    const pathname = `images/${moment().format("YYYY-MM-DD")}`;
    for (let img of imgs) {
      let imgSrc = $(img).attr("src");

      const fileName = `${pathname}/${path.basename(imgSrc)}`;
      const imageUrl = await uploadImageToS3(imgSrc, "techtoktok", fileName);
      $(img).attr("src", imageUrl);
    }

    let title = item.title;
    let content = article.html();

    let wpLink = await doTechtoktokPost(title, content);

    return wpLink;
  } catch (e) {
    console.log(e.response.data);
    return "err";
  }
};

const getDdanziLinks = async () => {
  try {
    console.log("딴지일보 링크를 가져옵니다.");
    const { data: r } = await axios.get("https://www.ddanzi.com/hot_all");
    const $ = cheerio.load(r);

    let links = [];
    $("#list_style table tbody tr .title a").each(function () {
      const href = $(this).attr("href");
      if (href && href.indexOf("#comment") === -1) {
        links.push({
          type: "ddanzi",
          link: href,
          title: replaceAll($(this).text(), "[자유게시판]", "").trim(),
        });
      }
    });
    return links;
  } catch (e) {
    return [];
  }
};

const doDdanziPost = async (item) => {
  try {
    const { data: lists } = await axios.get(item.link);
    const $ = cheerio.load(lists);
    let article = $(".read_content");

    const imgs = article.find("img");
    const pathname = `images/${moment().format("YYYY-MM-DD")}`;
    for (let img of imgs) {
      let imgSrc = $(img).attr("src");

      const fileName = `${pathname}/${path.basename(imgSrc)}`;
      const imageUrl = await uploadImageToS3(imgSrc, "techtoktok", fileName);
      $(img).attr("src", imageUrl);
    }

    let title = item.title;
    let content = article.html();

    let wpLink = await doTechtoktokPost(title, content);

    return wpLink;
  } catch (e) {
    console.log(e.response.data);
    return "err";
  }
};

const getInstizLinks = async () => {
  try {
    console.log("인스티즈 링크를 가져옵니다.");
    const { data: r } = await axios.get("https://www.instiz.net/pt?category=1");
    const $ = cheerio.load(r);

    let links = [];
    $(".listsubject a").each(function () {
      if (
        $(this).find(".fa-image").length > 0 ||
        $(this).find(".fa-images").length > 0
      ) {
        $(this).find(".cmt2").remove(); // 댓글 수(span.cmt2) 요소 제거
        $(this).find(".cmt3").remove(); // 댓글 수(span.cmt2) 요소 제거
        const href = $(this).attr("href").replace("..", "");

        links.push({
          type: "instiz",
          link: `https://instiz.net${href}`,
          title: $(this).text().trim(),
        });
      }
    });
    return links;
  } catch (e) {
    return [];
  }
};

const doInstizPost = async (item) => {
  try {
    const { data: lists } = await axios.get(item.link);
    const $ = cheerio.load(lists);
    let article = $('div[itemprop="articleBody"]');

    article.find("#votebtn").remove();
    article.find("#kakao_share").remove();

    if (
      article.html().indexOf("video") !== -1 ||
      article.html().indexOf("Video") !== -1 ||
      article.html().indexOf("mp4") !== -1
    ) {
      console.log(item.link, "비디오라서 넘어갑니다.");
      return "err";
    }

    article.find(".tool_cont").remove();
    const imgs = article.find("img");
    const pathname = `images/${moment().format("YYYY-MM-DD")}`;
    for (let img of imgs) {
      let imgSrc = `http:${$(img).attr("src")}`;

      const fileName = `${pathname}/${path.basename(imgSrc)}`;
      const imageUrl = await uploadImageToS3(imgSrc, "techtoktok", fileName);
      $(img).attr("src", imageUrl);
    }

    let title = item.title;
    let content = article.html();

    let wpLink = await doTechtoktokPost(title, content);

    return wpLink;
  } catch (e) {
    console.log(e.response.data);
    return "err";
  }
};

const getLinks = async () => {
  let links = [];
  const theqooLinks = await getTheqooLinks();
  const bobaedreamLinks = await getBobaedreamLinks();
  const natepannLinks = await getNatepannLinks();
  // const teamblindLinks = await getTeamblindLinks();
  const ddanziLinks = await getDdanziLinks();
  const instizLinks = await getInstizLinks();
  links = links.concat(theqooLinks);
  links = links.concat(bobaedreamLinks);
  links = links.concat(natepannLinks);
  // links = links.concat(teamblindLinks);
  links = links.concat(ddanziLinks);
  links = links.concat(instizLinks);

  links = shuffle(links);

  return links;
};

module.exports = {
  doTheqooPost,
  doBobaedreamPost,
  doNatepannPost,
  doTeamblindPost,
  doDdanziPost,
  doInstizPost,
  getLinks,
};

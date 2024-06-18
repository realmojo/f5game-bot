const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { replaceAll } = require("../../utils/util");

const getList = async (req, res) => {
  try {
    const url =
      "https://dapi.kakao.com/trend-keyword/v2/keywords.json?w=trend_keyword&random=2&n=100";
    const { data } = await axios.get(url, {
      headers: {
        Authorization: "KakaoAK 8da6e83ec6f6b1da277b545cbb944102",
        Ka: "origin/https://m.daum.net os/javascript",
      },
    });

    return res.status(200).send({ url, data });
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};

module.exports = {
  getList,
};

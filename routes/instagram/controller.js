const axios = require("axios");
const cheerio = require("cheerio");
const instagramDl = require("@sasmeee/igdl");
const { ensureHttps } = require("../../utils/util");

const getInstagramDownloadInfo = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      throw new Error("url required");
    }
    if (url.indexOf("instagram") === -1) {
      throw new Error("Invalid url.");
    }

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const title = $("title").text();

    const thumbnail = $('meta[property="og:image"]').attr("content")
      ? $('meta[property="og:image"]').attr("content")
      : "";

    const items = await instagramDl(ensureHttps(url));
    const info = {
      title,
      thumbnail,
      downloadUrl: items.length > 0 ? items[0].download_link : "",
    };
    return res.status(200).send(info);
  } catch (e) {
    return res.status(200).send("no data: ", e?.message);
  }
};

module.exports = {
  getInstagramDownloadInfo,
};

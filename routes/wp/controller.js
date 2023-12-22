const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { replaceAll } = require("../../utils/util");

const getCrawl = async (req, res) => {
  try {
    const { url } = req.query;
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);
    const contents = $(".entry-content");
    contents.find(".code-block").remove();
    contents.find("script").remove();
    contents.find("ins").remove();
    console.log(1);
    let f = replaceAll(
      contents.html().toString(),
      "https://tip.0k-cal.com",
      "https://techupbox.com"
    );
    f = replaceAll(f, "https://financial.0k-cal.com", "https://techupbox.com");
    f = replaceAll(f, "<!-- AdSense -->", "");
    f = replaceAll(f, "<!-- AI CONTENT END 1 -->", "");
    f = replaceAll(f, "<p></p>", "");

    console.log(f.text());
    fs.writeFile("./a.html", f, () => {
      console.log("good");
    });

    return res.status(200).send({ url });
  } catch (e) {
    return res.status(200).send("no data");
  }
};

module.exports = {
  getCrawl,
};

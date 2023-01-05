const axios = require("axios");
const twitterServerURL = "http://115.85.182.17";

const getTwitterVideos = async (req, res) => {
  try {
    if (
      req.headers.referer !== "https://twitterdownload.f5game.co.kr/" &&
      req.headers.referer !== "http://127.0.0.1:5173/"
    ) {
      return res.status(200).send({ message: "no hack" });
    }

    const { url } = req.query;
    const { data } = await axios.post(`${twitterServerURL}/videos`, {
      url,
    });
    return res.status(200).send(data);
  } catch (e) {
    return res.status(200).send("no data");
  }
};

const getTwitterTrends = async (req, res) => {
  try {
    const { data } = await axios.get(`${twitterServerURL}/trends`);
    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};

module.exports = {
  getTwitterVideos,
  getTwitterTrends,
};

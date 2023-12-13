const axios = require("axios");

const doUploadS3 = async (req, res) => {
  try {
    const { location } = req.file;
    const { idx } = req.query;
    if (idx && location) {
      const param = {
        idx,
        logo: location,
      };
      await axios.post(
        "https://mindpang.f5game.co.kr/api/test/update/logo/",
        param
      );
      res.status(200).send(location);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

module.exports = {
  doUploadS3,
};

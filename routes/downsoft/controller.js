const axios = require("axios");

const doUploadS3 = async (req, res) => {
  try {
    const { location } = req.file;
    // const { idx } = req.query;
    // if (idx && location) {
    //   const param = {
    //     idx,
    //     logo: location,
    //   };
    //   await axios.post("https://api.mindpang.com/api/test/update/logo/", param);
    //   res.status(200).send(location);
    // }
    res.status(200).send(location);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

module.exports = {
  doUploadS3,
};

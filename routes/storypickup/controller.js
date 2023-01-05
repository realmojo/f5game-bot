const axios = require("axios");
const FormData = require("form-data");

const postStorypickup = async (req, res) => {
  try {
    const { title, textContent } = req.body;
    let { bo_table } = req.body;
    if (!bo_table) {
      bo_table = "worry";
    }

    // 스토리픽업 포스팅
    const spFormData = new FormData();
    spFormData.append("bo_table", bo_table);
    spFormData.append("html", "html1");
    spFormData.append("wr_subject", title);
    spFormData.append("wr_content", textContent.join("<br/>"));

    const rrr = await axios.post(
      "https://storypickup.com/bbs/write_auto.php",
      spFormData
    );

    let returnUrl = rrr.data;

    return res.status(200).send(returnUrl);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

module.exports = {
  postStorypickup,
};

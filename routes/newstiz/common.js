const axios = require("axios");
const FormData = require("form-data");

const doNewstizPost = async (title, content) => {
  return new Promise((resolve) => {
    try {
      const axios = require("axios");
      const FormData = require("form-data");
      let data = new FormData();
      data.append("bo_table", "free");
      data.append("wr_subject", title);
      data.append("wr_content", content);
      data.append("wr_name", "뉴스티즈");

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://newstiz.iwinv.net/bbs/write_auto.php",
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          resolve(JSON.stringify(response.data));
          console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (e) {
      console.log(e.response.data);
      return "err";
    }
  });
};

const removeDuplicateLinks = (arr) => {
  const seenLinks = new Set(); // 중복을 체크하기 위한 Set
  return arr.filter((item) => {
    if (seenLinks.has(item.link)) {
      return false; // 중복된 링크는 제외
    } else {
      seenLinks.add(item.link); // 새로운 링크는 Set에 추가
      return true; // 중복이 아니므로 유지
    }
  });
};

module.exports = {
  doNewstizPost,
  removeDuplicateLinks,
};

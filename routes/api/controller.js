const request = require("request");
const fs = require("fs");
const axios = require("axios");

const fileS3Upload = async (req, res) => {
  console.log(req);
  res.status(200).send("ok");
};

function doRequest(url) {
  var request = require("request").defaults({ encoding: null });
  return new Promise(function (resolve, reject) {
    request.get(
      "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTEwMDlfNTAg%2FMDAxNjMzNzI4MTE5NTg5.hlJmZ5SGqc1U7rXpbiDa-DJgMGfI4ZWksxJ-tBeYVWAg.ltRvft1k8cmNxhbaIQeCu_V18ggjEJ6JSC5d5aCVvpog.JPEG.logsjin%2FIMG_4317.jpg&type=a340",
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          data =
            "data:" +
            response.headers["content-type"] +
            ";base64," +
            Buffer.from(body).toString("base64");
          resolve(data);
        }
      }
    );
  });
}

// const df = async () => {};
// df();
const getDownload = async (req, res) => {
  const { src, alt } = req.body;
  const data = await doRequest(src);

  return res.status(200).send({ src: data, alt });
  // const file = fs.readFileSync(src);
  // res.writeHead(200, { "Context-Type": "image/png" });
  // res.write(file);

  // const { src } = req.body;
  // axios({
  //   url: decodeURIComponent(src),
  //   method: "GET",
  //   responseType: "blob",
  // }).then((response) => {
  //   return res.status(200).send({ data: response.data });
  // const link = document.createElement("a");
  // link.href = url;
  // link.setAttribute("download", `${item.id}.jpg`);
  // document.body.appendChild(link);
  // link.click();
  // });
};

module.exports = {
  fileS3Upload,
  getDownload,
};

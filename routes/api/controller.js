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
    request.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        data =
          "data:" +
          response.headers["content-type"] +
          ";base64," +
          Buffer.from(body).toString("base64");
        resolve(data);
      }
    });
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

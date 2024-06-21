const request = require("request");
const fs = require("fs");
const axios = require("axios");

const fileS3Upload = async (req, res) => {
  console.log(req);
  res.status(200).send("ok");
};

function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode === 200) {
        let data =
          "data:" +
          res.headers["content-type"] +
          ";base64," +
          Buffer.from(body).toString("base64");
        resolve(data);
      } else {
        reject(error);
      }
    });
  });
}

// const df = async () => {
//   const path = "image.png";
//   axios({
//     method: "get",
//     url: "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MjdfNTQg%2FMDAxNjkzMDk2NTQ2NzQy.oYAd51L7x3IUtt4P6n3jZxeVBtPKRJq8KJQdobgKWvkg.cvaJGAYmLP6sIbXYfHzEZ1TdJKL0Zad1NR4okQ-913Qg.JPEG.2obx83kax%2F1.jpg&type=a340",
//     responseType: "stream",
//   })
//     .then((response) => {
//       const writer = fs.createWriteStream(path);
//       response.data.pipe(writer);
//       writer.on("finish", () => {
//         console.log("Download completed.");
//       });
//       writer.on("error", (err) => {
//         console.error(`Error: ${err.message}`);
//       });
//     })
//     .catch((err) => {
//       console.error(`Error: ${err.message}`);
//     });
// };
// df();
const getDownload = async (req, res) => {
  // const { src, alt } = req.body;
  // // const data = await doRequest(src);
  // const file = fs.readFileSync(src);
  // res.writeHead(200, { "Context-Type": "image/png" });
  // res.write(file);

  const { src } = req.body;
  axios({
    url: decodeURIComponent(src),
    method: "GET",
    responseType: "blob",
  }).then((response) => {
    return res.status(200).send({ data: response.data });
    // const link = document.createElement("a");
    // link.href = url;
    // link.setAttribute("download", `${item.id}.jpg`);
    // document.body.appendChild(link);
    // link.click();
  });
};

module.exports = {
  fileS3Upload,
  getDownload,
};

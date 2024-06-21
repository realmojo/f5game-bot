const request = require("request");

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

const getDownload = async (req, res) => {
  const { src, alt } = req.body;
  const data = await doRequest(src);
  return res.status(200).send({ src: data, alt });
};

module.exports = {
  fileS3Upload,
  getDownload,
};

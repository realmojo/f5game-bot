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

const getDownload = async (req, res) => {
  const { src, alt } = req.body;
  const data = await doRequest(src);

  return res.status(200).send({ src: data, alt });
};

module.exports = {
  fileS3Upload,
  getDownload,
};

const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const shortid = require("shortid");

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_SECRET_KEY,
  region: "ap-northeast-2",
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "downsoft",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, files, cb) => {
      const ext = files.mimetype.split("/")[1];
      const { idx } = req.query;
      cb(null, `images/${idx}/${shortid()}.${ext}`);
    },
  }),
});

exports.upload = multer(upload);

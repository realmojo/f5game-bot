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
    bucket: process.env.BUCKET_NAME || "f5-quiz",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      const { idx } = req.query;
      console.log(idx, shortid());
      cb(null, `images/${idx}/${shortid()}`);
    },
  }),
});

exports.upload = multer(upload);

const express = require("express");
const router = express.Router();
const controller = require("./controller");
const { upload } = require("./s3");

// AWS S3 업로드
router.post("/upload", upload.single("uploadImage"), controller.doUploadS3);
router.get("/getCrawl", controller.getCrawl);

module.exports = router;

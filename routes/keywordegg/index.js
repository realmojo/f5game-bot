const express = require("express");
const router = express.Router();
const controller = require("./controller");

// AWS S3 업로드
router.get("/getKeywordList", controller.getKeywordList);
router.get("/addKeyword", controller.addKeyword);

module.exports = router;

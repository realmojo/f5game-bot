const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 트위터 영상 비디오 정보 가져오기
router.get("/videos", controller.getTwitterVideos);

// 트위터 트렌드 가져오기
router.get("/trends", controller.getTwitterTrends);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 유튜브 스크립트 텍스트 가져오기
router.get("/scripts", controller.getYoutubeScript);
router.get("/download", controller.getYoutubeDownloadInfo);
router.get("/progressing", controller.getProgressing);
router.get("/getProgressId", controller.getProgressId);
router.get("/json", controller.getYoutubeJson);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 유튜브 스크립트 텍스트 가져오기
router.get("/list", controller.getList);
router.get("/qrCreate", controller.doCreateQrUrl);
router.get("/keyword", controller.getKeywords);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 트위터 영상 비디오 정보 가져오기
router.get("/getContents", controller.getContents);
router.post("/addContents", controller.addContents);

module.exports = router;

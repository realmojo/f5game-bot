const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 스토리픽업 올리기
router.post("/upload", controller.postStorypickup);

module.exports = router;

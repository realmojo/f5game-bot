const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 스토리픽업 올리기
router.get("/list", controller.getList);

module.exports = router;
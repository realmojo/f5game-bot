const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 스토리픽업 올리기
router.get("/doPost", controller.doApiPost);
router.get("/apiTest", controller.getApiTest);
router.get("/proxy", controller.getProxyImage);
router.get("/getCrawl", controller.getCrawl);
router.post("/doKinToTechupboxPost", controller.doKinToTechupboxPost);

module.exports = router;

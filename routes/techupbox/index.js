const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 스토리픽업 올리기
router.get("/doPost", controller.doApiPost);
router.get("/apiTest", controller.getApiTest);
router.get("/proxy", controller.getProxyImage);
router.get("/getModels", controller.getModels);
router.get("/getCrawl", controller.getCrawl);
router.get("/getCoupangData", controller.getCoupangData);

router.post("/setNaverCookie", controller.setNaverCookie);
router.get("/getNaverCookie", controller.getNaverCookie);
router.post("/doKinToTechupboxPost", controller.doKinToTechupboxPost);

router.post("/doGenerateContent", controller.doGenerateContent);
router.post("/createTechupboxPost", controller.createTechupboxPost);
router.post("/getQrLink", controller.getQrLink);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 스토리픽업 올리기
router.get("/doPostFortune", controller.postApiFortune);
router.get("/doPostDream", controller.postApiDream);
router.get("/getModelList", controller.getModelList);
router.get("/apiTest", controller.getApiTest);
router.get("/crawl", controller.getCrawl);
router.post("/doKinToTechtoktokPost", controller.doKinToTechtoktokPost);

module.exports = router;

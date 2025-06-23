const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 내부 로직
router.get("/getCpUrl", controller.getCpUrl);
router.get("/item", controller.getItem);
router.get("/itemList", controller.getItemList);

// 외부 로직
router.get("/cp/item", controller.getCpItem);

module.exports = router;

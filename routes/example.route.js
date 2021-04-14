const express = require("express");
const router = express.Router();
const exampleController = require("../controllers/example.controller");
const flatCacheMiddleware = require("../middleware/cache");

router.get("/", flatCacheMiddleware, exampleController.getAll);

module.exports = router;

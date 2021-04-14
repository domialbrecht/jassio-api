var router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Hello, from example api. Have a good day!");
});

router.use("/example", require("./example.route"));

module.exports = router;

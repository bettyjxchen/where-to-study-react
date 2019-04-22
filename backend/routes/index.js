const router = require("express").Router();

/* ----------------------- API ----------------------- */
router.use("/api", require("./api"));

module.exports = router;

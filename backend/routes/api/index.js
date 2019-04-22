const router = require("express").Router();

/* ----------------------- API ----------------------- */
router.use("/accounts", require("./accounts.routes"));
router.use("/cities", require("./cities.routes"));
router.use("/areas", require("./areas.routes"));
router.use("/locations", require("./locations.routes"));
router.use("/addresses", require("./addresses.routes"));

module.exports = router;

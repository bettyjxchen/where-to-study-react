//DOES: validate required fields in body
function body(req, res, next) {
	let {
		area: { area, city }
	} = req.body;

	if (!area || !city) {
		return res.status(422).json({ errors: "all fields are required" });
	}

	next();
}

module.exports = {
	body
};

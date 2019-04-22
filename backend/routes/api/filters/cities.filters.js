//DOES: validate required fields in body
function body(req, res, next) {
	let {
		city: { city, country }
	} = req.body;

	if (!city || !country) {
		return res.status(422).json({ errors: "all fields are required" });
	}

	next();
}

module.exports = {
	body
};

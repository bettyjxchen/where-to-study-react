//DOES: validate required fields in body
function body(req, res, next) {
	let {
		address: { street, city, state, postalCode, country }
	} = req.body;

	if (!street || !city || !state || !postalCode || !country) {
		return res.status(422).json({ errors: "all fields are required" });
	}

	next();
}

module.exports = {
	body
};

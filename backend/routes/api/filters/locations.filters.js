//DOES: validate required fields in body
function body(req, res, next) {
	let {
		location: { city, area, name, type, address, rating, info, image }
	} = req.body;

	if (!city || !area || !name || !type || !address) {
		return res.status(422).json({ errors: "all fields are required" });
	}

	next();
}

module.exports = {
	body
};

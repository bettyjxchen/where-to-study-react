//DOES: validate login required fields
function login(req, res, next) {
	let { username, password } = req.body;

	if (!username || !password) {
		return res.status(422).json({ errors: "all fields are required" });
	}

	next();
}

//DOES: validate create new account
function create(req, res, next) {
	let { account } = req.body;

	if (!account.username || !account.password || !account.email)
		return res.status(422).json({ errors: "all fields are required" });

	next();
}

//DOES: validates username
function username(req, res, next) {
	let { username } = req.body;

	if (!username)
		return res.status(422).json({ errors: "username is required" });

	next();
}

module.exports = {
	login,
	create,
	username
};

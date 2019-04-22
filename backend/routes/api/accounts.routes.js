const router = require("express").Router();
const path = require("path");
const passport = require("passport");
const auth = require("../auth");
const Account = require("../../models/Account");
const Filters = require("./filters/accounts.filters");

/* ----------------------- Routes ----------------------- */
//POST: login
router.post("/login", auth.optional, Filters.login, (req, res, next) => {
	return passport.authenticate(
		"local",
		{ session: true, successRedirect: "/", failureRedirect: "/login" },
		(err, account, msg) => {
			//handle server err
			if (err) return res.sendStatus(500).send(err);

			//get authenticated
			if (account) {
				//login with passport, stores req.user in session
				req.login(account, err => {
					if (err) return next(err);

					//attach token to req.user
					req.user.token = account.generateJWT();
					console.log(req.user);
					//return auth object to client
					return res.json({ account: account.toAuthJSON() });
				});
			} else {
				return res.status(401).json({ account: null });
			}
		}
	)(req, res, next);
});

//POST: logout
router.post("/logout", auth.optional, (req, res, next) => {
	if (req.isAuthenticated()) {
		let { username } = req.user;

		//passport logout
		req.logout();
		return res.send(`${username} successfully logged out`);
	}
});

//POST: create new account
router.post("/", Filters.create, auth.optional, (req, res) => {
	let { account } = req.body;

	//check for existing username
	_checkExisting(account).then(result => {
		if (result.error) {
			res.status(422).json(result);
		} else {
			//save account to db
			let newAccount = result.account;
			if (!newAccount.type) {
				newAccount.type = "user";
			}
			return newAccount.save().then(() => res.json(newAccount.toAuthJSON()));
		}
	});
});

//GET: get dashboard of current user
router.get("/dashboard", auth.optional, (req, res) => {
	if (req.isAuthenticated()) {
		let { username } = req.user;
		res.redirect(`/api/accounts/${username}`);
	} else {
		res.sendStatus(401).write("User must log in first.");
	}
});

//GET: get account details
router.get("/:username", auth.required, (req, res, next) => {
	let { username } = req.params;

	//get account details
	Account.findOne({ username: username })
		.then(account => {
			//if account found
			if (account) {
				//get relevant account info
				let info = {
					id: account._id,
					username: account.username,
					email: account.email,
					type: account.type,
					dateOpened: account.dateOpened
				};

				return res.json(info);
			} else {
				return res.sendStatus(400);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//GET: get all accounts
router.get("/", auth.optional, (req, res, next) => {
	let { username } = req.params;

	//get account details
	Account.find({})
		.then(accounts => {
			if (accounts.length) {
				accounts = accounts.map(account => {
					let info = {
						_id: account._id,
						username: account.username,
						isAdmin: account.isAdmin,
						email: account.email,
						type: account.type,
						dateCreated: account.dateCreated
					};

					return info;
				});
				return res.json(accounts);
			} else {
				return res.json(null);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

/* ----------------------- Helper Functions ----------------------- */
//DOES: check for unique username
function _checkExisting(account) {
	let result = {};

	//validate existing username
	return Account.findOne({ username: account.username }).then(existing => {
		//duplicate found
		if (existing) {
			result.error = "This username is in use. Please try again.";
			return result;
		} else {
			//create account from Account model
			const finalAccount = new Account(account);
			finalAccount.setDefaults();
			finalAccount.setPassword(account.password);
			result.account = finalAccount;

			return result;
		}
	});
}

module.exports = router;

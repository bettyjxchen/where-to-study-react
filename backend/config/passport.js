const passport = require("passport");
const LocalStrategy = require("passport-local");
const Account = require("../models/Account");

passport.use(
	new LocalStrategy(
		{
			usernameField: "username",
			passwordField: "password"
		},
		(username, password, done) => {
			//verify user in Mongodb
			Account.findOne({ username })
				.then(account => {
					if (!account || !account.validatePassword(password)) {
						return done(null, false, {
							errors: { "username or password": "is invalid" }
						});
					} else {
						return done(null, account);
					}
				})
				.catch(err => done(err, false));
		}
	)
);

passport.serializeUser((account, done) => {
	done(null, account.username);
});

passport.deserializeUser((username, done) => {
	Account.findOne({ username }).then(account => done(null, account));
});

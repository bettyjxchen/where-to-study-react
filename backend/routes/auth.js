const jwt = require("express-jwt");

const getTokenFromHeaders = req => {
	const { authorization } = req.headers;

	//get token from authorization
	if (authorization && authorization.split(" ")[0] === "Token") {
		return authorization.split(" ")[1];
	} else {
		return null;
	}
};

const auth = {
	required: jwt({
		secret: "this is my secret",
		userProperty: "payload",
		getToken: getTokenFromHeaders,
		credentialsRequired: true
	}),
	optional: jwt({
		secret: "this is my secret",
		userProperty: "payload",
		getToken: getTokenFromHeaders,
		credentialsRequired: false
	})
};

module.exports = auth;

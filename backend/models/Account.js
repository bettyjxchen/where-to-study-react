const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const AccountSchema = new mongoose.Schema({
	username: { type: String, required: true },
	isAdmin: Boolean,
	hash: String,
	salt: String,
	email: String,
	dateCreated: String
});

AccountSchema.methods.setDefaults = function() {
	let date = new Date();
	date = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;

	this.dateCreated = date;
	this.isAdmin = false;
};

AccountSchema.methods.setPassword = function(password) {
	this.salt = crypto.randomBytes(16).toString("hex");
	this.hash = crypto
		.pbkdf2Sync(password, new Buffer(this.salt, "binary"), 10000, 512, "sha512")
		.toString("hex");
};

AccountSchema.methods.validatePassword = function(password) {
	const hash = crypto
		.pbkdf2Sync(password, new Buffer(this.salt, "binary"), 10000, 512, "sha512")
		.toString("hex");
	return this.hash === hash;
};

AccountSchema.methods.generateJWT = function() {
	const today = new Date();
	const expirationDate = new Date(today);
	expirationDate.setDate(today.getDate() + 60);

	const expiry = parseInt(expirationDate.getTime() / 1000, 10);
	return jwt.sign(
		{ id: this._id, username: this.username, exp: expiry },
		"this is my secret"
	);
};

AccountSchema.methods.toAuthJSON = function() {
	const authResp = {
		_id: this._id,
		username: this.username,
		token: this.generateJWT()
	};

	return authResp;
};

module.exports = mongoose.model("Account", AccountSchema);

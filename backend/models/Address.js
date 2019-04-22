const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
	street: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	postalCode: { type: String, required: true },
	country: { type: String, required: true },
	dateCreated: String
});

AddressSchema.methods.setDefaults = function() {
	let date = new Date();
	date = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;

	this.dateCreated = date;
};

module.exports = mongoose.model("Address", AddressSchema);

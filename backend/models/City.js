const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema({
	city: { type: String, required: true },
	country: { type: String, required: true },
	numAreas: Number,
	dateCreated: String
});

CitySchema.methods.setDefaults = function() {
	let date = new Date();
	date = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
	console.log(date);

	this.dateCreated = date;
	this.numAreas = 0;
};

CitySchema.methods.addArea = function() {
	this.numAreas++;
};

CitySchema.methods.removeArea = function() {
	this.numAreas--;
};

module.exports = mongoose.model("City", CitySchema);

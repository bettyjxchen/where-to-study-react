const mongoose = require("mongoose");

const AreaSchema = new mongoose.Schema({
	area: { type: String, required: true },
	city: { type: String, required: true },
	numLocations: Number,
	dateCreated: String
});

AreaSchema.methods.setDefaults = function() {
	let date = new Date();
	date = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;

	this.dateCreated = date;
	this.numLocations = 0;
};

AreaSchema.methods.addLocation = function() {
	this.numLocations++;
};

AreaSchema.methods.removeLocation = function() {
	this.numLocations--;
};

module.exports = mongoose.model("Area", AreaSchema);

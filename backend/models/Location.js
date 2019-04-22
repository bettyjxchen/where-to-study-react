const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
	city: { type: String, required: true },
	area: { type: String, required: true },
	name: { type: String, required: true },
	type: { type: String, required: true },
	address_id: mongoose.Schema.Types.ObjectId,
	rating: Number,
	info: {
		hasWifi: Boolean,
		hasOutlet: Boolean,
		hasParking: Boolean,
		opensLate: Boolean
	},
	dateCreated: String
});

LocationSchema.methods.setDefaults = function() {
	let date = new Date();
	date = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;

	this.dateCreated = date;
};

LocationSchema.methods.rateLocation = function(rating) {
	this.rating = rating;
};

module.exports = mongoose.model("Location", LocationSchema);

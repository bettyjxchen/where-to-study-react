const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
	city: { type: String, required: true },
	area: { type: String, required: true },
	name: { type: String, required: true },
	type: { type: String, required: true },
	image: { type: String, required: true },
	review: String,
	address_id: mongoose.Schema.Types.ObjectId,
	rating: Number,
	likes: Number,
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
	this.likes = 0;
};

LocationSchema.methods.rateLocation = function(rating) {
	this.rating = rating;
};

LocationSchema.methods.like = function() {
	this.likes++;
};

module.exports = mongoose.model("Location", LocationSchema);

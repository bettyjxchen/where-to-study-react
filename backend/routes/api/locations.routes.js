const router = require("express").Router();
const auth = require("../auth");
const ObjectId = require("mongoose").Types.ObjectId;
const Area = require("../../models/Area");
const Location = require("../../models/Location");
const Address = require("../../models/Address");
const Filters = require("./filters/locations.filters");

/* ----------------------- Routes ----------------------- */
//POST: create new location
router.post("/", auth.optional, Filters.body, (req, res, next) => {
	let { location } = req.body;

	//check for existing location
	_checkExisting(location).then(result => {
		if (result.error) {
			res.status(422).json(result);
		} else {
			//create new address
			const address = new Address(location.address);
			address.setDefaults();
			address.save();

			//use address in Location obj
			delete location.address;
			location.address_id = address._id;

			//add location count to area
			Area.findOne({ area: location.area }).then(area => {
				if (area) {
					area.addLocation();
					area.save();
				}
			});

			//create Location obj
			const finalLocation = new Location(location);
			finalLocation.setDefaults();
			finalLocation.save();

			res.json(finalLocation);
		}
	});
});

//GET: query locations by city
router.get("/all", auth.optional, (req, res) => {
	let { city } = req.query;

	//find location
	Location.find({ city: city })
		.then(locations => {
			if (locations && locations.length) {
				return res.json(locations);
			} else {
				return res.json(null);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//GET: get all locations
router.get("/", auth.optional, (req, res, next) => {
	Location.find({})
		.then(locations => {
			if (locations.length) {
				return res.json(locations);
			} else {
				return res.json(null);
			}
		})
		.catch(err => res.sendStatus(400));
});

//GET: get location by id
router.get("/:id", auth.optional, (req, res) => {
	let { id } = req.params;

	//find location
	Location.findOne({ _id: new ObjectId(id) })
		.then(location => {
			if (location) {
				return res.json(location);
			} else {
				return res.sendStatus(400);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//PUT: edit location (only like)
router.put("/:id/like", auth.optional, (req, res, next) => {
	let { id } = req.params;

	//find location
	Location.findOne({ _id: new ObjectId(id) })
		.then(existing => {
			if (existing) {
				//update location
				existing.like();
				existing.save();

				res.json(existing);
			} else {
				return res.json(null);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//PUT: edit location
router.put("/:id", auth.optional, Filters.body, (req, res, next) => {
	let { id } = req.params;
	let { location } = req.body;

	//find location
	Location.findOne({ _id: new ObjectId(id) })
		.then(existing => {
			if (existing) {
				//update location
				existing.name = location.name;
				existing.type = location.type;
				existing.image = location.image;
				existing.address = location.address;
				existing.rating = location.rating;
				existing.review = location.review;
				existing.info = location.info;

				//update address
				Address.findOne({ _id: existing.address_id })
					.then(address => {
						if (address) {
							let {
								street,
								city,
								state,
								postalCode,
								country
							} = existing.address;
							address.street = street;
							address.city = city;
							address.state = state;
							address.postalCode = postalCode;
							address.country = country;
							address.save();
						}
					})
					.then(() => {
						//update area counts if new area
						if (existing.area !== location.area) {
							//update area numLocations count
							Area.findOne({ area: existing.area, city: existing.city })
								.then(area => {
									if (area) {
										//remove location
										area.removeLocation();
										area.save();
									}
								})
								.then(() => {
									Area.findOne({
										area: location.area,
										city: location.city
									}).then(area => {
										if (area) {
											//add area
											area.addLocation();
											area.save();
										}
									});
								})
								.then(() => {
									existing.area = location.area;
									existing.city = location.city;
									existing.save();
									console.log(existing);
									res.json(existing);
								});
						} else {
							existing.area = location.area;
							existing.city = location.city;
							existing.save();
							res.json(existing);
						}
					});
			} else {
				return res.sendStatus(400);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//DELETE: delete location
router.delete("/:id", auth.optional, (req, res, next) => {
	let { id } = req.params;

	//find location
	Location.findOne({ _id: new ObjectId(id) })
		.then(existing => {
			if (existing) {
				//delete address
				Address.findOne({ _id: new ObjectId(existing.address_id) })
					.then(address => {
						if (address) {
							address.remove();
						}

						//remove one from numLocations in Areas
						Area.findOne({ area: existing.area }).then(area => {
							if (area) {
								area.removeLocation();
								area.save();
							}
						});
					})
					.then(() => {
						//delete location
						existing.remove();
						res.send(`${existing.name} deleted.`);
					});
			} else {
				return res.sendStatus(400);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

/* ----------------------- Helper Functions ----------------------- */
//DOES: check for existing location
function _checkExisting(locationIn) {
	let { location, area, name } = locationIn;
	let result = {};

	//validate existing location
	return Location.findOne({ location: location, area: area, name: name })
		.then(existing => {
			if (existing) {
				result.error = "This location already exists.";
				return result;
			} else {
				return result;
			}
		})
		.catch(err => {
			throw Error(err);
		});
}

module.exports = router;

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

			console.log(location);

			//create Location obj
			const finalLocation = new Location(location);
			finalLocation.setDefaults();
			return finalLocation.save().then(() => res.json(finalLocation));
		}
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

//PUT: edit location
router.put("/:id", auth.optional, Filters.body, (req, res, next) => {
	let { id } = req.params;
	let { location } = req.body;

	//find location
	Location.findOne({ _id: new ObjectId(id) })
		.then(existing => {
			if (existing) {
				//update location
				existing.city = location.city;
				existing.area = location.area;
				existing.name = location.name;
				existing.type = location.type;
				existing.address = location.address;
				existing.rating = location.rating;
				existing.info = location.info;
				existing.address_id = location.address_id;

				//update address
				Address.findOne({ _id: existing.address_id }).then(address => {
					if (address) {
						let { street, city, state, postalCode, country } = existing.address;

						address.street = street;
						address.city = city;
						address.state = state;
						address.postalCode = postalCode;
						address.country = country;
						address.save();
					}
				});

				existing.save();
				res.send(`${existing.name} updated.`);
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
				Address.deleteOne({ _id: new ObjectId(existing.address_id) })
					.then(() => {
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
						existing.save();
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

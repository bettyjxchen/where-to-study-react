const router = require("express").Router();
const auth = require("../auth");
const City = require("../../models/City");
const Area = require("../../models/Area");
const Filters = require("./filters/cities.filters");

/* ----------------------- Routes ----------------------- */
//POST: create new city
router.post("/", auth.optional, Filters.body, (req, res, next) => {
	let { city } = req.body;

	//check for existing city
	_checkExisting(city).then(result => {
		if (result.error) {
			res.status(422).json(result);
		} else {
			//save city to db
			let newCity = result.city;
			return newCity.save().then(() => res.json(newCity));
		}
	});
});

//GET: get all cities
router.get("/", auth.optional, (req, res, next) => {
	let { city } = req.params;

	//get all cities
	City.find({})
		.then(cities => {
			if (cities.length) {
				return res.json(cities);
			} else {
				return res.json(null);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//GET: get city by name
router.get("/:city", auth.optional, (req, res) => {
	let { city } = req.params;

	//get city details
	City.findOne({ city: city })
		.then(city => {
			//if city exists
			if (city) {
				return res.json(city);
			} else {
				return res.sendStatus(400);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//PUT: edit city
router.put("/:city", auth.optional, Filters.body, (req, res, next) => {
	let { city } = req.body;
	let cityName = req.params.city;

	//update city
	City.findOne({ city: cityName })
		.then(existing => {
			if (existing) {
				existing.city = city.city;
				existing.country = city.country;
				existing.save();

				res.json(existing);
			} else {
				return res.send(`${cityName} not found.`);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//DELETE: delete city
router.delete("/:city", auth.optional, (req, res, next) => {
	let { city } = req.params;

	//update city
	City.deleteOne({ city: city })
		.then(() => {
			return res.send(`${city} deleted.`);
		})
		.catch(err => {
			return res.sendStatus(400);
		});
});

/* ----------------------- Helper Functions ----------------------- */
//DOES: check for existing city
function _checkExisting(cityObj) {
	let { city, country } = cityObj;
	let result = {};

	//validate existing city
	return City.findOne({ city: city, country: country }).then(existing => {
		//duplicate found
		if (existing) {
			result.error = "This city already exists.";
			return result;
		} else {
			//create city from City model
			const finalCity = new City(cityObj);
			finalCity.setDefaults();
			result.city = finalCity;

			return result;
		}
	});
}

module.exports = router;

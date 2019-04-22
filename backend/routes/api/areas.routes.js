const router = require("express").Router();
const auth = require("../auth");
const Area = require("../../models/Area");
const City = require("../../models/City");
const Filters = require("./filters/areas.filters");

/* ----------------------- Routes ----------------------- */
//POST: create new area
router.post("/", auth.optional, Filters.body, (req, res, next) => {
	let { area } = req.body;

	//check for existing area
	_checkExisting(area).then(result => {
		if (result.error) {
			res.status(422).json(result);
		} else {
			//save area to db
			let newArea = result.area;

			//add area count to city
			City.findOne({ city: newArea.city }).then(city => {
				if (city) {
					city.addArea();
					city.save();
				}
			});

			return newArea.save().then(() => res.json(newArea));
		}
	});
});

//GET: get all areas
router.get("/", auth.optional, (req, res, next) => {
	Area.find({})
		.then(areas => {
			if (areas.length) {
				return res.json(areas);
			} else {
				return res.json(null);
			}
		})
		.catch(err => res.sendStatus(400));
});

//GET: get area by name
router.get("/:city/:area", auth.optional, (req, res) => {
	let { city, area } = req.params;

	//find city
	City.findOne({ city: city })
		.then(city => {
			if (city) {
				//find area
				Area.findOne({ area: area }).then(area => {
					if (area) {
						return res.json(area);
					} else {
						return res.sendStatus(400);
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

//PUT: edit area
router.put("/:city/:area", auth.optional, Filters.body, (req, res, next) => {
	let { city, area } = req.params;
	let newArea = req.body.area;

	//find city
	City.findOne({ city: city })
		.then(city => {
			if (city) {
				//find area
				Area.findOne({ area: area }).then(existing => {
					if (existing) {
						existing.area = newArea.area;
						existing.city = newArea.city;
						existing.save();
						res.send(`${area} updated.`);
					} else {
						return res.send(`${area} not found.`);
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

//DELETE: delete area
router.delete("/:city/:area", auth.optional, (req, res, next) => {
	let { city, area } = req.params;

	//find city
	City.findOne({ city: city })
		.then(city => {
			if (city) {
				//delete area
				Area.findOne({ area: area }).then(existing => {
					if (existing) {
						Area.deleteOne({ area: area }).then(() => {
							city.removeArea();
							city.save();
							return res.send(`${area} deleted.`);
						});
					} else {
						return res.sendStatus(400);
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

/* ----------------------- Helper Functions ----------------------- */
//DOES: check for existing area
function _checkExisting(areaIn) {
	let { area, city } = areaIn;
	let result = {};

	//validate existing area
	return Area.findOne({ area: area, city: city })
		.then(existing => {
			if (existing) {
				result.error = "This area already exists.";
				return result;
			} else {
				const finalArea = new Area(areaIn);
				finalArea.setDefaults();
				result.area = finalArea;

				return result;
			}
		})
		.catch(err => {
			throw Error(err);
		});
}

module.exports = router;

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

//GET: get all areas in city
router.get("/:city", auth.optional, (req, res, next) => {
	let { city } = req.params;

	Area.find({ city: city })
		.then(areas => {
			if (areas.length) {
				return res.json(areas);
			} else {
				return res.json(null);
			}
		})
		.catch(err => res.sendStatus(400));
});

//GET: get area by city/area
router.get("/:city/:area", auth.optional, (req, res) => {
	let { city, area } = req.params;

	//find area
	Area.findOne({ city: city, area: area })
		.then(area => {
			if (area) {
				return res.json(area);
			} else {
				return res.json({ error: "Could not find area." });
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

	Area.findOne({ city: city, area: area })
		.then(existing => {
			if (existing) {
				//update area
				existing.area = newArea.area;
				//update city
				if (existing.city !== area.city) {
					//update city numAreas count
					City.findOne({ city: existing.city })
						.then(city => {
							if (city) {
								//remove area
								city.removeArea();
								city.save();
							}
						})
						.then(() => {
							City.findOne({ city: newArea.city }).then(city => {
								if (city) {
									//add area
									city.addArea();
									city.save();
								}

								res.json(existing);
							});
						})
						.then(() => {
							existing.city = newArea.city;
							existing.save();
							res.json(existing);
						});
				}
			} else {
				return res.json({ error: `${area} not found.` });
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//DELETE: delete area
router.delete("/:city/:area", auth.optional, (req, res, next) => {
	let { city, area } = req.params;

	//delete area
	Area.findOne({ area: area })
		.then(existing => {
			if (existing) {
				Area.deleteOne({ area: area }).then(() => {
					//find city
					City.findOne({ city: city }).then(city => {
						if (city) {
							//reduce area count
							city.removeArea();
							city.save();
						}
						return res.send(`${area} deleted.`);
					});
				});
			} else {
				return res.json({ error: `${area} not found.` });
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

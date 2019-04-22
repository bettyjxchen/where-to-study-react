const router = require("express").Router();
const auth = require("../auth");
const ObjectId = require("mongoose").Types.ObjectId;
const Address = require("../../models/Address");
const Filters = require("./filters/addresses.filters");

/* ----------------------- Routes ----------------------- */
//POST: create new address
router.post("/", auth.optional, Filters.body, (req, res, next) => {
	let { address } = req.body;

	//check for existing address
	_checkExisting(address).then(result => {
		if (result.error) {
			res.status(422).json(result);
		} else {
			//save address to db
			let newAddress = result.address;
			console.log(newAddress);
			newAddress.save().then(() => res.json({ id: newAddress._id }));
		}
	});
});

//GET: get all addresss
router.get("/", auth.optional, (req, res, next) => {
	Address.find({})
		.then(addresss => {
			if (addresss.length) {
				return res.json(addresss);
			} else {
				return res.json(null);
			}
		})
		.catch(err => res.sendStatus(400));
});

//GET: get address by id
router.get("/:id", auth.optional, (req, res) => {
	let { id } = req.params;

	//find address
	Address.findOne({ _id: new ObjectId(id) })
		.then(address => {
			if (address) {
				res.json(address);
			} else {
				res.sendStatus(400);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//PUT: edit address
router.put("/:id", auth.optional, Filters.body, (req, res, next) => {
	let { id } = req.params;
	let { address } = req.body;

	Address.findOne({ _id: new ObjectId(id) })
		.then(existing => {
			if (existing) {
				existing.street = address.street;
				existing.city = address.city;
				existing.state = address.state;
				existing.postalCode = address.postalCode;
				existing.country = address.country;

				existing.save();
				res.send(`Address updated.`);
			} else {
				return res.sendStatus(400);
			}
		})
		.catch(err => {
			throw Error(err);
		});
});

//DELETE: delete address
router.delete("/:id", auth.optional, (req, res, next) => {
	let { id } = req.params;

	//delete address
	Address.deleteOne({ _id: new ObjectId(id) })
		.then(() => {
			res.sendStatus(200);
		})
		.catch(err => {
			throw Error(err);
		});
});

/* ----------------------- Helper Functions ----------------------- */
//DOES: check for existing address
function _checkExisting(addressIn) {
	let { street, city } = addressIn;
	let result = {};

	//validate existing address
	return Address.findOne({ street: street, city: city })
		.then(existing => {
			if (existing) {
				result.error = "This address already exists.";
				return result;
			} else {
				const finalAddress = new Address(addressIn);
				finalAddress.setDefaults();
				result.address = finalAddress;

				return result;
			}
		})
		.catch(err => {
			throw Error(err);
		});
}

module.exports = router;

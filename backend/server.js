const isDevelopmentMode = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;
const dotenv = require("dotenv").config();
const WebSocket = require("ws");
const express = require("express");

/* ----------------------- Config Express ----------------------- */
const corsConfig = {
	credentials: true,
	origin: "http://localhost:3001"
};
const sessionConfig = {
	secret: "betty's secret",
	resave: true,
	saveUninitialized: true,
	cookie: { secure: false, maxAge: 1200000 }
};

const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
app.use(require("morgan")("dev"));
app.use(require("cookie-parser")());
app.use(require("cors")(corsConfig));
app.use(require("express-session")(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ----------------------- Config Database ----------------------- */
const dbConfig = require("./config/database");
const mongoose = require("mongoose");
mongoose.connect(dbConfig.url, { useNewUrlParser: true }).then(
	() => {
		console.log(
			`${new Date().toUTCString()} - Successfully connected to MongoDB.`
		);
	},
	err => {
		console.log(
			`${new Date().toUTCString()} - Failed to connect to MongoDB. ${err.stack}`
		);
	}
);
mongoose.set("debug", isDevelopmentMode);
mongoose.Promise = global.Promise;

/* ----------------------- Config Routes ----------------------- */
require("./models/Account");
require("./config/passport");
const routes = require("./routes");
app.use(routes);

/* ----------------------- Start App ----------------------- */
app.listen(port, () => {
	console.log(`${new Date().toUTCString()} - Server listening on port ${port}`);
});

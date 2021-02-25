const express = require("express");

const AuthController = require("./controllers/AuthController");
const IndexController = require("./controllers/IndexController");

const routes = express.Router();

routes.get("/", IndexController.show);
routes.get("/stt", AuthController.show);

module.exports = routes;

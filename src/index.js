const express = require("express");
const routes = require("./routes.js");

const app = new express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(routes);

app.listen(3000, () => {
    console.log("==== Azure Speech to Text ====");
});

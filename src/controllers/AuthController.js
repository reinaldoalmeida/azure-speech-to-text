const axios = require("axios");
const process = require("process");

module.exports = {
    async show(req, res) {
        if (process.env.NODE_ENV !== "production") {
            require("dotenv").config();
        }
        axios
            .post(`${process.env.ENDPOINT}`, "", {
                headers: {
                    ["Ocp-Apim-Subscription-Key"]: `${process.env.SUBSCRIPTION_KEY}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                response.log(response.data);
            })
            .catch((error) => {
                console.log("ERROR: ", error);
                return res
                    .status(400)
                    .send({ error: "Azure Code Authentication Failed" });
            });
    },
};

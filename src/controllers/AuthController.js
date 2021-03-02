const axios = require("axios");
const process = require("process");

module.exports = {
    async show(req, res) {
        if (process.env.NODE_ENV !== "production") {
            require("dotenv").config();
        }

        const config = {
            method: "POST",
            url: `${process.env.ENDPOINT}`,
            headers: {
                ["Ocp-Apim-Subscription-Key"]: `${process.env.SUBSCRIPTION_KEY}`,
            },
            data: JSON.stringify({}),
        };

        await axios(config)
            .then((response) => {
                return res.status(200).send(response.data);
            })
            .catch((error) => {
                console.log(
                    `ERROR [${error.response.status}][${error.response.statusText}]`,
                    error.response.data.error.message
                );
                return res
                    .status(400)
                    .send({ error: "Azure Code Authentication Failed" });
            });
    },
};

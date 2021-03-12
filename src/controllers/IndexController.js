const path = require("path");
const process = require("process");

module.exports = {
    async show(req, res) {
        try {
            const view = path.join(process.cwd(), "src/views", "index.html");
            res.sendFile(view);
        } catch (error) {
            console.log(error);
            return res.status(500).send({ error: "Show Index Failed" });
        }
    },
};

const path = require("path");
const process = require("process");
const stt = require("../model/stt.js");

module.exports = {
    async stt(req, res) {
        const { file } = req.query;
        if (!file) return res.status(404).send({ error: "Audio Not Found" });
        try {
            const audioPath = path.join(process.cwd(), "audios", file);
            const recognizedText = await stt.processSTT(audioPath);
            return res.status(200).send(recognizedText);
        } catch (error) {
            console.log(error);
            return res.status(500).send({ error: "Audio Processing Failed" });
        }
    },
};

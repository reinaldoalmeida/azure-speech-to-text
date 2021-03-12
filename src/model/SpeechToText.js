const fs = require("fs");
const path = require("path");
const process = require("process");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

module.exports = {
    async stt(req, res) {
        if (process.env.NODE_ENV !== "production") {
            require("dotenv").config();
        }

        const speechConfig = sdk.SpeechConfig.fromSubscription(
            process.env.SUBSCRIPTION_KEY,
            process.env.REGION
        );
        // speechConfig = sdk.SpeechConfig.fromEndpoint(
        //     `${process.env.ENDPOINT}`,
        //     `${process.env.SUBSCRIPTION_KEY}`
        // );
        speechConfig.speechRecognitionLanguage = "pt-BR";
        const audioPath = path.join(process.cwd(), "audios", "audio-001.wav");
        let pushStream = sdk.AudioInputStream.createPushStream();
        // const audioPath =
        //     "https://stapplessprdimages.blob.core.windows.net/audios/audio-opcao-1.wav";
        fs.createReadStream(audioPath)
            .on("data", function (arrayBuffer) {
                pushStream.write(arrayBuffer.slice());
            })
            .on("end", function () {
                pushStream.close();
            });

        let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

        try {
            // recognizer.recognized = (s, e) => {
            //     if (e.result.reason == "ResultReason.RecognizedSpeech") {
            //         console.log(`RECOGNIZED: Text=${e.result.text}`);
            //         return res
            //             .status(200)
            //             .send(`RECOGNIZED: Text=${e.result.text}`);
            //     } else if (e.result.reason == "ResultReason.NoMatch") {
            //         console.log("NOMATCH: Speech could not be recognized.");
            //         return res
            //             .status(500)
            //             .send({ error: "Audio Processing Failed" });
            //     }
            //     return res
            //         .status(200)
            //         .send(`${e.result.reason}\n\nRECOGNIZED: ${e.result.text}`);
            // };

            recognizer.recognizeOnceAsync((result) => {
                console.log("RECOGNIZED: ", result);
                recognizer.close();
                return res
                    .status(500)
                    .send({ error: "Audio Processing Failed" });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ error: "Audio Processing Failed" });
        }
    },
};

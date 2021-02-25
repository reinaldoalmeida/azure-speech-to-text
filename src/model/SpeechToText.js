const fs = require("fs");
const path = require("path");
const process = require("process");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

function fromFile() {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
        `${process.env.SUBSCRIPTION_KEY}`,
        `${process.env.REGION}`
    );
    speechConfig.speechRecognitionLanguage = "pt-BR";
    let pushStream = sdk.AudioInputStream.createPushStream();
    const audioPath = path.join(process.cwd(), "audios", "audio-001.wav");
    fs.createReadStream(audioPath)
        .on("data", function (arrayBuffer) {
            pushStream.write(arrayBuffer.slice());
        })
        .on("end", function () {
            pushStream.close();
        });

    let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    recognizer.recognizeOnceAsync((result) => {
        console.log("RECOGNIZED: ", result);
        recognizer.close();
    });
}
fromFile();

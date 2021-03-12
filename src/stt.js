const fs = require("fs");
const path = require("path");
const process = require("process");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

(function () {
    if (process.env.NODE_ENV !== "production") {
        require("dotenv").config();
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.SUBSCRIPTION_KEY,
        process.env.REGION
    );
    speechConfig.speechRecognitionLanguage = "pt-BR";
    speechConfig.setProperty(
        sdk.PropertyId[
            sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs
        ],
        "60000"
    );

    const audioPath = path.join(process.cwd(), "audios", "audio-sim.wav");
    let pushStream = sdk.AudioInputStream.createPushStream(
        sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 2)
    );
    fs.createReadStream(audioPath)
        .on("data", function (arrayBuffer) {
            pushStream.write(arrayBuffer.slice());
        })
        .on("end", function () {
            pushStream.close();
        });

    let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.NoMatch) {
            const noMatchDetail = sdk.NoMatchDetails.fromResult(e.result);
            console.log(
                "(recognized)  Reason: " +
                    sdk.ResultReason[e.result.reason] +
                    " | NoMatchReason: " +
                    sdk.NoMatchReason[noMatchDetail.reason]
            );
        } else {
            console.log(
                `(recognized)  Reason: ${
                    sdk.ResultReason[e.result.reason]
                } | Duration: ${e.result.duration} | Offset: ${e.result.offset}`
            );
            console.log(`Text: ${e.result.text}`);
        }
    };

    recognizer.canceled = (s, e) => {
        let str = "(cancel) Reason: " + sdk.CancellationReason[e.reason];
        if (e.reason === sdk.CancellationReason.Error) {
            str += ": " + e.errorDetails;
        }
        console.log(str);
    };

    recognizer.speechEndDetected = (s, e) => {
        console.log(`(speechEndDetected) SessionId: ${e.sessionId}`);
        recognizer.close();
        recognizer = undefined;
    };

    recognizer.startContinuousRecognitionAsync(
        () => {
            console.log("Recognition started");
        },
        (err) => {
            console.trace("err - " + err);
            recognizer.close();
            recognizer = undefined;
        }
    );

    // recognizer.recognizeOnceAsync(
    //     (result) => {
    //         const { privJson } = result;
    //         const { RecognitionStatus, DisplayText } = JSON.parse(privJson);
    //         console.log(RecognitionStatus, DisplayText);
    //         recognizer.close();
    //         recognizer = undefined;
    //     },
    //     function (err) {
    //         console.trace("[ERROR][recognizeOnceAsync] " + err);
    //         recognizer.close();
    //         recognizer = undefined;
    //     }
    // );
})();

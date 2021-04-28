const fs = require("fs");
const process = require("process");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

module.exports.processSTT = async function processSTT(audioFile) {
    if (process.env.NODE_ENV !== "production") {
        require("dotenv").config();
    }

    if (!fs.existsSync(audioFile)) return false;

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

    let pushStream = sdk.AudioInputStream.createPushStream(
        sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 2)
    );
    fs.createReadStream(audioFile)
        .on("data", function (arrayBuffer) {
            pushStream.write(arrayBuffer.slice());
        })
        .on("end", function () {
            pushStream.close();
        });

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    let recognizedJSON = {};
    let recognizedText = "";

    recognizer.recognized = (s, e) => {
        if (
            e.result.reason === sdk.ResultReason.NoMatch &&
            !recognizedJSON.sessionId
        ) {
            const noMatchDetail = sdk.NoMatchDetails.fromResult(e.result);
            console.log(
                "(recognized)  Reason: " +
                    sdk.ResultReason[e.result.reason] +
                    " | NoMatchReason: " +
                    sdk.NoMatchReason[noMatchDetail.reason]
            );
            recognizedJSON = {
                success: false,
                error: sdk.NoMatchReason[noMatchDetail.reason],
            };
            console.log("recognized problem", recognizedJSON);
        } else {
            // console.log(
            //     `(recognized)  Reason: ${
            //         sdk.ResultReason[e.result.reason]
            //     } | Duration: ${e.result.duration} | Offset: ${e.result.offset}`
            // );
            recognizedText += ` ${e.result.text}`;
            recognizedJSON = { success: true, text: recognizedText };
            console.log(
                "recognized in process",
                e.result.duration,
                e.result.offset
            );
        }
    };

    recognizer.canceled = (s, e) => {
        let str = sdk.CancellationReason[e.reason];
        if (e.reason === sdk.CancellationReason.Error) {
            str += ": " + e.errorDetails;
        }
        recognizedJSON = { success: false, error: str };
        console.log("speechEndDetected", recognizedJSON);
        return recognizedJSON;
    };

    recognizer.speechEndDetected = (s, e) => {
        recognizedJSON = {
            success: true,
            text: recognizedText,
            sessionId: e.sessionId,
        };
        console.log("speechEndDetected", recognizedJSON);
        recognizer.close();
        return recognizedJSON;
    };

    recognizer.startContinuousRecognitionAsync(
        () => {
            console.log("Start");
        },
        (err) => {
            recognizedJSON = { success: false, error: err };
            recognizer.close();
            return recognizedJSON;
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
};

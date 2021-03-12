(function () {
    let https = require("https");

    // Replace with your subscription key
    let subscriptionKey = "ac5d205fdb3143a482268bae600791ba";

    // Update with your service region
    let region = "brazilsouth";
    let port = 443;

    // Recordings and locale
    let locale = "pt-BR";
    let recordingsBlobUri =
        "https://stapplessprdspeechtotext.blob.core.windows.net/development/audio-google.wav";

    // Name and description
    let name = "Simple transcription";
    let description = "Simple transcription description";

    let speechToTextBasePath = "/api/speechtotext/v2.0/";

    // These classes show the properties on JSON objects returned by the Speech Service or sent to it.
    /*
    class ModelIdentity {
        id;
    }
    
    class Transcription {
        Name;
        Description;
        Locale;
        RecordingsUrl;
        ResultsUrls;
        Id;
        CreatedDateTime;
        LastActionDateTime;
        Status;
        StatusMessage;
    }
    
    class TranscriptionDefinition {
        Name;
        Description;
        RecordingsUrl;
        Locale;
        Models;
        Properties;
    }
    */

    let ts = {
        Name: name,
        Description: description,
        Locale: locale,
        RecordingsUrl: recordingsBlobUri,
        Properties: {
            PunctuationMode: "DictatedAndAutomatic",
            ProfanityFilterMode: "Masked",
            AddWordLevelTimestamps: "True",
        },
        Models: [],
    };

    let postPayload = JSON.stringify(ts);

    let startOptions = {
        hostname: region + ".cris.ai",
        port: port,
        path: speechToTextBasePath + "Transcriptions/",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": postPayload.length,
            "Ocp-Apim-Subscription-Key": subscriptionKey,
        },
    };

    function printResults(resultUrl) {
        let fetchOptions = {
            headers: {
                "Ocp-Apim-Subscription-Key": subscriptionKey,
            },
        };

        let fetchRequest = https.get(
            new URL(resultUrl),
            fetchOptions,
            function (response) {
                if (response.statusCode !== 200) {
                    console.info(
                        "Error retrieving status: " + response.statusCode
                    );
                } else {
                    let responseText = "";
                    response.setEncoding("utf8");
                    response.on("data", function (chunk) {
                        responseText += chunk;
                    });

                    response.on("end", function () {
                        console.info("Transcription Results:");
                        console.info(responseText);
                    });
                }
            }
        );
    }

    function checkTranscriptionStatus(statusUrl) {
        let fetchOptions = {
            headers: {
                "Ocp-Apim-Subscription-Key": subscriptionKey,
            },
        };

        let fetchRequest = https.get(
            new URL(statusUrl),
            fetchOptions,
            function (response) {
                if (response.statusCode !== 200) {
                    console.info(
                        "Error retrieving status: " + response.statusCode
                    );
                } else {
                    let responseText = "";
                    response.setEncoding("utf8");
                    response.on("data", function (chunk) {
                        responseText += chunk;
                    });

                    response.on("end", function () {
                        let statusObject = JSON.parse(responseText);
                        let done = false;
                        switch (statusObject.status) {
                            case "Failed":
                                console.info(
                                    "Transcription failed. Status: " +
                                        statusObject.statusMessage
                                );
                                done = true;
                                break;
                            case "Succeeded":
                                done = true;
                                printResults(
                                    statusObject.resultsUrls["channel_0"]
                                );
                                break;
                            case "Running":
                                console.info("Transcription is still running.");
                                break;
                            case "NotStarted":
                                console.info("Transcription has not started.");
                                break;
                        }

                        if (!done) {
                            setTimeout(function () {
                                checkTranscriptionStatus(statusUrl);
                            }, 5000);
                        }
                    });
                }
            }
        );

        fetchRequest.on("error", function (error) {
            console.error(error);
        });
    }

    let request = https.request(startOptions, function (response) {
        if (response.statusCode !== 202) {
            console.error("Error, status code " + response.statusCode);
        } else {
            let transcriptionLocation = response.headers.location;

            console.info(
                "Created transcription at location " + transcriptionLocation
            );
            console.info("Checking status.");

            checkTranscriptionStatus(transcriptionLocation);
        }
    });

    request.on("error", function (error) {
        console.error(error);
    });

    request.write(postPayload);
    request.end();
})();

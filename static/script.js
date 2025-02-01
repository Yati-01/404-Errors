window.onload = () => {
    console.log("Script loaded and running");

    let recorder; // Recorder instance
    let isRecording = false; // Flag to track recording status
    let isRecognitionActive = false; // Flag to track speech recognition status

    // Fade in question box
    const questionBox = document.querySelector('.question-box');
    if (questionBox) {
        questionBox.classList.add('fade-in');
    }

    // Text-to-Speech Implementation
    const textToSpeechButton = document.getElementById('textToSpeech');
    textToSpeechButton.addEventListener('click', () => {
        const questionText = document.getElementById('questionText').innerText;
        const utterance = new SpeechSynthesisUtterance(questionText);
        speechSynthesis.speak(utterance);
        textToSpeechButton.classList.add('active-button');
        textToSpeechButton.classList.add('glowing-border'); // Add animation class
        utterance.onend = () => {
            textToSpeechButton.classList.remove('active-button');
            textToSpeechButton.classList.remove('glowing-border'); // Remove animation class
        };
    });

    // Function to start recording
    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const input = audioContext.createMediaStreamSource(stream);
                recorder = new Recorder(input, { numChannels: 1 });
                recorder.record();
                isRecording = true;

                console.log('Recording started.');
            })
            .catch(error => console.error('Error accessing microphone: ', error));
    };

    // Function to stop recording
    const stopRecording = () => {
        if (recorder && isRecording) {
            recorder.stop();
            isRecording = false;

            console.log('Recording stopped.');

            // Export the recorded audio
            recorder.exportWAV(blob => {
                const formData = new FormData();
                formData.append('audio', blob, 'recording.wav');

                console.log('Sending audio file to server...');

                // Send the audio file to the server
                fetch('/upload_audio', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    console.log('File sent successfully.');
                    console.log('Server response:', data);
                    // Log the confidence score to the console
                    if (data.confidence) {
                        console.log(`Confidence Score: ${data.confidence}`);
                        // Update the confidence score display
                        const confidenceScoreDiv = document.getElementById('confidenceScore');
                        confidenceScoreDiv.innerText = `Confidence Score: ${data.confidence.toFixed(3)} %`;

                        // Color code the confidence score
                        if (data.confidence >= 70) {
                            confidenceScoreDiv.style.color = 'green';
                        } else if (data.confidence >= 40) {
                            confidenceScoreDiv.style.color = 'orange';
                        } else {
                            confidenceScoreDiv.style.color = 'red';
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });
        }
    };

    // Function to start voice typing
    const startVoiceTyping = () => {
        if (annyang) {
            annyang.start();
        }
    };

    // Function to stop voice typing
    const stopVoiceTyping = () => {
        if (annyang) {
            annyang.abort();
        }
    };

    // Event listener for the voice typing button
    const voiceTypingButton = document.getElementById('startStopVoiceTyping');
    voiceTypingButton.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
            stopVoiceTyping();
            voiceTypingButton.classList.remove('glowing-border');
            voiceTypingButton.classList.remove('active-button');
            console.log('Voice typing and recording stopped.');
        } else {
            startRecording();
            startVoiceTyping();
            voiceTypingButton.classList.add('glowing-border');
            voiceTypingButton.classList.add('active-button');
            console.log('Voice typing and recording started.');
        }
    });

    // Speech-to-Text Implementation using annyang
    if (annyang) {
        // Define the commands
        const commands = {
            '*text': (text) => {
                const transcriptArea = document.getElementById('transcript');
                transcriptArea.value += ' ' + text; // Append the recognized text
                console.log('Speech recognized: ', text);
            }
        };

        // Add the commands to annyang
        annyang.addCommands(commands);

        // Grab the necessary elements from the DOM
        const answerAudioButton = document.getElementById('answerAudio');
        const transcriptArea = document.getElementById('transcript');

        if (answerAudioButton) {
            // Event listener for starting/stopping the speech recognition when button is clicked
            answerAudioButton.addEventListener('click', () => {
                if (isRecognitionActive) {
                    annyang.abort();
                    isRecognitionActive = false;
                    answerAudioButton.classList.remove('glowing-border');
                    console.log('Speech recognition stopped.');
                } else {
                    annyang.start();
                    isRecognitionActive = true;
                    answerAudioButton.classList.add('glowing-border');
                    console.log('Speech recognition started.');
                }
            });
        }
    }

    // Event listener for the "Send" button
    const sendButton = document.getElementById('submitAnswer');
    sendButton.addEventListener('click', () => {
        const transcriptArea = document.getElementById('transcript');
        const answer = transcriptArea.value;

        // Send the answer to the server
        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answer: answer }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Handle the response from the server
            if (data.next_question) {
                const followUpIndex = data.next_question.indexOf('Follow-up Question:');
                if (followUpIndex !== -1) {
                    const followUpText = data.next_question.substring(followUpIndex + 'Follow-up Question:'.length).trim();
                    document.getElementById('questionText').innerText = followUpText;
                    document.getElementById('panelQuestion').innerText = followUpText;
                } else {
                    document.getElementById('questionText').innerText = data.next_question;
                    document.getElementById('panelQuestion').innerText = data.next_question;
                }
            }
            if (data.feedback) {
                // Display feedback if available
                alert(`Feedback: ${data.feedback}`);
            }
            // Update the side panel with the user's response and accuracy score
            document.getElementById('panelUserResponse').innerText = answer;
            document.getElementById('panelAccuracy').innerText = data.accuracy_score;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
};
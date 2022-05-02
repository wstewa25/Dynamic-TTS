let voiceList = []; // list of api voices to choose from
let voicePairs = {}; // store voices attached to each user

const getVoicesUrl = 'https://texttospeech.googleapis.com/v1/voices?languageCode=en&key=AIzaSyB8iMziuh0HrpQC26c6u3nbFSgP8L0wyro';
const apiPostUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyB8iMziuh0HrpQC26c6u3nbFSgP8L0wyro';

let audioQueue = []; // holds audio and text in the order to read each comment
let playedStack = []; // holds audio and text for comments that have been read

let volumeMax = 1.00; // 1.0 == 100% volume
let volumeMin = 0.00; // == 0%
let currentVolume = 1.00;

//parseFloat(document.getElementById("volValue"))/100;

let readSpeed = {
    default: 1.0,
    twice: 2.0,
    thrice: 3.0,
    max: 4.0,
    half: .5,
    min: .25,
    current: 1.0
};
let processingReadSpeedRequest = false;

// pause or play
function togglePlay() {
    if (audioQueue.length > 0) {
        // pause first item in queue if it's playing
        if (!audioQueue[0][0].paused) {
            audioQueue[0][0].pause();
        } else {
            audioQueue[0][0].play();
        }
    }
}

// go to next comment (down) or the previously played comment (up)
function skipComment(direction) {
    if (direction == "up") {
        if (playedStack.length > 0) { // if length 0, then you're at the beginning of the thread
            stopAudio(audioQueue[0][0]);
            audioQueue.unshift(playedStack.shift()); // make first item in audioQueue the most recent item played
            playAudio(audioQueue[0]);
        }
    } else {
        if (audioQueue.length > 1) { // if length 1, you're at the bottom of the thread
            stopAudio(audioQueue[0][0]);
            playedStack.unshift(audioQueue.shift()); // move audio into playedStack
            playAudio(audioQueue[0]);
        }
    }
}

// go to the next comment thread (the next "<author> says: " comment)
function skipThread(direction) {
    // if a valid next thread comment is found, the comment for that thread is returned
    let result = null;
    if (audioQueue.length > 0)
        result = reddit.skipThread(audioQueue[0][1], direction);

    if (result != null) {
        stopAudio(audioQueue[0][0]);
        let comment = result.author + " says: " + result.body; // convert comment to reader string

        if (direction == "up") {
            let index = find(playedStack, comment); // -1 if nothing is found
            if (index > -1) {
                for (let i = 0; i <= index; i++) { // move played audios back into audioQueue from the front including the found comment
                    audioQueue.unshift(playedStack.shift());
                }
            }
        } else {
            let index = find(audioQueue, comment);
            if (index > -1) {
                for (let i = 0; i < index; i++) {
                    playedStack.unshift(audioQueue.shift()); // stack first items of audioQueue into played, not including the found comment
                }
            }
        }

        playAudio(audioQueue[0]); // resume playing audio
    }
}

// search either audioQueue or playedStack for a comment and return the index of the comment
function find(array, flag) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][1] == flag) {
            return i;
        }
    }

    return -1;
}

// raise/lower volume or set to max or min
function editVolume(amount) {
    if (audioQueue.length > 0) {
        if (amount == "max") {
            currentVolume = volumeMax;
        } else if (amount == "min") {
            currentVolume = volumeMin;
        } else {
            if (currentVolume + amount > volumeMax) { // can't set volume higher than max
                acurrentVolume = volumeMax;
            } else if (currentVolume + amount < volumeMin) { // can't set volume lower than min
                currentVolume = volumeMin;
            } else {
                currentVolume += amount; // if no conflicts then add amount normally
            }
        }
    }
}

// reload audio with new TTS read speed. this restarts from currently reading comment
function editReadSpeed(amount) {
    if (!processingReadSpeedRequest) {
        processingReadSpeedRequest = true;

        if (audioQueue.length > 0) {
            // set the new reading speed for each comment
            let newSpeed = 0;
            if (amount == "max")
                newSpeed = readSpeed.max;
            else if (amount == "min")
                newSpeed = readSpeed.min;
            else {
                if (readSpeed.current + amount > readSpeed.max) // don't let read speed go above max
                    newSpeed = readSpeed.max;
                else if (readSpeed.current + amount < readSpeed.min) // or below min
                    newSpeed = readSpeed.min;
                else
                    newSpeed = readSpeed.current + amount;
            }

            stopAudio(audioQueue[0][0]); // stop playing to indicate new audio is loading

            let tempQueue = [];
            for (let i = 0; i < audioQueue.length; i++) { // queue needs to be moved to temporary arrays and filled with blank strings to be able to test if TTS has finished processing
                tempQueue.push(audioQueue[i]);
                audioQueue[i] = ".";
            }

            let tempStack = [];
            for (let i = 0; i < tempStack.length; i++) { // do the same for stack
                tempStack.push(playedStack[i]);
                playedStack[i] = ".";
            }

            // process new audios
            for (let i = 0; i < tempQueue.length; i++) {
                callTTS(tempQueue[i][1], i, newSpeed, "queue");
            }

            for (let i = 0; i < tempStack.length; i++) {
                callTTS(tempStack[i][1], i, newSpeed, "stack");
            }

            // because callTTS is asynchronous, i need to test every 100ms whether all of the audios have finished processing
            let tester = setInterval(() => {
                let equal = true;
                for (let i = 0; i < tempQueue.length; i++) { // loop through each spot in tempQueue to see if audioQueue has each comment's audio ready
                    if (audioQueue[i][1] != tempQueue[i][1]) {
                        equal = false;
                        break;
                    }
                }

                for (let i = 0; i < tempStack.length; i++) { // then loop through each spot in tempStack to see if playedStack has finished loading
                    if (playedStack[i][1] != tempStack[i][1]) {
                        equal = false;
                        break;
                    }
                }

                if (equal) {
                    clearInterval(tester);
                    playAudio(audioQueue[0]); // only play audio once audio has finished loading
                    processingReadSpeedRequest = false;
                }
            }, 100);
        }
    }
}

// reverse reading order of comments
function toggleOrder() {
    let temp = []; // temporarily hold items of audioQueue

    while (audioQueue.length > 0) { // store all remaining queue items in temp
        temp.push(audioQueue.shift());
    }
    audioQueue.unshift(temp.shift()); // get back currently playing audio

    while (playedStack.length > 0) { // move all previous comments into queue
        audioQueue.push(playedStack.shift());
    }

    while (temp.length > 0) { // move old queue items into stack
        playedStack.unshift(temp.shift());
    }

    // console.log(audioQueue, playedStack);
}

document.addEventListener('DOMContentLoaded', function(e) {
    //** object to receive audioContent response from api call
    let voiceListBody = {};

    //** GET tts voice list call, returns object with array, then puts array in voiceList
    axios.get(getVoicesUrl)
        .then(function (response) {
            // console.log(response);
            voiceListBody = response.data;
            // console.log("voiceListBody: ");
            // console.log(voiceListBody);
            voiceList = voiceListBody.voices;
            // console.log("voiceList: ");
            // console.log(voiceList);
        })
        .catch(function (error) {
            console.log(error);
        }
    );
});

function playAudio(audio) {
    console.log(audio[0]);
    if (!audio[0] || !(audio[0] instanceof Audio)) return false; // don't attempt to play audio if it's invalid

    audio[0].volume = currentVolume;
    audio[0].play();

    audio[0].addEventListener('ended', audioEnds); // don't play next comment audio until current audio has finished

    return true;
}

function audioEnds() {
    audioQueue[0][0].removeEventListener('ended', audioEnds);
    playedStack.unshift(audioQueue.shift());

    if (audioQueue.length > 0) // length 0 indicates every comment has been read
        playAudio(audioQueue[0]);
}

function stopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.removeEventListener('ended', audioEnds); // if the event listener isn't removed then another listener will be added to it later if it plays again
}

function assignVoice(comment) {
    let author = comment.split(" ")[0]; // comment string starts with author and will have first space right after, so no need to worry about any other spaces in the string

    for (let user in voicePairs) { // if a user has a voice already, then just return its index in voiceList
        if (user == author) {
            return voicePairs[user];
        }
    }

    // since user hasn't appeared in the thread yet, assign them a voice
    voicePairs[author] = Math.floor(Math.random() * voiceList.length);
    console.log(voicePairs);
    return voicePairs[author];
}

async function callTTS(comment, index, speed = readSpeed.default, audioList = "queue"){
    // console.log("comment to send off:\n" + comment.toString());
    readSpeed.current = speed; // set new global read speed

    //** pick random voice
    let randomIndex = assignVoice(comment);
    // console.log('rando index: '+ randomIndex);
    languageCode = JSON.stringify(voiceList[randomIndex].languageCodes);
    voiceName = voiceList[randomIndex].name;
    ssmlVoiceGender = voiceList[randomIndex].ssmlGender;
    sampleRateHertz = voiceList[randomIndex].naturalSampleRateHertz;

    let input = { 
        text: comment
    };

    // languageCode mandatory, other 2 optional
    let voice = {
        languageCode: languageCode.toString(),
        name: voiceName.toString(),
        ssmlGender: ssmlVoiceGender.toString()
    };

    // audioEncoding mandatory, others optional
    let audioConfig = {
        audioEncoding: "MP3",
        speakingRate: speed,
        sampleRateHertz: sampleRateHertz.toString()
    };

    let data = await postData(apiPostUrl, { input, voice, audioConfig }); // call to tts api to get audio content

    responseBody = data;
    base64string = responseBody.audioContent; // convert to base64 to be passed along to audio method to be read in-program
    // console.log("base64 string: " + base64string);
    audioUrl = 'data:audio/mp3;base64,' + base64string;

    let clip = new Audio(audioUrl);
    
    if (audioList == "queue")
        audioQueue[index] = [ clip, comment ]; // insert at a certain spot in audioQueue instead of pushing because different comments will load at different times
    else if (audioList == "stack")
        playedStack[index] = [ clip, comment ];
}

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });

    

    return response.json(); // parses JSON response into native JavaScript objects
}

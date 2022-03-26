let voiceList =[]; // list of api voices to choose from

const getVoicesUrl = 'https://texttospeech.googleapis.com/v1/voices?languageCode=en&key=AIzaSyB8iMziuh0HrpQC26c6u3nbFSgP8L0wyro';
const apiPostUrl= 'https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyB8iMziuh0HrpQC26c6u3nbFSgP8L0wyro';

let audioQueue = []; // holds audio and text in the order to read each comment

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

    let butt_listener = document.getElementById("readThreadTestButton"); // button click to tell tts to start
    butt_listener.addEventListener("click", function(){
        // console.log(readerList);
        audioQueue = []; // re-initialize the queue each time a request is made
        for (let i = 0; i < readerList.length; i++)
            audioQueue.push("."); // fill the queue with nonsense strings so that each index is non-null. this is important for filling each index spot with content asynchronously

        for (let i = 0; i < readerList.length; i++) { // convert each string in reader list to audio content ready to be played
            callTTS(readerList[i], i);
        }

        console.log(audioQueue);
        
        // because callTTS is asynchronous, this part of the method is reached before audioQueue is properly set up
        // this creates a repeating timer that checks if audioQueue has been properly filled every 100ms
        let tester = setInterval(() => {
            let equal = true;
            for (let i = 0; i < readerList.length; i++) { // loop through each spot in readerList to see if audioQueue has each comment's audio ready
                if (audioQueue[i][1] != readerList[i]) {
                    equal = false;
                    break;
                }
            }

            if (equal) {
                clearInterval(tester);
                playAudio(audioQueue.shift()[0]); // only play audio once audioQueue matches readerList
            }
        }, 100);
    });
});

function playAudio(audio) {
    if (!audio || !(audio instanceof Audio)) return false; // don't attempt to play audio if it's invalid

    audio.play();

    audio.addEventListener('ended', function() { // don't play next comment audio until current audio has finished
        if (audioQueue.length > 0) // length 0 indicates every comment has been read
            playAudio(audioQueue.shift()[0]);
    })

    return true;
}

async function callTTS(comment, index){
    // console.log("comment to send off:\n" + comment.toString());

    //** pick random voice
    var randomIndex = Math.floor(Math.random() * voiceList.length);
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
        sampleRateHertz: sampleRateHertz.toString()
    };

    let data = await postData(apiPostUrl, { input, voice, audioConfig }); // call to tts api to get audio content

    responseBody = data;
    base64string = responseBody.audioContent; // convert to base64 to be passed along to audio method to be read in-program
    // console.log("base64 string: " + base64string);
    audioUrl = 'data:audio/mp3;base64,' + base64string;

    let clip = new Audio(audioUrl);
    
    audioQueue[index] = [ clip, input.text ]; // insert at a certain spot in audioQueue instead of pushing because different comments will load at different times
    
    // let s = "";
    // for (let i = 0; i < readerList.length; i++) {
    //     if (!audioQueue[i])
    //         s += "null\n\n";
    //     else
    //         s += audioQueue[i] + "\n\n";
    // }
    // console.log(s);
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

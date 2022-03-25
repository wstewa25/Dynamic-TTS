
/** Variables for JSON objects **/
var textToRead="hello there"; //string
var languageCode="en-US"; //string
var voiceName=""; //string
const ssmlVoiceGender="MALE"; //enum
const audioEncoding="MP3"; //enum
var speakingRate=""; //double
var pitch=""; //double
var volumeGainDb=""; //double
var sampleRateHertz=""; //int
var audioContent=""; //string
const apiPostUrl= 'https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyB8iMziuh0HrpQC26c6u3nbFSgP8L0wyro';
var base64string="";

document.addEventListener('DOMContentLoaded', function(event) {

    /**** input, voice, and audioConfig are the required objects to pass into the API
     * input.text, voice.languageCode, and audioConfig.audioEncoding are all mandatory parameters
     * everything else that is comment beneath the objects is optional to pick voices
     * or alter the audio ****/
    var input = {}
    var voice = {}
    var audioConfig ={}

    //** this casts the objects into JSON strings for api
    var formBody= {input, voice, audioConfig}
    var form  = JSON.stringify(formBody);

    //** object to receive audioContent response from api call
    var responseBody = {}

    document.getElementById("submit_text").addEventListener("click", function(){

        //** readstr gets text from the textbox in prototype extension
        var readstr = document.getElementById("test_read").value;
        console.log("got text box info: " + readstr);

        //mandatory
        input.text = readstr.toString();

        //languageCode mandatory, other 2 optional
        voice.languageCode = languageCode.toString()
        // voice.name = voiceName.toString()
        // voice.ssmlGender = ssmlVoiceGender.toString()

        //audioEncoding mandatory, others optional
        audioConfig.audioEncoding = audioEncoding.toString()
        // audioConfig.speakingRate = speakingRate.toString()
        // audioConfig.pitch = pitch.toString()
        // audioConfig.volumeGainDb = volumeGainDb.toString()
        // audioConfig.sampleRateHertz = sampleRateHertz.toString()
        // "effectsProfileId": [
        //     string
        // ]

        //** Axios style post request --  working, preferred
        axios.post(apiPostUrl, {
            input, voice, audioConfig
        })
            .then(function (response) {
                console.log(response);
                responseBody = response.data;
                base64string = responseBody.audioContent;
                console.log("base64 string: " + base64string)
                var audioClip = new Audio('data:audio/mp3;base64,' + base64string);
                audioClip.play();
            })
            .catch(function (error) {
                console.log(error);
            });
    });
})

//** Old XMLHttp style http post request for api call -- working
// let xhr = new XMLHttpRequest();
// xhr.open("POST", apiPostUrl);
// xhr.setRequestHeader("Accept", "application/json");
// xhr.setRequestHeader("Content-Type", "application/json");
// xhr.onreadystatechange = function () {
//     if (xhr.readyState === 4) {
//         console.log(xhr.responseText);
//         responseBody = JSON.parse(xhr.response);
//
//     }};
// xhr.send(form);

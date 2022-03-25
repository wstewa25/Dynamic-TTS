document.addEventListener('DOMContentLoaded', function(event) {
    var input = {}
    var voice = {}
    var audioConfig = {}
    var playPromise;
    //var isEnded = false;
    var audioClip = document.createElement("AUDIO");
    var audioUrl;
    var audio = new Audio();
    //** this casts the objects into JSON strings for api
    var formBody = {input, voice, audioConfig}
    var form = JSON.stringify(formBody);
    let audioQueue = new Queue();
    let audioArray =[];
    //** object to receive audioContent response from api call
    var responseBody = {}
    let index = 0;

    document.getElementById("readThreadTestButton").addEventListener("click", function(){
        console.log("other button is pressed");
        parseComments(readThread);
    });

    function parseComments(readThread) {
        console.log("parseComments has started");
        console.log(readThread.length);
        let readstr;
        for (let i = 0; i < readThread.length; i++) {
            console.log(i);
            readstr = readThread[i].author + " says " + readThread[i].body;
            readComment(readstr);
            if (typeof readThread[i].replies !== undefined && readThread[i].replies.length != 0) {
                parseComments(readThread[i].replies);
            }
        }
        //playQueue();
        playAudio(audioQueue.dequeue());
    }

    function playAudio(audio) {
        if (!audio || !(audio instanceof Audio)) return;
        audio.addEventListener('ended', function() {
            index++;
            playAudio(audioQueue.dequeue());
        })
        audio.play();
    }

    //*** OLD QUEUE ATTEMPT
    //  function playQueue() {
    //     for (let i = 0; i < audioQueue.length; i++) {
    //         let clip = new Audio(audioQueue.dequeue());
    //         clip.addEventListener('play', onplay, false);
    //         clip.addEventListener('playing', onplaying, false);
    //         clip.addEventListener('ended', onended, false);
    //         var isEndend = clip[i].ended;
    //     }
    // }

    function readComment(readstr) {
        console.log("readComment has started");
        //mandatory
        input.text = readstr.toString();

        //languageCode mandatory, other 2 optional
        voice.languageCode = languageCode.toString()
        // voice.name = voiceName.toString()
        // voice.ssmlGender = ssmlVoiceGender.toString()

        //audioEncoding mandatory, others optional
        audioConfig.audioEncoding = "OGG_OPUS"
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
                audioUrl = 'data:audio/mp3;base64,' + base64string;
                // play(audioUrl);

                let clip = new Audio(audioUrl);
                audioQueue.enqueue(clip);
                audioArray.push(clip);
            })
            .catch(function (error) {
                console.log(error);
            });

    }
});

class Queue {
    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }
    enqueue(element) {
        this.elements[this.tail] = element;
        this.tail++;
    }
    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }
    peek() {
        return this.elements[this.head];
    }
    get length() {
        return this.tail - this.head;
    }
    get isEmpty() {
        return this.length === 0;
    }
}

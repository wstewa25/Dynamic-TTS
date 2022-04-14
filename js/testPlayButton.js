document.addEventListener('DOMContentLoaded', function(e) {
    let butt_listener = document.getElementById("readThreadTestButton"); // button click to tell tts to start
    butt_listener.addEventListener("click", function(){
        // console.log(readerList);
        audioQueue = []; // re-initialize the queue each time a request is made
        for (let i = 0; i < readerList.length; i++)
            audioQueue.push("."); // fill the queue with blank strings so that each index is non-null. this is important for filling each index spot with content asynchronously

        for (let i = 0; i < readerList.length; i++) { // convert each string in reader list to audio content ready to be played
            callTTS(readerList[i], i);
        }

        // console.log(audioQueue);
        
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
                playAudio(audioQueue[0]); // only play audio once audioQueue matches readerList
            }
        }, 100);
    });
});
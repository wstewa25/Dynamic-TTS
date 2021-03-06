let readerList = [];

// just holds tab url
let activeTab = "";
let tabTrimmed = "";

let reddit = new redditor();

function init() {
    // everything needs to execute after the active tab has been found
    getCurrentTab().then(result => {
        main();
    });
}

function trimURL(url) {
    let maxLength = 20; // maximum character length

    if (url.includes("file://")) { // if tab is a file from machine
        let urlBeginning = url.substring(0, 7); // keep "file://"
        let split = url.split("/"); // split at / to isoalte the file name
        let newURL = urlBeginning + split[split.length - 1];

        if (newURL.length > maxLength) // don't let name exceed max character length
            newURL = newURL.substring(0, maxLength) + "...";

        return newURL;
    } else if (url.includes("chrome://")) { // if tab is a chrome page
        if (url.length > maxLength)
            url = url.substring(0, maxLength) + "...";

        return url;
    } else { // website
        // detach "http(s)://www." prefix if it exists in the tab name
        let split = url.split("://");
        let newURL = split[split.length - 1];

        if (newURL.includes("www.")) { // separated from http(s):// in case a url has one or the other but not both
            newURL = newURL.substring(4);
        }

        // i only want the website name
        newURL = newURL.split("/")[0];

        if (newURL.length > maxLength)
            newURL = newURL.substring(0, maxLength) + "...";
        
        return newURL;
    }
}

function main() {
    activeTab = document.getElementById("currentTab").innerHTML;
    tabTrimmed = trimURL(activeTab);

    if (activeTab.includes("reddit.com/")) { // only works if you're viewing a submission
        if (activeTab.includes("/comments/")) {
            let submissionID = activeTab.split("/");
            submissionID = submissionID[submissionID.indexOf("comments") + 1]; // post id comes after /comments/

            reddit.getComments(submissionID);

            // wait just a bit for program to catch up before making readerList
            setTimeout(function() {
                readerList = reddit.readThread();
                for (let i = 0; i < readerList.length; i++) {
                    console.log(readerList[i]);
                }
            }, 1000);
        }
    }
}

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    document.getElementById("currentTab").innerHTML = tab.url;
    document.getElementById("currentTab").style.display = "none";
    return tab;
  }

window.onload = function() {
    init();
//function to switch to miniplayer when play button clicked, not implemented for now.
    // let play_listener = document.getElementById("play"); // play button makes miniplayer pop up
    // play_listener.addEventListener("click", function(){
    //     window.location.assign("/miniplayer.html");
    //     init();
    // }); 

    let volumePlus = document.getElementById("volumePlus");
    let volumeMinus = document.getElementById("volumeMinus");
    let volumePlusPlus = document.getElementById("volumePlusPlus");
    let volumeMinusMinus = document.getElementById("volumeMinusMinus");
    let speedPlus = document.getElementById("speedPlus");
    let speedMinus = document.getElementById("speedMinus");
    let speedPlusPlus = document.getElementById("speedPlusPlus");
    let speedMinusMinus = document.getElementById("speedMinusMinus");
    let close = document.getElementById("close");
    let pause = document.getElementById("pause");
    let skip_forward = document.getElementById("forwardComment");
    let skip_thread = document.getElementById('forwardThread');
    let back = document.getElementById("backComment");
    let back_thread = document.getElementById('backThread');
    let stop = document.getElementById("stop");

    volumePlus.addEventListener("click", function(){
        let volume = document.getElementById("volValue").innerHTML;
        if (parseInt(volume) != 100){
            editVolume(0.01);
            let newVolume = parseInt(volume);
            newVolume = newVolume + 1;
            document.getElementById("volValue").innerHTML = newVolume;
        }
    });
    volumeMinus.addEventListener("click", function(){
        let volume = document.getElementById("volValue").innerHTML;
        if (parseInt(volume) != 0){
            editVolume(-0.01);
            let newVolume = parseInt(volume);
            newVolume = newVolume - 1;
            document.getElementById("volValue").innerHTML = newVolume;
        }
    });
    volumePlusPlus.addEventListener("click", function(){
        let volume = document.getElementById("volValue").innerHTML;
        if (parseInt(volume) != 100){
            editVolume(0.10);
            let newVolume = parseInt(volume);
            newVolume = newVolume + 10;
            document.getElementById("volValue").innerHTML = newVolume;
        }
    });
    volumeMinusMinus.addEventListener("click", function(){
        let volume = document.getElementById("volValue").innerHTML;
        if (parseInt(volume) != 0){
            editVolume(-0.10);
            let newVolume = parseInt(volume);
            newVolume = newVolume - 10;
            document.getElementById("volValue").innerHTML = newVolume;
        }
    });

    speedPlus.addEventListener("click", function(){
        let speed = document.getElementById("speedValue").innerHTML;
        if (parseFloat(speed) != 4.00){
            editReadSpeed(0.25);
            let newSpeed = parseFloat(speed);
            newSpeed = newSpeed + 0.25;
            document.getElementById("speedValue").innerHTML = newSpeed;
        }
    });
    speedMinus.addEventListener("click", function(){
        let speed = document.getElementById("speedValue").innerHTML;
        if (parseFloat(speed) != 0.25){
            editReadSpeed(-0.25);
            let newSpeed = parseFloat(speed);
            newSpeed = newSpeed - 0.25;
            document.getElementById("speedValue").innerHTML = newSpeed;
        }
    });
    speedPlusPlus.addEventListener("click", function(){
        let speed = document.getElementById("speedValue").innerHTML;
        if (parseFloat(speed) <= 3.00){
            editReadSpeed(1.00);
            let newSpeed = parseFloat(speed);
            newSpeed = newSpeed + 1.00;
            document.getElementById("speedValue").innerHTML = newSpeed;
        } else {
            editReadSpeed(4.00-speed);
            let newSpeed = parseFloat(speed);
            newSpeed = newSpeed + (4.00-speed);
            document.getElementById("speedValue").innerHTML = newSpeed;
        }
    });
    speedMinusMinus.addEventListener("click", function(){
        let speed = document.getElementById("speedValue").innerHTML;
        if (parseFloat(speed) >= 1.25){
            editReadSpeed(-1.00);
            let newSpeed = parseFloat(speed);
            newSpeed = newSpeed - 1.00;
            document.getElementById("speedValue").innerHTML = newSpeed;
        } else {
            editReadSpeed(-speed + 0.25);
            let newSpeed = 0.25
            document.getElementById("speedValue").innerHTML = newSpeed;
        }
    });

    pause.addEventListener('click', function(){
        if (pause.innerHTML == '<i class="material-icons">pause</i>')
            pause.innerHTML = '<i class="material-icons">play_arrow</i>';
        else
            pause.innerHTML = '<i class="material-icons">pause</i>';
    });

    pause.addEventListener("click", function (){
        togglePlay();
     });
 
     skip_forward.addEventListener("click", function(){
         skipComment("down");
     });

     skip_thread.addEventListener("click", function(){
        skipThread("down");
    });

    back.addEventListener("click", function(){
        skipComment("up");
    });

    back_thread.addEventListener("click", function(){
       skipThread("up");
   });

   stop.addEventListener("click", function(){
    stopAudio(audioQueue[0][0]);
   });

    function getQueryString() {
        return location.search ? parseQueryString(location.search) : {};
    }
    
    function parseQueryString(search) {
        if (search.charAt(0) != '?') throw new Error("Invalid argument");
        var queryString = {};
        search.substr(1).replace(/\+/g, '%20').split('&').forEach(function(tuple) {
            var tokens = tuple.split('=');
            queryString[decodeURIComponent(tokens[0])] = tokens[1] && decodeURIComponent(tokens[1]);
        })
        return queryString;
    }
    
    function closePlayerPage(){
        var queryString = getQueryString();
        location.href = queryString.referer;
    }
    
    document.getElementById('close').addEventListener('click',
    closePlayerPage);
}



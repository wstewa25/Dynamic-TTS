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
    activeTab = document.getElementById("tabName").innerHTML;
    tabTrimmed = trimURL(activeTab);
    document.getElementById("tabName").innerHTML = tabTrimmed;

    if (activeTab.includes("reddit.com/")) { // only works if you're viewing a submission
        if (activeTab.includes("/comments/")) {
            let submissionID = activeTab.split("/");
            submissionID = submissionID[submissionID.indexOf("comments") + 1]; // post id comes after /comments/

            reddit.getComments(submissionID);

            // wait just a bit for program to catch up before making readerList
            setTimeout(function() {
                readerList = reddit.readThread();
                // for (let i = 0; i < readerList.length; i++) {
                //     console.log(readerList[i]);
                // }
            }, 1000);
        }
    }
}

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    document.getElementById("tabName").innerHTML = tab.url;
    return tab;
  }

window.onload = function() {
    init();

    let play_listener = document.getElementById("play"); // play button makes miniplayer pop up
    play_listener.addEventListener("click", function(){
        chrome.windows.create({
            url: chrome.runtime.getURL("miniplayer.html"),
            type: "panel",
            width: 700,
            height: 350
          });
    });
};



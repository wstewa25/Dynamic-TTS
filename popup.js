// connects to my personal reddit account to get posts
let r = new snoowrap({
    userAgent: 'dynamic tts',
    clientId: 'd3eJD1-Na1mmQ9On_Z13VQ',
    clientSecret: 'lMbGouAYBy5wTO2C8bjyAqqiqKCYSQ',
    refreshToken: '43864152-vNRzhp9pvLRDmjtt8NCI2lxqz2Zy1w'
});

// just holds tab url
let activeTab = "";

function init() {
    // everything needs to execute after the active tab has been found
    getCurrentTab().then(main);
}

function trimURL(url) {
    let maxLength = 20; // maximum character length

    if (url.includes("file://")) { // if tab is a file from machine
        let urlBeginning = url.substring(0, 7);
        let split = url.split("/");
        let newURL = urlBeginning + split[split.length - 1];

        if (newURL.length > maxLength)
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

        if (newURL.includes("www.")) {
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

    if (activeTab.includes("reddit.com/")) { // only works if you're viewing a submission
        if (activeTab.includes("/comments/")) {
            let thread = [];
            let submissionID = activeTab.split("/");
            submissionID = submissionID[submissionID.indexOf("comments") + 1]; // post id comes after /comments/

            // grabs replies only until the first loaded set on the page
            r.getSubmission(submissionID).expandReplies({limit: 1, depth: 1}).catch({ statusCode: 429 }, function() {}).then(s => {
                // get author, comment text, and replies in the format i set for each individual comment
                s.comments.forEach(c => {
                    thread.push(getAllReplies(c));
                });
            });

            console.log(thread);
        }
    }
}

function getAllReplies(comment) {
    // set comment to this format
    let c = {
        author: comment.author.name,
        body: comment.body,
        replies: []
    };

    // get each reply and loop recursively so all comments are in the same format
    comment.replies.forEach(r => {
        c.replies.push(getAllReplies(r));
    });

    // a comment that has no replies will skip the foreach loop and go here and return the properly formatted comment
    return c;
}

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    document.getElementById("tabName").innerHTML = trimURL(tab.url);
    return tab;
  }

window.onload = function() {
    init();
};

/* ******************************************************************************** */
/*
 * keyboard commands to implement:
 * pause / play
 * skip comment
 * move backwards 1 comment
 * fast forward
 * slow down
 * set read speed to max
 * set read speed to minimum
 * set tts to read comments in forward/reverse order
 * (reddit) skip a thread forward or backward
 */

//let tts = class tts {
// save default keyboard bindings in order to be able to restore if needed
let keyDefaults = {
    // pause or play recording
    pausePlay: [ "Space" ], // stored in arrays to allow for any function to require multiple keys
    // move forward one comment
    commentDown: [ "ArrowDown" ],
    // move backward one comment
    commentUp: [ "ArrowUp" ],
    // move forward one thread (reddit)
    threadDown: [ "Control", "ArrowDown" ], // js has "ControlLeft" and "ControlRight", both should be viable
    // move backward one thread (reddit)
    threadUp: [ "Control", "ArrowUp" ],
    // increment tts recording in syllables per second (sps)
    speedUp: [ "ArrowRight" ],
    // decrement tts recording in sps
    slowDown: [ "ArrowLeft" ],
    // set read speed to max
    speedMax: [ "Control", "ArrowRight" ],
    // set read speed to min
    speedMin: [ "Control", "ArrowLeft" ],
    // read comments in forward or backward order
    orderToggle: [ "Control", "Comma" ], // js has "AltLeft" and "AltRight", both should be viable
    // increment volume by 1 unit
    volumeUp: [ "Comma" ],
    // decrement volume by 1 unit
    volumeDown: [ "Period" ],
};

let keybinds = keyDefaults; // second dictionary should be used for active keybinds that can be changed
// use one key to tell extension that it should use its keybinds
keyDefaults.masterKey = "Shift"; // js has "ShiftLeft" and "ShiftRight", both should be viable
let masterKey = keyDefaults.masterKey;
let masterPressed = false;
let keyStrokes = {};

// execute a keybind that's actively pressed down
function keyAction(keybind) {
    switch (keybind) {
        case "pausePlay":
            console.log("pause / play");
            break;
        case "commentDown":
            console.log("1 comment fwd");
            break;
        case "commentUp":
            console.log("1 comment bwd");
            break;
        case "threadDown":
            console.log("1 thread fwd");
            break;
        case "threadUp":
            console.log("1 thread bwd");
            break;
        case "speedUp":
            console.log("speed up");
            break;
        case "slowDown":
            console.log("slow down");
            break;
        case "speedMax":
            console.log("speed max");
            break;
        case "speedMin":
            console.log("speed min");
            break;
        case "orderToggle":
            console.log("toggle read direction");
            break;
        case "volumeUp":
            console.log("volume up");
            break;
        case "volumeDown":
            console.log("volume down");
            break;
        default:
            console.log(keybind);
            break;
    }
}

// trim string if it matches two-sided keys
function trimKey(key) {
    let k = "";

    if (key.includes("Control"))
        k = "Control";
    else if (key.includes("Shift"))
        k = "Shift";
    else if (key.includes("Alt"))
        k = "Alt";
    else
        k = key;

    return k;
}

// get keypress, down or up, and determine if a keybind is being entered
function getKey(e) {
    // all keys being actively pressed down will be set to true, while all actively up will be false
    keyStrokes[e.code] = e.type == "keydown";

    // get a list of only actively pressed down keys
    let activeKeys = [];
    for (let key in keyStrokes) {
        let k = trimKey(key);

        // don't include master since it is not a part of any keybind
        if (keyStrokes[key] && k != masterKey)
            activeKeys.push(k);
    }

    // test if master key is being pressed
    let key = trimKey(e.code);
    if (key == masterKey && e.type == "keydown" && activeKeys.length == 0) { // must be the first key
        masterPressed = true;
    }

    // once master is no longer being pressed
    if (key == masterKey && e.type == "keyup") {
        masterPressed = false;
    }

    // skip this process during an iteration where no keys are pressed
    if (activeKeys.length > 0) {
        // only useable once master is active
        if (masterPressed) {
            // iterate through each set keybind to see if one is being requested
            for (let bind in keybinds) {
                if (listsMatch(keybinds[bind], activeKeys)) { // if active keys pressed match a keybind then send off to keybind function
                    keyAction(bind);
                }
            }
        }
    }
}

function changeKeybind(keybind, newKeys) {
    if (newKeys.length == 0) {
        console.log("no new keys requested");
        return false;
    }
    // master cannot be part of any keybind
    if (newKeys.includes(masterKey)) {
        console.log("cannot use master in keybind");
        return false;
    }

    // find the keybind being requested to change
    for (let bind in keybinds) {
        if (bind == keybind) {
            keybinds[bind] = newKeys;
            return true;
        }
    }

    return false;
}

function changeMasterKey(newKey) {
    // find all keybinds containing requested master key, if any
    let conflicts = [];
    for (let bind in keybinds) {
        if (keybinds[bind].includes(newKey)) {
            conflicts.push(bind);
        }
    }

    // alert all conflicting keybinds and then quit
    if (conflicts.length > 0) {
        console.log("conflicts with " + conflicts);
        console.log("change these keybinds before setting new master.")
        return false;
    } else {
        // no conflicts
        masterKey = newKey;
        return true;
    }
}

// test if lists match but can be in different orders
function listsMatch(a, b) {
    if (a.length != b.length)
        return false;

    // iterate through a and see if item then exists in b
    for (let i = 0; i < a.length; i++) {
        let inB = false;

        for (let j = 0; j < b.length; j++) {
            if (a[i] == b[j]) {
                inB = true;
                break;
            }
        }

        if (!inB) {
            return false;
        }
    }

    return true;
}
//};

window.addEventListener('keydown', getKey);
window.addEventListener('keyup', getKey);

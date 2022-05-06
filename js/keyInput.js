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
    // move forward one thread
    threadDown: [ "Control", "ArrowDown" ], // js has "ControlLeft" and "ControlRight", both should be viable
    // move backward one thread
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
    toggleOrder: [ "Control", "Comma" ],
    // increment volume by 1 unit
    volumeUp: [ "Period" ],
    // decrement volume by 1 unit
    volumeDown: [ "Comma" ],
};
// use one key to tell extension that it should use its keybinds
keyDefaults.masterKey = "Shift"; // js has "ShiftLeft" and "ShiftRight", both should be viable
let keybinds = keyDefaults; // second dictionary should be used for active keybinds that can be changed

let masterKey = keyDefaults.masterKey;
let masterPressed = false;
let keyStrokes = {};

async function keybindsFromStorage() {
    for (let key in keybinds) {
        //var  keyName = key.toString();
        console.log("key name = " + key);
        console.log("key value = " + keybinds[key]);

     await chrome.storage.sync.get([key], function (result) {
            if (result[key] != undefined) {
                changeKeybind(key, result[key]);
                console.log(key + " now = " + result[key])
            } else {
                console.log("Failed to change keybind. " + key + " = " + result[key]);
            }
        });
    }
}
keybindsFromStorage();

// This shows that the storage is actually persisting....
chrome.storage.sync.get(['pausePlay'], function(result){
    console.log("val actually is " + result.pausePlay);
});

// execute a keybind that's actively pressed down
function keyAction(keybind) {
    switch (keybind) {
        case "pausePlay":
            togglePlay();
            break;
        case "commentDown":
            skipComment("down");
            break;
        case "commentUp":
            skipComment("up");
            break;
        case "threadDown":
            skipThread("down");
            break;
        case "threadUp":
            skipThread("up");
            break;
        case "speedUp":
            editReadSpeed(.25);
            break;
        case "slowDown":
            editReadSpeed(-.25);
            break;
        case "speedMax":
            editReadSpeed("max");
            break;
        case "speedMin":
            editReadSpeed("min");
            break;
        case "orderToggle":
            toggleOrder();
            break;
        case "volumeUp":
            editVolume(.05);
            break;
        case "volumeDown":
            editVolume(-.05);
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
            console.log("CHANGED Key! new " + bind + " key = " + newKeys);
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
        keybinds.masterKey = newKey;
        console.log("changeMasterKey: MASTER key changed! new key = " + newKey);
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

// /*
//  * keyboard commands to implement:
//  * pause / play
//  * skip comment
//  * move backwards 1 comment
//  * fast forward
//  * slow down
//  * set tts to read comments in forward/reverse order
//  * (reddit) skip a thread forward or backward
//  */

// //let tts = class tts {
// // save default keyboard bindings in order to be able to restore defaults if needed
// let keyDefaults = {
//     // pause or play recording
//     pausePlay: [ "Space" ], // stored in arrays to allow for any function to require multiple keys
//     // move forward one comment
//     commentDown: [ "ArrowDown" ],
//     // move backward one comment
//     commentUp: [ "ArrowUp" ],
//     // move forward one thread (reddit)
//     threadDown: [ "Control", "ArrowDown" ], // js has "ControlLeft" and "ControlRight", both should be viable
//     // move backward one thread (reddit)
//     threadUp: [ "Control", "ArrowUp" ],
//     // increment tts recording in syllables per second (sps)
//     speedUp: [ "ArrowRight" ],
//     // decrement tts recording in sps
//     slowDown: [ "ArrowLeft" ],
//     // read comments in forward or backward order
//     orderToggle: [ "Control", "Alt" ] // js has "AltLeft" and "AltRight", both should be viable
// };

// // use one key to tell extension that it should use its keybinds
// let masterKey = "Shift"; // js has "ShiftLeft" and "ShiftRight", both should be viable
// let keyStrokes = {};
// let keybinds = keyDefaults; // second dictionary should be used for active keybinds that can be changed

// function keyAction(keybind) {
//     switch (keybind) {
//         case "pausePlay":
//             console.log("pause / play");
//             break;
//         case "commentDown":
//             console.log("1 comment fwd");
//             break;
//         case "commentUp":
//             console.log("1 comment bwd");
//             break;
//         case "threadDown":
//             console.log("1 thread fwd");
//             break;
//         case "threadUp":
//             console.log("1 thread bwd");
//             break;
//         case "speedUp":
//             console.log("speed up");
//             break;
//         case "slowDown":
//             console.log("slow down");
//             break;
//         case "orderToggle":
//             console.log("toggle read direction");
//             break;
//         default:
//             break;
//     }
// }

// function getKey(e) {
//     // all keys being actively pressed down will be set to true, while all actively up will be false
//     keyStrokes[e.code] = e.type == "keydown";
//     console.log(keyStrokes);

//     let activeKeys = [];
//     for (let key in keyStrokes) {
//         let k = "";
//         if (key.includes("Control"))
//             k = "Control";
//         if (key.includes("Shift"))
//             k = "Shift";
//         if (key.includes("Alt"))
//             k = "Alt";
//         else
//             k = key;

//         activeKeys.push(k);
//     }

        
//     // iterate through each set keybind to see if one is being requested
//     for (let bind in keybinds) {
//         if (listsMatch(keybinds[bind], activeKeys)) // if active keys pressed match a keybind then send off to keybind function
//             keyAction(bind);
//     }
// }

// // test if lists match but can be in different orders
// function listsMatch(a, b) {
//     if (a.length != b.length)
//         return false;

//     // iterate through a and see if item then exists in b
//     for (let i in a) {
//         let inB = false;
//         for (let j in b) {
//             if (i == j) {
//                 inB = true; // quit looping once the item is found
//                 break;
//             }
//         }

//         // if i cannot be found in b then the lists don't match
//         if (!inB)
//             return false;
//     }

//     return true;
// }
// //};

// window.addEventListener('keydown', getKey);
// window.addEventListener('keyup', getKey);






//"js": ["miniscreen.js"]
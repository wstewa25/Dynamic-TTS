// // const r = new snoowrap({
// //     userAgent: 'dynamic tts',
// //     clientId: 'd3eJD1-Na1mmQ9On_Z13VQ',
// //     clientSecret: 'lMbGouAYBy5wTO2C8bjyAqqiqKCYSQ',
// //     refreshToken: '43864152-vNRzhp9pvLRDmjtt8NCI2lxqz2Zy1w'
// // });

// let activeTab = null;

// function main() {
//     //while (true) {
//         asyncCallback();

//         if (activeTab != null) {
//             document.getElementById("output").innerHTML = activeTab.url;
//         }
//     //}
// }

// function asyncCallback() {
//     getCurrentTab();
// }

// async function getCurrentTab() {
//     let queryOptions = { active: true, currentWindow: true };
//     let [tab] = await chrome.tabs.query(queryOptions, function(tabs) {
//         activeTab = tabs[0];
//     });
//   }

// // chrome.webRequest.onBeforeRequest.addListener(
// //     function(details) {
// //         document.getElementById("output").innerHTML = "on reddit";
// //     },
// //     { urls: ["*://*.reddit.com/*"] },
// //     []
// // );

// window.onload = function() {
//     main();
// };
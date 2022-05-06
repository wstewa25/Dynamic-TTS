document.addEventListener("DOMContentLoaded", function(){

});
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('close').addEventListener('click',
    closeSettingsPage);

// Saves options to chrome.storage
function save_options() {
    var playPauseVal = document.getElementById('pausePlay').value;
    var comDownVal = document.getElementById('commentDown').value;
    var comUpVal = document.getElementById('commentUp').value;
    var speedUpVal = document.getElementById('speedUp').value;
    var slowDownVal = document.getElementById('slowDown').value;

    let settingVals = {
        pausePlay: playPauseVal,
        commentDown: comDownVal,
        commentUp: comUpVal,
        speedUp: speedUpVal,
        slowDown: slowDownVal
    };

    chrome.storage.sync.set(settingVals, function() {
        // Update status to let user know options were saved.

        for(let setting in settingVals)
        //console.log("storage sync set pausePlay should = " + playPauseVal);

            //check to see if it stored
        chrome.storage.sync.get([setting], function(result){
            console.log("setting.js setting is " + result[setting]);
        });

        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

}

function openSettingsPage(){
    location.href = "settings.html?referer=" + encodeURIComponent(location.pathname + location.search);
}

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

function closeSettingsPage(){
    var queryString = getQueryString();
    location.href = queryString.referer;
}


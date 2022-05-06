document.addEventListener("DOMContentLoaded", function(){

});
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('close').addEventListener('click',
    closeSettingsPage);

// Saves options to chrome.storage
function save_options() {
    // var color = document.getElementById('color').value;
    // var likesColor = document.getElementById('like').checked;
    // var masterKeyVal = document.getElementById('masterKey').value;
    // changeMasterKey(masterKeyVal);
    //
    var playPauseVal = document.getElementById('pausePlay').value;
    // changeKeybind('pausePlay', playPauseVal);


    chrome.storage.sync.set({
        pausePlay: playPauseVal

    }, function() {
        // Update status to let user know options were saved.
        console.log("storage sync set pausePlay should = " + playPauseVal);

        chrome.storage.sync.get(['pausePlay'], function(result){
            console.log("val actually is " + result.pausePlay);
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


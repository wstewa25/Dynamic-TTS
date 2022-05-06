document.addEventListener("DOMContentLoaded", function(){
    function openPlayerPage(){
        location.href = "miniplayer.html?referer=" + encodeURIComponent(location.pathname + location.search);
    }
    
    function getQueryString() {
        return location.search ? parseQueryString(location.search) : {};
    }

    function openSettingsPage(){
        location.href = "settings.html?referer=" + encodeURIComponent(location.pathname + location.search);
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
    
    let settings = document.getElementById("settings");
    let openReader = document.getElementById("openPlayer");
    let exit = document.getElementById("exit");
    
    settings.addEventListener('click', function() {
        openSettingsPage();
    });
    openPlayer.addEventListener('click', function(){
        openPlayerPage();
    });
    exit.addEventListener('click', function(){
        window.close();
    });
});



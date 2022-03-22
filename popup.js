let r = new snoowrap({
    userAgent: 'dynamic tts',
    clientId: 'd3eJD1-Na1mmQ9On_Z13VQ',
    clientSecret: 'lMbGouAYBy5wTO2C8bjyAqqiqKCYSQ',
    refreshToken: '43864152-vNRzhp9pvLRDmjtt8NCI2lxqz2Zy1w'
});

let activeTab = "";

function init() {
    getCurrentTab().then(main);
}

function main() {
    activeTab = document.getElementById("output").innerHTML;
    
    r.getSubmission('4j8p6d').expandReplies({limit: Infinity, depth: Infinity}).then(console.log)
}

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    document.getElementById("output").innerHTML = tab.url;
    return tab;
  }

window.onload = function() {
    init();
};
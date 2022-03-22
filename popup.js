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

    if (activeTab.includes("reddit.com/r/")) {
        if (activeTab.includes("/comments/")) {
            let thread = [];
            let submissionID = activeTab.split("/");
            submissionID = submissionID[submissionID.indexOf("comments") + 1];

            r.getSubmission(submissionID).expandReplies({limit: 1, depth: 1}).catch({ statusCode: 429 }, function() {}).then(s => {
                s.comments.forEach(c => {
                    thread.push({ 
                        author: c.author.name, 
                        body: c.body
                    });
                });
            });
            // r.getSubmission('4j8p6d').expandReplies({limit: 1, depth: 1}).catch({ statusCode: 429 }, function() {}).then(console.log);

            console.log(thread);
        }
    }
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
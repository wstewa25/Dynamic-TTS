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

function main() {
    activeTab = document.getElementById("output").innerHTML;

    if (activeTab.includes("reddit.com/r/")) { // only works if you're viewing a submission
        if (activeTab.includes("/comments/")) {
            let thread = [];
            let submissionID = activeTab.split("/");
            submissionID = submissionID[submissionID.indexOf("comments") + 1]; // post id comes after /comments/

            // grabs replies only until the first loaded set on the page
            r.getSubmission(submissionID).expandReplies({limit: 1, depth: 1}).catch({ statusCode: 429 }, function() {}).then(s => {
                // get author and comment text for each individual comment
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
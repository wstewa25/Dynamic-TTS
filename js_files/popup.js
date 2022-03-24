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

    // a comment that has no replies will skip the foreach loop and go here, and return the properly formatted comment
    return c;
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
class redditor {
    constructor() {
        // connects to my personal reddit account to get posts
        this.r = new snoowrap({
            userAgent: 'dynamic tts',
            clientId: 'd3eJD1-Na1mmQ9On_Z13VQ',
            clientSecret: 'lMbGouAYBy5wTO2C8bjyAqqiqKCYSQ',
            refreshToken: '43864152-vNRzhp9pvLRDmjtt8NCI2lxqz2Zy1w'
        });

        this.thread = [];
    }

    getComments(submissionID) {
        // grabs replies only until the first loaded set on the page
        this.r.getSubmission(submissionID).expandReplies({limit: 1, depth: 1}).catch({ statusCode: 429 }, function() {}).then(s => {
            // get author, comment text, and replies in the format i set for each individual comment
            s.comments.forEach(c => {
                this.thread.push(this.getAllReplies(c));
            });
        });

        // adding some fake comments to test if spoilers are re-formatted
        this.thread.push({
            author: 'fake_user_1',
            body: '>!this is a message with a spoiler at the beginning',
            replies: []
        });

        // put spoilers in different areas to make sure any spot works
        this.thread.push({
            author: 'fake_user_2',
            body: 'this is a message >!with a spoiler in the middle',
            replies: []
        });

        this.thread.push({
            author: 'fake_user_3',
            body: 'this is a message with a spoiler at the >!end',
            replies: []
        });
    }

    getAllReplies(comment) {
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
    
        // a comment that has no replies will skip the foreach loop and go here and return the properly formatted comment
        return c;
    }

    unpackComment(comment, flag, list) {
        comment.body = this.reformatComment(comment.body); // fix comment to not read off formatted links and warn about spoilers
        list.push(comment.author + " " + flag + ": " + comment.body);
    
        comment.replies.forEach(r => {
            this.unpackComment(r, "replies");
        });
    }
    
    // iterate through each comment and its replies to make a one-dimensional array of ordered comments to read
    readThread() {
        let comments = [];
        for (let i = 0; i < this.thread.length; i++) {
            this.unpackComment(this.thread[i], "says", comments);
        }
    
        return comments;
    }

    trimURL(url) {
        if (!url.includes(".")) { // in-site link to somewhere else won't have a period anywhere in the link
            return "reddit.com";
        } else {
            // detach "http(s)://www." prefix if it exists in the tab name
            let split = url.split("://");
            let newURL = split[split.length - 1];
    
            if (newURL.includes("www.")) { // separated from http(s):// in case a url has one or the other but not both
                newURL = newURL.substring(4);
            }
    
            // i only want the website name
            newURL = newURL.split("/")[0];
            return newURL;
        }
    }

    reformatComment(comment) {
        // all fields used in formatting links
        let link = {
            textOpen: {
                index: 0,
                symbol: '[',
                active: false
            },
            textClose: {
                index: 0,
                symbol: ']',
                active: false
            },
            linkOpen: {
                index: 0,
                symbol: '(',
                active: false
            },
            linkClose: {
                index: 0,
                symbol: ')',
                active: false
            },
            active: false
        };

        // all fields for formating spoilers
        let spoiler = {
            open1: {
                index: 0,
                symbol: '>',
                active: false
            },
            open2: {
                index: 0,
                symbol: '!',
                active: false
            },
            active: false
        }

        let commentURL = "";
        for (let i = 0; i < comment.length; i++) {
            // if ) has been found, then a user has definitely attempted to embed a link
            if (link.linkClose.active) {
                commentURL = this.trimURL(commentURL); // trim url to get very short version
                let urlFill = "link to " + commentURL; // "link to" tells user a link has been embedded

                comment = comment.substring(0, link.linkOpen.index + 1) + urlFill + comment.substring(link.linkClose.index); // reformat comment around new url

                i = link.linkOpen.index + 1 + urlFill.length; // change i so that loop continues normally after )

                // re initialize. for some reason js does not want me to loop through the dict
                link.textOpen.active = false;
                link.textOpen.index = 0;
                link.textClose.active = false;
                link.textClose.index = 0;

                link.linkOpen.active = false;
                link.linkOpen.index = 0;
                link.linkClose.active = false;
                link.linkClose.index = 0;

                commentURL = "";
            }

            // gather all characters in the url
            if (link.active) {
                if (comment[i] == link.linkClose.symbol) {
                    link.linkClose.active = true;
                    link.linkClose.index = i;
                    link.active = false;
                } else {
                    commentURL += comment[i];
                }
            }

            // if the next character after ] is (, then a user is using a url format. if not, then the user was not embedding a link
            if (link.textClose.active && !link.active) {
                if (comment[i] == link.linkOpen.symbol) {
                    link.linkOpen.active = true;
                    link.linkOpen.index = i;
                    link.active = true;
                } else {
                    link.textOpen.active = false;
                    link.textOpen.index = 0;
                    link.textClose.active = false;
                    link.textClose.index = 0;
                }
            }

            // find if user [encased text in square braces]
            if (link.textOpen.active) {
                if (comment[i] == link.textClose.symbol) {
                    link.textClose.active = true;
                    link.textClose.index = i;
                }
            }

            // start testing for a formatted link
            if (comment[i] == link.textOpen.symbol) {
                link.textOpen.active = true;
                link.textOpen.index = i;
            }

            // spoiler doesn't and shouldn't be removed, but a "spoiler alert: " will be attached so the user knows one is coming up
            if (spoiler.active) {
                let insert = "spoiler alert: ";

                comment = comment.substring(0, i - 2) + insert + comment.substring(i); // reformat comment to fit new injected string and remove '>!'
                i += insert.length; // change i to continue normally after "spoiler alert: "

                // re initialize
                spoiler.open1.active = false;
                spoiler.open1.index = 0;
                spoiler.open2.active = false;
                spoiler.open2.index = 0;

                spoiler.active = false;
            }

            // if ! does not proceed >, then the user is not making a spoiler
            if (spoiler.open1.active && comment[i] != spoiler.open2.symbol) {
                spoiler.open1.active = false;
                spoiler.open1.index = 0;
            }

            // look for use of !
            if (comment[i] == spoiler.open2.symbol) {
                spoiler.open2.active = true;
                spoiler.open2.index = i;
                spoiler.active = true;
            }

            // look for use of >
            if (comment[i] == spoiler.open1.symbol) {
                spoiler.open1.active = true;
                spoiler.open1.index = i;
            }
        }

        return comment;
    }
}
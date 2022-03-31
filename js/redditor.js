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

        // adding some fake comments to test if comments are re-formatted
        // this.thread.push({
        //     author: 'fake_user_1',
        //     body: 'this is a message >!with a spoiler in the middle',
        //     replies: []
        // });

        // this.thread.push({
        //     author: 'fake_user_2',
        //     body: 'this message has 2 links. one link is to https://www.reddit.com/r/LodedDiper/. the other link is to https://www.youtube.com/. whoo',
        //     replies: []
        // });
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
            c.replies.push(this.getAllReplies(r));
        });
    
        // a comment that has no replies will skip the foreach loop and go here and return the properly formatted comment
        return c;
    }

    unpackComment(comment, flag, list) {
        comment.body = this.reformatComment(comment.body); // fix comment to not read off formatted links and warn about spoilers
        list.push(comment.author + " " + flag + ": " + comment.body);
    
        comment.replies.forEach(r => {
            this.unpackComment(r, "replies", list);
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
        // test regex for url expression to see how many a comment contains
        let matchURL = comment.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

        if (matchURL) { // if urls are found
            matchURL.forEach(url => {
                comment = comment.replace(url, '... link to ' + this.trimURL(url) + '... '); // replace with trimmed url
            });
        }

        // not all links on reddit are URLs, sometimes they're in-site links
        // URLs already caught previously will be queried if they're in reddit's hyperlink format, but that's fine
        let linkFormFound = true;
        do {
            let matchForm = comment.match(/\[.*\]\(.*\)/i); // look for '[...](...)'

            if (matchForm) {
                let text = matchForm[0].split("]")[0].substring(1); // remove '['

                let link = matchForm[0].split("(")[1];
                link = link.substring(0, link.length - 1); // remove ')'
                
                if (!link.includes("... link to"))
                    link = "... link to " + this.trimURL(link) + "... "; // avoid seeing "link to... ...link to..."
                else
                    link = this.trimURL(link);

                let insertIndex = comment.indexOf(matchForm[0]); // replace comment with new format
                comment = comment.replace(matchForm[0], '');
                comment = comment.substring(0, insertIndex) + text + link + comment.substring(insertIndex);
            } else {
                linkFormFound = false;
            }
        } while (linkFormFound);

        // find all instances of spoilers and replace them with spoiler warning
        comment = comment.replace(">!", "spoiler alert... ");

        // remove bolding
        comment = comment.replace("**", '');

        // remove bold + italics
        comment = comment.replace("***", '');

        return comment;
    }

    skipThread(comment, direction) {
        let split = comment.split(":"); // isolate "user says/replies" and comment text
        let c = {
            author: split[0].split(" ")[0],
            body: comment.substring(comment.indexOf(split[1]) + 1) // + 1 necessary for the space after :, sub necessary for any instances of : in comment body
        }

        if (direction == "up") { // previous thread
            for (let i = 0; i < this.thread.length; i++) {
                // search comment + all replies of each parent comment for the one the TTS is currently on
                if (this.findComment(this.thread[i], c)) {
                    if (i > 0) { // if i == 0 then user is at the first thread
                        return this.thread[i - 1];
                    } else
                        return null;
                }
            }

            // no result found
            return null;
        } else { // next thread
            for (let i = 0; i < this.thread.length; i++) {
                if (this.findComment(this.thread[i], c)) {
                    if (i < this.thread.length - 1) { // if i == last index then user is at the last thread
                        return this.thread[i + 1];
                    } else
                        return null;
                }
            }

            return null;
        }
    }

    findComment(comment, flag) {
        // console.log(comment, flag);
        // console.log(comment.author == flag.author && comment.body == flag.body);
        if (comment.author == flag.author && comment.body == flag.body) { // comment was found in a given thread
            return true;
        }

        for (let i = 0; i < comment.replies.length; i++) { // test each reply recursively to find the comment if it exists
            if (this.findComment(comment.replies[i], flag)) {
                return true;
            }
        }

        return false; // comment not found in thread
    }
}

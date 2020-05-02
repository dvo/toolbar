function calculatePageScore(numLikes, numDislikes) {
    let score = numLikes + numDislikes;
    score = (numLikes / score) * 100;
    score = Math.round(score);
    if (isNaN(score) || score === undefined) {
        return 0;
    } else {
        return score;
    }
}

async function isEmpty(table, pageUrl, type) {
    return new Promise(resolve => {
        user.get(table).get(pageUrl).get(type).once(function (data) {
            if (data === undefined) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

async function countComments(pageUrl) {
    return new Promise(async resolve => {
        await user.get('pageReviews').get(pageUrl).get('comments').once(function (data) {
            if (data === undefined || data === null) {
                resolve(0);
            } else {
                let len = Object.keys(data).length - 1;
                resolve(len);
            }
        });
    });
}

async function getProfilePicture(pageUrl) {
    return new Promise(resolve => {
        user.get('profile').get(user.is.pub).get('photo').once(function (photo) {
            resolve(photo);
        });
    });
}

async function getName() {
    return new Promise(resolve => {
        user.get('profile').get(user.is.pub).get('name').once(function (name) {
            resolve(name);
        });
    });
}

async function getWebIdOrigin(webId) {
    let a = document.createElement("a");
    a.href = webId;
    return a.origin;
}

async function openComments() {
    let url = await getPageUrl();
    async function getPageUrl() {
        return new Promise(resolve => {
            chrome.tabs.query({
                'active': true,
                'lastFocusedWindow': true
            }, function (tabs) {
                resolve(tabs[0].url);
            });
        });
    }
    var left = (screen.width - 554) / 2;
    let popup =
        window.open("comments.html?url=" + url, "Comments", "width=554,height=554,left=" + left + ", top=20,status=no,scrollbars=yes,resizable=no");
}

async function deleteComment(pageUrl, commentId, ports) {
    let url = `https://devolution.inrupt.net/public/DVO/comments/${commentId}.html`;
    fileClient.deleteFile(url).then(fileDeleted => {
        console.log(`Deleted file ${fileDeleted}.`);
        user.get('pageReviews').get(pageUrl).get('comments').get(commentId).put(null)
    }, err => console.log(err));
    port.postMessage({
        type: 'commentDeleted'
    });
}

async function updateComment(pageUrl, commentId, update, port) {
    let webId = await user.get('profile').get(user.is.pub).get('webId');
    let webIdOrigin = await getWebIdOrigin(webId);
    let url = `${webIdOrigin}/public/DVO/comments/${commentId}.html`;
    fileClient.updateFile(url, update, 'text/html').then(success => {
        console.log(`Updated ${url}.`)
    }, err => console.log(err));
}

async function getPageComments(pageUrl, port) {
    let chain = user.get('pageReviews').get(pageUrl).get('comments');
    let empty = await isEmpty();
    if (empty) {
        let comments = await getComments(port);
        setTimeout(async function () {
            let len = Object.keys(comments).length;
            if (len > 0) {
                comments.sort((a, b) => (a.score > b.score) ? 1 : (a.score === b.score) ? ((a.likes > b.likes) ? 1 : -1) : -1);
                await getFilteredComments(comments, port);
            } else {
                port.postMessage({
                    type: "empty"
                });
            }
        }, 500);
    } else {
        port.postMessage({
            type: "empty"
        });
    }

    async function isEmpty() {
        return new Promise(resolve => {
            chain.once(function (data) {
                if (data === undefined) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    // This would be better as on() instead of once() and call getFilteredComments() each time a new comment is added
    async function getComments() {
        let array = [];
        let obj = {};
        return new Promise(async resolve => {
            await chain.map().once(async function (data) {
                //console.log(data);
                if (data !== null) {
                    obj = {
                        commentId: data.commentId,
                        userId: data.userId,
                        date: data.date,
                        likes: data.likes,
                        dislikes: data.dislikes,
                        hasLiked: false,
                        hasDisliked: false,
                        score: 0
                    }
                    array.push(obj);
                }
            });
            resolve(array);
        });
    }

    async function getFilteredComments(comments) {
        let array = [];
        let obj = {};
        await comments.forEach(async function (data, index) {
            if (data !== null) {
                // put these in separate function e.g. getProfileData()

                setTimeout(async function () {
                    let webId = await user.get('profile').get(data.userId).get('webId');
                    // need to change profileUrl to profileDomain or something like that
                    let profileDomain = await user.get('profile').get(data.userId).get('profileUrl');
                    let profileUrl = `http://${profileDomain}/profile/profile.html?webId=${webId}`;
                    let photo = await solid.data[webId].vcard$hasPhoto;
                    let name = await solid.data[webId].vcard$fn;
                    let webIdOrigin = await getWebIdOrigin(webId);
                    let url = `${webIdOrigin}/public/DVO/comments/${data.commentId}.html`;
                    let comment = await getCommentFromPod(url);
                    let score = calculatePageScore(data.likes, data.dislikes); //maybe need to change name of function
                    obj = {
                        commentId: data.commentId,
                        comment: comment,
                        date: data.date,
                        photo: `${photo}`,
                        name: `${name}`,
                        webId: profileUrl,
                        likes: data.likes,
                        dislikes: data.dislikes,
                        hasLiked: false, //to do
                        hasDisliked: false, //to do
                        score: score
                    }
                    console.log(obj);
                    port.postMessage({
                        type: "getPageComments",
                        comment: obj
                    });
                }, 1500);
            }
        });
    }

    async function getCommentFromPod(url) {
        return new Promise(resolve => {
            fileClient.readFile(url).then(file => {
                resolve(file);
            }, err => {
                resolve("Error getting file from " + url);
            });
        });
    }

    /*async function getPageLikes(commentId) {
        return new Promise(resolve => {
            user.get('pageReviews').get(commentId).get('likes').once(function (data) {
                resolve(data.likes);
            });
        });
    }

    async function getPageDislikes(commentId) {
        return new Promise(resolve => {
            user.get('pageReviews').get(commentId).get('likes').once(function (data) {
                resolve(data.likes);
            });
        });
    }*/
}

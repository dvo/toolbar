async function likeComment(pageUrl, commentId, reactType, port) {
    let likes = 0;
    let dislikes = 0;
    let likedAlready = false;
    let dislikedAlready = false;
    let score = 0;
    let pubKey = user.is.pub;
    let chain = user.get('pageReviews').get(pageUrl).get('comments').get(commentId);
    let hasLikes = await hasData('likes');
    let hasDislikes = await hasData('dislikes');

    if (hasLikes) {
        likes = await getPageLikes();
        likedAlready = await chain.get('users').get('likes').get(pubKey);
    }

    if (hasDislikes) {
        dislikes = await getPageDislikes();
        dislikedAlready = await chain.get('users').get('dislikes').get(pubKey);
    }

    console.log(`${likes} / ${dislikes} / ${likedAlready} / ${dislikedAlready}`);

    if (reactType === 'like') {
        if (!likedAlready) {
            likes++;
            chain.get('likes').put(likes);
            chain.get('users').get('likes').get(pubKey).put(true);
        }

        if (likedAlready) {
            likes--;
            chain.get('likes').put(likes);
            chain.get('users').get('likes').get(pubKey).put(false);
        }

        if (dislikedAlready) {
            dislikes--;
            chain.get('dislikes').put(dislikes);
            chain.get('users').get('dislikes').get(pubKey).put(false);
        }
    } else if (reactType === 'dislike') {
        if (!dislikedAlready) {
            dislikes++;
            chain.get('dislikes').put(dislikes);
            chain.get('users').get('dislikes').get(pubKey).put(true);
        }

        if (dislikedAlready) {
            dislikes--;
            chain.get('dislikes').put(dislikes);
            chain.get('users').get('dislikes').get(pubKey).put(false);
        }

        if (likedAlready) {
            likes--;
            chain.get('likes').put(likes);
            chain.get('users').get('likes').get(pubKey).put(false);
        }
    }

    score = calculatePageScore(likes, dislikes);

    port.postMessage({
        type: 'getCommentLikes',
        likes: likes,
        dislikes: dislikes,
        score: score,
        likedAlready: likedAlready,
        dislikedAlready: dislikedAlready
    });

    async function getPageLikes() {
        return new Promise(resolve => {
            chain.get('likes').once(function (data) {
                resolve(data);
            });
        });
    }

    async function getPageDislikes() {
        return new Promise(resolve => {
            chain.get('dislikes').once(function (data) {
                resolve(data);
            });
        });
    }

    async function hasData(type) {
        return new Promise(resolve => {
            chain.get(type).once(function (data) {
                if (data === undefined) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
}
async function likePage(pageUrl, reactType, port) {
    let likes = 0;
    let dislikes = 0;
    let likedAlready = false;
    let dislikedAlready = false;
    let score = 0;
    let pubKey = user.is.pub;
    let chain = user.get('pageReviews').get(pageUrl);
    // isEmpty() is from utils.js
    let likesChainIsEmpty = await isEmpty('pageReviews', pageUrl, 'likes');
    let dislikesChainIsEmpty = await isEmpty('pageReviews', pageUrl, 'dislikes');

    if (!likesChainIsEmpty) {
        likes = await getPageLikes();
        likedAlready = await chain.get('likes').get('users').get(pubKey);
    }

    if (!dislikesChainIsEmpty) {
        dislikes = await getPageDislikes();
        dislikedAlready = await chain.get('dislikes').get('users').get(pubKey);
    }

    if (reactType === 'like') {
        if (!likedAlready) {
            likes++;
            await chain.get('likes').put({
                likes: likes
            });
            await chain.get('likes').get('users').get(pubKey).put(true);
        }

        if (likedAlready) {
            likes--;
            await chain.get('likes').put({
                likes: likes
            });
            await chain.get('likes').get('users').get(pubKey).put(false);
        }

        if (dislikedAlready) {
            dislikes--;
            await chain.get('dislikes').put({
                dislikes: dislikes
            });
            await chain.get('dislikes').get('users').get(pubKey).put(false);
        }
    } else if (reactType === 'dislike') {
        if (!dislikedAlready) {
            dislikes++;
            await chain.get('dislikes').put({
                dislikes: dislikes
            });
            await chain.get('dislikes').get('users').get(pubKey).put(true);
        }

        if (dislikedAlready) {
            dislikes--;
            await chain.get('dislikes').put({
                dislikes: dislikes
            });
            await chain.get('dislikes').get('users').get(pubKey).put(false);
        }

        if (likedAlready) {
            likes--;
            await chain.get('likes').put({
                likes: likes
            });
            await chain.get('likes').get('users').get(pubKey).put(false);
        }
    }

    score = calculatePageScore(likes, dislikes);

    port.postMessage({
        type: 'getPageLikes',
        likes: likes,
        dislikes: dislikes,
        score: score,
        likedAlready: likedAlready,
        dislikedAlready: dislikedAlready
    });

    async function getPageLikes() {
        return new Promise(resolve => {
            chain.get('likes').once(function (data) {
                resolve(data.likes);
            });
        });
    }

    async function getPageDislikes() {
        return new Promise(resolve => {
            chain.get('dislikes').once(function (data) {
                resolve(data.dislikes);
            });
        });
    }
}

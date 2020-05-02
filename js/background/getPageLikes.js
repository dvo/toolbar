async function getPageLikes(pageUrl, port) {
    let likes = 0;
    let dislikes = 0;
    let likedAlready = false;
    let dislikedAlready = false;
    let score = 0;
    let pubKey = user.is.pub;
    let likesChain = user.get('pageReviews').get(pageUrl).get('likes');
    let dislikesChain = user.get('pageReviews').get(pageUrl).get('dislikes');
    let likesChainIsEmpty = await isEmpty('pageReviews', pageUrl, 'likes');
    let dislikesChainIsEmpty = await isEmpty('pageReviews', pageUrl, 'dislikes');

    if (!likesChainIsEmpty) {
        likes = await getPageLikes();
        likedAlready = await likesChain.get('users').get(pubKey);
    }

    if (!dislikesChainIsEmpty) {
        dislikes = await getPageDislikes();
        dislikedAlready = await dislikesChain.get('users').get(pubKey);
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
            likesChain.once(function (data) {
                resolve(data.likes);
            });
        });
    }

    async function getPageDislikes() {
        return new Promise(resolve => {
            dislikesChain.once(function (data) {
                resolve(data.dislikes);
            });
        });
    }
    
    return true;
}

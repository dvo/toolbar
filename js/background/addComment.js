async function addComment(pageUrl, commentId, comment, date, port) {
    user.get('pageReviews').get(pageUrl).get('comments').get(commentId).put({
        commentId: commentId,
        comment: comment,
        date: date,
        userId: user.is.pub,
        likes: 0,
        dislikes: 0,
        score: 100
    });

    let webId = await user.get('profile').get(user.is.pub).get('webId');
    let photo = await solid.data[webId].vcard$hasPhoto;
    let fullName = await solid.data[webId].vcard$fn;
    let webIdOrigin = await getWebIdOrigin(webId);
    console.log(webIdOrigin);
    let url = `https://devolution.inrupt.net/public/DVO/comments/${commentId}.html`;
    fileClient.createFile(url).then(fileCreated => {
        console.log(`Created file ${fileCreated}.`);
        fileClient.updateFile(fileCreated, comment, 'text/html').then(success => {
            console.log(`Updated ${url}.`);
            let obj = {
                commentId: commentId,
                comment: comment,
                date: date,
                photo: `${photo}`,
                name: `${fullName}`,
                webId: webId
            }
            port.postMessage({
                type: "addComment",
                comment: obj
            });
        }, err => console.log(err));
    }, err => console.log(err));
}

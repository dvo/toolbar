//var gun = Gun(['https://aqueous-sea-01664.herokuapp.com/gun']);
//var gun = Gun(['https://aqueous-sea-01664.herokuapp.com/gun'], ['http://localhost:5000/gun']);
var gun = Gun();
var user = gun.user();

const fileClient = SolidFileClient;
(async function () {
    const session = await solid.auth.currentSession();
})();

// This doesn't seem to do anything
/*user.recall({
    sessionStorage: true
});*/

/************* API for websites and external extensions (NOTE: Internal API is below) *************/

chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(async function (request) {


        // This is so the web page can check that the extension is installed
        if (request.type === 'ping') {
            port.postMessage({
                type: "pong"
            });
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // This should be renamed to 'logout'
        if (request.type === "clearLocalStorage") {
            //if (window.confirm(`Clear DVO localStorage`)) {
            user.leave();
            localStorage.clear();
            //}
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        if (request.type === "storeSolidSessionToken") {
            if (window.confirm(`Please confirm that you want to login`)) {
                let u = request.sessionToken.webId;
                let p = request.password;

                //This needs to be in the try/catch
                let sessionToken = JSON.stringify(request.sessionToken);
                localStorage.setItem("session", sessionToken);

                const session = await solid.auth.currentSession();
                console.log(session);

                let profileInfo = {
                    webId: u,
                    photo: 'images/profilepic.jpg',
                    profileUrl: request.profileUrl
                }

                console.log(profileInfo);

                try {
                    await user.create(u, p, function () {
                        user.auth(u, p, function (msg) {
                            user.get('profile').get(user.is.pub).put(profileInfo);
                        });
                    });
                } catch (e) {
                    console.log(e);
                    await user.auth(u, p, function (msg) {
                        console.log(msg);
                    });
                }
            }
        }
    });
});


/***** Internal API for toolbar *****/

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function (request) {

        if (request.type === "openComments") {
            openComments();
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        if (request.type === "getPageComments") {
            getPageComments(request.pageUrl, port)
            return true;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        if (request.type === "addComment") {
            if (window.confirm(`Confirm add comment`)) {
                addComment(request.pageUrl, request.commentId, request.comment, request.date, port);
            }
            return true;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        if (request.type === "likeComment") {
            if (window.confirm(`Confirm like comment`)) {
                likeComment(request.pageUrl, request.commentId, request.reactType, port);
            }
            return true;
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////// 
        if (request.type === "deleteComment") {
            if (window.confirm(`Confirm delete comment`)) {
                deleteComment(request.pageUrl, request.commentId, port);
            }
            return true;
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////// 
        if (request.type === "updateComment") {
            if (window.confirm(`Confirm edit comment`)) {
                updateComment(request.pageUrl, request.commentId, request.update, port);
            }
            return true;
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////// 
        if (request.type === "likePage") {
            if (window.confirm(`Confirm like page`)) {
                likePage(request.pageUrl, request.reactType, port);
            }
            return true;
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////// 
        if (request.type === "getPageLikes") {
            if (user.is) {
                getPageLikes(request.pageUrl, port);
            }
            return true;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        if (request.type === "getPageComments") {
            getPageComments(request.pageUrl, port)
            return true;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        if (request.type === "countComments") {
            // still need to filter out undefined, nulls and duplicates
            let num = await countComments(request.pageUrl);
            setTimeout(function () {
                port.postMessage({
                    type: "countComments",
                    count: num
                });
            }, 500);
            return true;
        }
    });
});


/****************************** old/unused functions **************************************/

/*
Gun.on('opt', function (ctx) {
    if (ctx.once) {
        return
    }
    ctx.on('in', function (msg) {
        var to = this.to;
        let str = JSON.stringify(msg, null, ' ');
        if (str.length < 200) {
            console.log('This record is valid' + str);
        } else {
            to.next(msg);
        }
    });
});*/

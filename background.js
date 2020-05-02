//var gun = Gun(['https://aqueous-sea-01664.herokuapp.com/gun']);
//var gun = Gun(['https://aqueous-sea-01664.herokuapp.com/gun'], ['http://localhost:5000/gun']);
var gun = Gun();
var user = gun.user();

/*const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
const store = $rdf.graph();
const fetcher = new $rdf.Fetcher(store);
const updater = new $rdf.UpdateManager(store);
*/
const fileClient = SolidFileClient;
(async function () {
    const session = await solid.auth.currentSession();
})();

// This doesn't seem to do anything
/*user.recall({
    sessionStorage: true
});*/

/************* API for external apps and extensions (NOTE: Internal API is below) *************/

chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(async function (request) {


        // This is so the web page can check that the extension is installed
        if (request.type === 'ping') {
            port.postMessage({
                type: "pong"
            });
        }

        if (request.type === "clearLocalStorage") {
            //if (window.confirm(`Clear DVO localStorage`)) {
            user.leave();
            localStorage.clear();
            //}
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        else if (request.type === "storeSolidSessionToken") {
            if (window.confirm(`Please confirm that you want to login`)) {
                let u = request.sessionToken.webId;
                let p = request.password;
                console.log(u);

                /* Need to check that the user is already registered, if false, register the account. If true, login. When registering an account, you will need to create a vanity address. The user must be able to reveal their keys in a settings page, where they can copy them to the clipboard */

                //await fetcher.load(u);
                //let photo = store.any($rdf.sym(u), VCARD('hasPhoto'));
                // need to switch to ldflex

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
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        else if (request.type === "saveResume") {
            if (window.confirm(`Confirm save`)) {}
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        else if (request.type === "updateProfile") {
            if (window.confirm(`Confirm update profile`)) {
                console.log(session);
                if (session) {}
            } else {
                alert('Please login to the DVO extension');
            }
        }
    });
});


/***** Internal API for login and registration *****/

chrome.runtime.onConnect.addListener(function (port) {
    console.log(port.name);
    console.assert(port.name == "dvo"); // Do i need this? 
    port.onMessage.addListener(async function (request) {

        if (request.type === "openComments") {
            openComments();
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        else if (request.type === "getPageComments") {
            getPageComments(request.pageUrl, port)
            return true;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        else if (request.type === "addComment") {
            if (window.confirm(`Confirm add comment`)) {
                addComment(request.pageUrl, request.commentId, request.comment, request.date, port);
            }
            return true;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        else if (request.type === "likeComment") {
            if (window.confirm(`Confirm like comment`)) {
                likeComment(request.pageUrl, request.commentId, request.reactType, port);
            }
            return true;
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////// 
        else if (request.type === "deleteComment") {
            if (window.confirm(`Confirm delete comment`)) {
                deleteComment(request.pageUrl, request.commentId, port);
            }
            return true;
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////// 
        else if (request.type === "updateComment") {
            if (window.confirm(`Confirm edit comment`)) {
                updateComment(request.pageUrl, request.commentId, request.update, port);
            }
            return true;
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////// 
        else if (request.type === "likePage") {
            if (window.confirm(`Confirm like page`)) {
                likePage(request.pageUrl, request.reactType, port);
            }
            return true;
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////// 
        else if (request.type === "getPageLikes") {
            if (user.is) {
                getPageLikes(request.pageUrl, port);
            }
            return true;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        /*else if (request.type === "logout") {
            user.leave();
        }*/
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        else if (request.type === "getPageComments") {
            getPageComments(request.pageUrl, port)
            return true;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        else if (request.type === "countComments") {
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

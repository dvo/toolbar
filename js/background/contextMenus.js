/*************** on right click - post image to newsfeed ***************/

chrome.runtime.onInstalled.addListener(function () {
    var title = "Make profile picture";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Make profile picture"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Add photo to gallery";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Add photo to gallery"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Like Image";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Like Image"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Dislike Image";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Dislike Image"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Share Image";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Share Image"
    });
});

chrome.contextMenus.onClicked.addListener(onClickHandler);

function onClickHandler(info, tab) {
    console.log(info);
    if (window.confirm(`Are you sure you want to ${info.menuItemId} (${info.srcUrl})`)) {
        user.get('profile').get(user.is.pub).get('photo').put(info.srcUrl);
    }
}
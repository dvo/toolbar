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
    var title = "Add to photos";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Add to photos"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Remove from photos";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Remove from photos"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Rename photo";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Rename photo"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Like Photo";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Like photo"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Dislike photo";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Dislike photo"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Share photo";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Share photo"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Like page";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Like page"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Dislike page";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Dislike page"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "View profile";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "View profile"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    var title = "Report";
    var context = "image";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "Report"
    });
});

chrome.contextMenus.onClicked.addListener(onClickHandler);

function onClickHandler(info, tab) {
    console.log(info);
    if (window.confirm(`Are you sure you want to ${info.menuItemId} (${info.srcUrl})`)) {
        user.get('profile').get(user.is.pub).get('photo').put(info.srcUrl);
    }
}
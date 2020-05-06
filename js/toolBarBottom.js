class ToolBar extends HTMLElement {
    connectedCallback() {
        const shadowRoot = this.attachShadow({
            mode: 'closed'
        });

        const toolBarCss = chrome.extension.getURL("css/toolBar.css");
        const fontAwesome = chrome.extension.getURL("css/font-awesome.min.css");
        const jquery = chrome.extension.getURL("js/vendor/jquery-3.3.1.js");

        let myImage = document.createElement('img');
        let iconUrl = chrome.extension.getURL("images/c.png");
        myImage.src = iconUrl;

        let url = window.location.toString();
        let newUrl = new URL(url);
        let webId = new URLSearchParams(newUrl.search).get('webId');
        if (webId !== null) {
            url = webId;
        }

        var port = chrome.runtime.connect({
            name: "dvo"
        });

        /***************** GET DATA *******************/

        (async function () {

            let likeClass = "red";
            let dislikeClass = "blue";
            let totLikes = 0;
            let totDislikes = 0;
            let score = 0;
            let hasLiked = false;
            let hasDisliked = false;
            let obj = null;
            let commentCount = 0;

            obj = await getPageLikes();
            totLikes = obj.likes;
            totDislikes = obj.dislikes;
            score = obj.score;
            commentCount = await countComments();

            if (obj.likedAlready)
                likeClass = "gray";
            if (obj.dislikedAlready)
                dislikeClass = "gray";

            async function getPageLikes() {
                return new Promise(resolve => {
                    port.postMessage({
                        type: "getPageLikes",
                        pageUrl: url
                    });
                    port.onMessage.addListener(function (res) {
                        if (res.type === "getPageLikes") {
                            resolve(res);
                        }
                    });
                });
            }

            async function countComments() {
                return new Promise(resolve => {
                    port.postMessage({
                        type: "countComments",
                        pageUrl: url
                    });
                    port.onMessage.addListener(function (res) {
                        if (res.type === "countComments") {
                            resolve(res.count);
                        }
                    });
                });
            }

            shadowRoot.innerHTML = `
<link rel="stylesheet" href="${toolBarCss}">
<link rel="stylesheet" href="${fontAwesome}">
<script src="${jquery}"></script>
<div id="close">
<div><span class="arrow">&#9650;</span></div>
</div>
<div class="toolbar bottom">
<div id="like"><i class="${likeClass} fa fa-thumbs-up"></i></div>
<div id="likes">${totLikes}</div>
<div id="dislike"><i class="${dislikeClass} fa fa-thumbs-down"></i></div>
<div id="dislikes">${totDislikes}</div>
<div><span id="score">${score}</span>%</div>
<div id="comment"><i class="yellow fa fa-comment"></i></div>
<div id="comments">${commentCount}</div>
<div id="credits-btn"><img src="${iconUrl}" /></div>
<div id="credits">0</div>
</div>
`;

            let likes = shadowRoot.getElementById("likes");
            let like = shadowRoot.getElementById("like");
            let dislikes = shadowRoot.getElementById("dislikes");
            let dislike = shadowRoot.getElementById("dislike");
            let comment = shadowRoot.getElementById("comment");
            let comments = shadowRoot.getElementById("comments");
            let close = shadowRoot.getElementById("close");
            let scoreDiv = shadowRoot.getElementById("score");
            let toolbar = shadowRoot.querySelector(".toolbar");
            let creditsBtn = shadowRoot.getElementById("credits-btn");

            $(creditsBtn).on('click touchstart', function () {
                alert(`This feature is not ready yet. Stay tuned...`);
            });


            /*async function isUserLoggedIn() {
                return new Promise(resolve => {
                    port.postMessage({
                        type: "isUserLoggedIn"
                    });
                    port.onMessage.addListener(function (res) {
                        if (res.type == "loggedIn" && res.response) { 
                            resolve(true);
                        }
                    });
                });
            }*/

            $(close).on('click', function () {
                $(toolbar).toggleClass("toolbar-slide-up");
                $(close).toggleClass("arrow-slide-up");
                $(close).find('.arrow').toggleClass('rotate');
            });

            function getDate() {
                var d = new Date();
                var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                let day = d.getDate();
                let month = monthNames[d.getMonth()];
                let year = d.getFullYear();
                let date = `${day} ${month}, ${year}`;
                return date;
            }

            $(comment).on('click', async function (e) {
                e.stopImmediatePropagation();
                let localPort = chrome.runtime.connect({
                    name: "dvo"
                });

                localPort.postMessage({
                    type: "openComments"
                });
            });

            $(like).on('click', async function (e) {
                e.stopImmediatePropagation();
                $(like).find('i').toggleClass("red gray");
                $(dislike).find('i').removeClass("gray");
                $(dislike).find('i').addClass("blue");

                port.postMessage({
                    type: "likePage",
                    reactType: 'like',
                    pageUrl: url,
                    date: getDate()
                });

                port.onMessage.addListener(function (res) {
                    if (res.type === "getPageLikes") {
                        console.log(res);
                        $(dislikes).html(res.dislikes);
                        $(likes).html(res.likes);
                        $(scoreDiv).html(res.score);
                    }
                });
            });


            $(dislike).on('click', async function (e) {
                e.stopImmediatePropagation();
                $(dislike).find('i').toggleClass("blue gray");
                $(like).find('i').removeClass("gray");
                $(like).find('i').addClass("red");

                port.postMessage({
                    type: "likePage",
                    reactType: 'dislike',
                    pageUrl: url,
                    date: getDate()
                });

                port.onMessage.addListener(function (res) {
                    if (res.type === "getPageLikes") {
                        console.log(res);
                        $(dislikes).html(res.dislikes);
                        $(likes).html(res.likes);
                        $(scoreDiv).html(res.score);
                    }
                });

                port.onMessage.addListener(function (res) {
                    if (res.type === "pageReviews") {
                        console.log(res);
                        $(dislikes).html(res.dislikes);
                        $(likes).html(res.likes);
                        $(scoreDiv).html(res.pageScore);
                    }
                });
            });
        })();
    }
}

customElements.define('tool-bar', ToolBar);

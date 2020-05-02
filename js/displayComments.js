$(document).ready(async function () {

    /*
        const laserExtensionId = "bnmeokbnbegjnbddihbidleappfkiimj";
        const port = chrome.runtime.connect(laserExtensionId);*/

    var port = chrome.runtime.connect({
        name: "dvo"
    });

    /*
    chrome.tabs.query() was returning the popup url and not the page url 
    so i passed the url as parameter from background.js
    }*/

    let url = window.location.href;
    let newUrl1 = new URL(url);
    url = new URLSearchParams(newUrl1.search).get('url');
    let newUrl2 = new URL(url);
    let webId = new URLSearchParams(url.search).get('webId');
    if (webId !== null) {
        url = webId;
    }

    $(".post-comment-btn").on('click', function (e) {
        e.stopImmediatePropagation();
        //let id = Math.random().toString(36).slice(-6);
        let id = new Date().getTime();
        let newComment = $(".post-comment").val();
        port.postMessage({
            type: "addComment",
            commentId: id,
            pageUrl: url,
            comment: newComment,
            date: getDate()
        });
        port.onMessage.addListener(function (res) {
            if (res.type === "addComment") {
                $(".widget-loader").hide();
                $(".no-comments").hide();
                let tpl = `<div id="${res.comment.commentId}" class="post">
<i class="edit-post fa fa-edit"></i>
<i class="delete-post fa fa-close"></i>
<div class="post-body">
<img src="${res.comment.photo}" class="user-image-medium" alt="User Image">
<span><a target="_blank" href="${res.comment.webId}">${res.comment.name}</a><span class="date">${res.comment.date}</span></span>
<div class="post-desc">
<p>${res.comment.comment}</p>
</div>
</div>
<div class="toolbar toolbar-comments">
<div class="like"><i class="red fa fa-thumbs-up"></i></div>
<div class="like-count">0</div>
<div class="dislike"><i class="blue fa fa-thumbs-down"></i></div>
<div class="dislike-count">0</div>
<div class="score"><x-star-rating value="0" number="5"></x-star-rating></div>
</div>
</div>
`;
                $("#dialogBody").prepend(tpl);
                bindEventHandlers();
                //getComments();
            }
        });
    });

    getComments();

    $("#dialogBody").prepend(`<img class="widget-loader" style="display:block; width: 128px; margin:20px auto;" src="../images/widget-loader.gif" />`);

    function getComments() {
        port.postMessage({
            type: "getPageComments",
            pageUrl: url
        });

        let likeClass = 'red';
        let dislikeClass = 'blue';

        port.onMessage.addListener(function (res) {
            //$("#dialogBody").empty();
            if (res.type === "empty") {
                $("#dialogBody").html(`<p class="no-comments" style="text-align: center">There are no comments to show</p>`);
            } else if (res.type === "getPageComments") {
                $(".widget-loader").hide();
                let template = `<div id="${res.comment.commentId}" class="post">
<i class="edit-post fa fa-edit"></i>
<i class="delete-post fa fa-close"></i>
<div class="post-body">
<img src="${res.comment.photo}" class="user-image-medium" alt="User Image">
<span><a target="_blank" href="${res.comment.webId}">${res.comment.name}</a><span class="date">${res.comment.date}</span></span>
<div class="post-desc">
<p>${res.comment.comment}</p>
</div>
</div>
<div class="toolbar toolbar-comments">
<div class="like"><i class="${likeClass} fa fa-thumbs-up"></i></div>
<div class="like-count">${res.comment.likes}</div>
<div class="dislike"><i class="${dislikeClass} fa fa-thumbs-down"></i></div>
<div class="dislike-count">${res.comment.dislikes}</div>
<div class="score"><x-star-rating value="${res.comment.score}" number="5"></x-star-rating></div>
</div>
</div>
`;
                $("#dialogBody").prepend(template);
                bindEventHandlers();
            }

        });
    } // end getComments()

    function bindEventHandlers() {
        let postDesc = document.querySelector(".post-desc"); // this could be jquery to make it more consistent
        //$('#comments').html(res.count);

        $('.delete-post').on("click", function () {
            let commentId = $(this).parent().attr('id');
            let _this = this;
            port.postMessage({
                type: "deleteComment",
                commentId: commentId,
                pageUrl: url
            });
            port.onMessage.addListener(function (res) {
                if (res.type === "commentDeleted") {
                    //$(_this).parent().remove();
                    getComments();
                }
            });

        });

        $('.edit-post').on("click", function () {
            let commentId = $(this).parent().attr('id');
            let currentText = $(`#${commentId} .post-desc`).html();
            if ($(this).hasClass('fa-edit')) {
                $(`#${commentId} .post-desc`).attr("contenteditable", "true");
                $(`#${commentId} .post-desc`).addClass('editable');
            } else if ($(this).hasClass('fa-save')) {
                let newText = $(`#${commentId} .post-desc`).html();
                $(`#${commentId} .post-desc`).attr("contenteditable", "false");
                $(`#${commentId} .post-desc`).removeClass('editable');
                //if (newText !== currentText) { // should cancel if strings match
                port.postMessage({
                    type: "updateComment",
                    update: newText,
                    commentId: commentId,
                    pageUrl: url
                });
                //} 
            }
            $(this).toggleClass("fa-edit fa-save");
        });

        $(".like").on('click', function () {
            let commentId = $(this).parent().parent().attr('id');
            likeComment('like', commentId);
            $(this).find('i').toggleClass("red gray");
        });
        $(".dislike").on('click', function () {
            let commentId = $(this).parent().parent().attr('id');
            likeComment('dislike', commentId);
            $(this).find('i').toggleClass("blue gray");
        });

        function likeComment(reactType, commentId) {
            port.postMessage({
                type: "likeComment",
                reactType: reactType,
                pageUrl: url,
                commentId: commentId,
                date: getDate()
            });

            port.onMessage.addListener(function (res) {
                if (res.type === "getCommentLikes") {
                    $(`#${commentId} .like-count`).html(res.likes);
                    $(`#${commentId} .dislike-count`).html(res.dislikes);
                    $(`#${commentId} .score`).html(`<x-star-rating value="${(res.score/10)/2}" number="5"></x-star-rating>`);
                }
            });
        } // end likeComment

    } // end function bindEventHandlers

}); // end document ready

///////////////////////////// functions /////////////////////////////////////


function getDate() {
    var d = new Date();
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let day = d.getDate();
    let month = monthNames[d.getMonth()];
    let year = d.getFullYear();
    let date = `${day} ${month}, ${year}`;
    return date;
}

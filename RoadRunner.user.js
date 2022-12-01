// ==UserScript==
// @name         DiscussionRoadRunner
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Quickly moderate discusion posts with a keyboard
// @author       Alan Berta and Benjamin Millerd
// @include      http://dev.alignable.com:3000/soko/discussion_posts*
// @include      http://dev.alignable.com:3000/soko/discussions*
// @include      https://deve.alignable.us/soko/discussions*
// @include      https://deve.alignable.us/soko/discussion_posts*
// @include      https://staging.alignable.us/soko/discussions*
// @include      https://staging.alignable.us/soko/discussion_posts*
// @include      https://www.alignable.com/soko/discussions*
// @include      https://www.alignable.com/soko/discussion_posts*
// @require      http://code.jquery.com/jquery-3.x-git.min.js
// ==/UserScript==

//
// Command + Up / Down - move between posts, auto expand see more, highlight active selection, highlight stop words (discussion posts)
// Command + A - approve post (Set to visible and mark as moderated), NOTE: on discussion posts you will automatically be moved to the next post.
// Command + Z - deny post (Set to hidden and mark as moderated)
// Command + E - Open edit dialog
//

(function() {

    var rr_activeRecord = 0;
    var stopStuff = [];
    var oldHTML = "";

    var isPosts = true;

    var navigateToRow = function(loc) {
        var node = "#index_table_discussion_posts";
        if(!$(node).length) {
            node = "#index_table_discussions";
            isPosts = false;
        }
        var cur = $(node + " > tbody > tr");
        if(cur[loc]) {

            if(loc!==rr_activeRecord) {
                $(cur[rr_activeRecord]).find('td').each (function(column, td) {
                    $(td).css("background-color", "");
                });
                $(cur[rr_activeRecord]).find(".soko-discussion__more").each(function(d,e) {
                    $(e).click();
                });
                if(oldHTML != "" ) {
                    if(isPosts) {
                        $(cur[rr_activeRecord]).find(".soko-discussion__reply").html(oldHTML);
                    } else {
                        $(cur[rr_activeRecord]).find(".soko-discussion").html(oldHTML);
                    }
                }
            }

            $(cur[loc]).find('td').each (function(column, td) {
                $(td).css("background-color", "#fff685");
            });
            $(cur[loc]).find(".soko-discussion__more").each(function(d,e) {
                $(e).click();
            });

            cur[loc].scrollIntoView();
            rr_activeRecord = loc;
            annotateStopStuff(cur[loc]);
        }
    };

    var annotateStopStuff = function(obj) {
        stopStuff = [];
        oldHTML = "";
        try {
            const stopstr = isPosts ? $(obj).find(".col-business").html() : $(obj).find(".col-status").html();
            if(stopstr) {
                var extractedList = extractStopWordList(stopstr);
                var node = ".soko-discussion";
                if (isPosts) {
                    node = ".soko-discussion__reply";
                }
                var curHtml = $(obj).find(node).html();
                oldHTML = curHtml;
                extractedList.sort();
                extractedList.forEach(function(word) {
                    if(word == "$") {
                        word = "\\" + word;
                    }
                    var regEx = new RegExp(word, "ig");
                    curHtml = curHtml.replaceAll(regEx, "<span style='background-color:#E27D60;padding:5px;font-size:24px;'>" + word.replaceAll("\\", "") + "</span>");
                });
                $(obj).find(node).html(curHtml);
            }
        } catch(err) {
            stopStuff = [];
            oldHTML = "";
        }
    };

    var stopsRegex = new RegExp(/Stops: \((.*?)\)/, "g");
    var stopsGroupRegex = new RegExp(/Stops: \((.*)\)/);

    var extractStopWordList = function(htmlStr) {
        try {
            var retList = [];
            var list = htmlStr.match(stopsRegex);
            if (list) {
                list.forEach(function(stopListRaw) {
                    var innerList = stopListRaw.match(stopsGroupRegex);
                    if (innerList) {
                        retList = retList.concat(innerList[1].split(","));
                    }
                });
                return retList;
            } else {
                return [];
            }
        } catch(error) {
            return [];
        }
    }

    var approveDiscussion = function() {
        var cur = $("#index_table_discussions > tbody > tr");
        cur[rr_activeRecord].scrollIntoView();
        var tmp = $(cur[rr_activeRecord]).find(".soko-discussion-hidden").find("a");
        if(tmp && tmp.html() && tmp.html().indexOf("Unhide!") > -1 ) {
            $(tmp)[0].click();
        } else {
            var tmp2 = $(cur[rr_activeRecord]).find(".soko-discussion-moderate").find("a");
            if (tmp2 && tmp2.html() && tmp2.html().indexOf("Mod!") > -1) {
                $(tmp2)[0].click();
            }
        }
        setTimeout(() => { navigateToRow(rr_activeRecord+1); }, 500);
    };

    var approveDiscussionPost = function() {
        var cur = $("#index_table_discussion_posts > tbody > tr");
        cur[rr_activeRecord].scrollIntoView();
        var tmp = $(cur[rr_activeRecord]).find(".soko-discussion-hidden").find("a");
        if(tmp && tmp.html() && tmp.html().indexOf("Unhide!") > -1 ) {
            $(tmp)[0].click();
        } else {
            var tmp2 = $(cur[rr_activeRecord]).find(".soko-post-moderate").find("a");
            if (tmp2 && tmp2.html() && tmp2.html().indexOf("Mod!") > -1) {
                $(tmp2)[0].click();
            }
        }
        setTimeout(() => { navigateToRow(rr_activeRecord+1); }, 100);
    };

    var denyDiscussion = function() {
        var cur = $("#index_table_discussions > tbody > tr");
        cur[rr_activeRecord].scrollIntoView();
        var tmp = $(cur[rr_activeRecord]).find(".soko-discussion-hidden").find("a");
        if (tmp && tmp.html() && tmp.html().indexOf("Hide!") > -1) {
            $(tmp)[0].click();
        } else {
            var tmp2 = $(cur[rr_activeRecord]).find(".soko-discussion-moderate").find("a");
            if (tmp2 && tmp2.html() && tmp2.html().indexOf("Mod!") > -1) {
                $(tmp2)[0].click();
            }
        }
        setTimeout(() => { navigateToRow(rr_activeRecord+1); }, 500);
    };

    var denyDiscussionPost = function() {
        var cur = $("#index_table_discussion_posts > tbody > tr");
        cur[rr_activeRecord].scrollIntoView();
        var tmp = $(cur[rr_activeRecord]).find(".soko-discussion-hidden").find("a");
        if(tmp && tmp.html() && tmp.html().indexOf("Hide!") > -1 ) {
            $(tmp)[0].click();
        } else {
            var tmp2 = $(cur[rr_activeRecord]).find(".soko-post-moderate").find("a");
            if (tmp2 && tmp2.html() && tmp2.html().indexOf("Mod!") > -1) {
                $(tmp2)[0].click();
            }
        }
        setTimeout(() => { navigateToRow(rr_activeRecord+1); }, 100);
    };

    var invokeEdit = function() {
        var cur = $("#index_table_discussion_posts > tbody > tr");
        cur[rr_activeRecord].scrollIntoView();
        var tmp = $(cur[rr_activeRecord]).find(".col-edit").find("a");
        $(tmp)[0].click();
        oldHTML = "";
    };

    var invokeEditDiscussion = function() {
        var cur = $("#index_table_discussions > tbody > tr");
        cur[rr_activeRecord].scrollIntoView();
        var tmp = $(cur[rr_activeRecord]).find(".col-edit").find("a");
        $(tmp)[0].click();
        oldHTML = "";
    };

    //Moderation messages
    var sendmessage1 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(1) > a");
     tmp2.click();
    };
    var sendmessage2 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(2) > a");
     tmp2.click();
    };
    var sendmessage3 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(3) > a");
     tmp2.click();
    };
    var sendmessage4 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(4) > a");
     tmp2.click();
    };
    var sendmessage5 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(5) > a");
     tmp2.click();
    };
    var sendmessage6 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(6) > a");
     tmp2.click();
    };
    var sendmessage7 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(7) > a");
     tmp2.click();
    };
    var sendmessage8 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(8) > a");
     tmp2.click();
    };
    var sendmessage9 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(9) > a");
     tmp2.click();
    };
    var sendmessage10 = function() {
     var curr = $("#index_table_discussions > tbody > tr");
     curr[rr_activeRecord].scrollIntoView();
     var tmp = $(curr[rr_activeRecord]).find(".col-msg").find("div").find("div").find("a");
     $(tmp)[0].click();
     var tmp2 = document.querySelector("#index_table_discussions > tbody > tr > td.col.col-msg > div > div.dropdown_menu > div > ul > li:nth-child(10) > a");
     tmp2.click();
    };

    $(document).keydown(function(e) {
        if((event.ctrlKey || event.metaKey) && event.which == 40) {
            // command + down, move to next row (command +down arrow)
            navigateToRow(rr_activeRecord+1);
            event.preventDefault();
            return true;
        } else if((event.ctrlKey || event.metaKey) && event.which == 38) {
            // command + up, move to next row (command + up arrow)
            navigateToRow(rr_activeRecord-1);
            event.preventDefault();
            return true;
        } else if((event.ctrlKey || event.metaKey) && event.which == 65) {
            // APPROVE (command +a)
            if(isPosts) {
                approveDiscussionPost();
            } else {
                approveDiscussion();
            }
            event.preventDefault();
            return true;
        } else if((event.ctrlKey || event.metaKey) && event.which == 90) {
            // DENY (command + z)
            if(isPosts) {
                denyDiscussionPost();
            } else {
                denyDiscussion();
            }
            event.preventDefault();
            return true;
        } else if((event.ctrlKey || event.metaKey) && event.which == 69) {
            // EDIT (command + e)
            if(isPosts) {
                invokeEdit();
            } else {
                invokeEditDiscussion();
            }
            event.preventDefault();
            return true;
        }
       else if(event.which == 49) {
           // Mod message 1 (Shift + 1)
           sendmessage1();
           event.preventDefault();
           return true;
        }
        else if(event.which == 50) {
            // Mod message 2 (Shift + 2)
            sendmessage2();
           return true;
        }
        else if(event.which == 51) {
            // Mod message 3 (Shift + 3)
            sendmessage3();
           return true;
        }
        else if(event.which == 52) {
            // Mod message 4 (Shift + 4)
            sendmessage4();
           return true;
        }
        else if(event.which == 53) {
            // Mod message 5 (Shift + 5)
            sendmessage5();
           return true;
        }
        else if(event.which == 54) {
            // Mod message 6 (Shift + 6)
            sendmessage6();
           return true;
        }
        else if(event.which == 55) {
            // Mod message 7 (Shift + 7)
            sendmessage7();
           return true;
        }
        else if(event.which == 56) {
            // Mod message 8 (Shift + 8)
            sendmessage8();
           return true;
        }
        else if(event.which == 57) {
            // Mod message 9 (Shift + 9)
            sendmessage9();
           return true;
        }
        else if(event.which == 48) {
            // Mod message 0 (Shift + 0)
            sendmessage10();
           return true;
        }
    });

    jQuery.fn.putCursorAtEnd = function() {
        return this.each(function() {
            var $el = $(this),
                el = this;
            if (!$el.is(":focus")) {
                $el.focus();
            }
            if (el.setSelectionRange) {
                var len = $el.val().length * 2;
                setTimeout(function() {
                    el.setSelectionRange(len, len);
                }, 1);
            } else {
                $el.val($el.val());
            }
            this.scrollTop = 999999;
        });
    };

    $(document).ready(function(){
        navigateToRow(rr_activeRecord);
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = function() {
            window.history.pushState(null, "", window.location.href);
        };
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    var modalTrigger = [].some.call(mutation.addedNodes, function(el) {
                        return el.id == ('shared-modal');
                    });
                    if (modalTrigger) {
                        setTimeout(() => {
                            if (isPosts) {

                            } else {
                                const el = $("#discussion_title").get(0);
                                el.focus();
                                $(el).putCursorAtEnd();
                            }
                        }, 500);
                    }
                }
            });
        });

        var config = {
            attributes: true,
            childList: true,
            characterData: true
        };

        observer.observe(document.body, config);
    });
})();

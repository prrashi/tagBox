;(function ($) {
  "use strict";

  if (String.prototype.trim !== "function") {

    String.prototype.trim = function () {

      /* jshint validthis:true */
      return this.replace(/^\s+|\s+$/g, "");
    };
  }

  var DEFAULTS = {

  };

  var RETURN = 13,
      LEFT   = 37,
      UP     = 38,
      RIGHT  = 39,
      BOTTOM = 50,
      BKSP   = 8,
      ESC    = 27,
      SPACE  = 32;

  function getCursorPosition () {

    var sel = window.getSelection();

    return sel.anchorOffset;
  }

  function setCursorPosition (el, pos) {

    var nodeTextLength = $(el).text().length;

    if (pos === "start") {

      pos = 0;
    }else if (pos === "end") {

      pos = nodeTextLength;
    }

    var range = null;

    if (typeof window.getSelection !== "undefined" &&
        typeof document.createRange !== "undefined") {

      range = document.createRange();

      el = el.childNodes[0];

      if (!el) {

        return;
      }

      range.setStart(el, pos);

      range.setEnd(el, nodeTextLength);

      range.collapse(true);

      //TODO: Check the compatibility for selection and write fallback
      var sel = window.getSelection();

      sel.removeAllRanges();

      sel.addRange(range);
    }

    //TODO: Position not implemented for IE
    else if(typeof document.body.createTextRange !== "undefined") {

      range = document.body.createTextRange();

      range.moveToElementText(el);

      range.collapse(false);

      range.select();
    }
  }

  function focusEditable ($editable) {

    $editable.siblings("span.tagbox-wg[contenteditable]").removeAttr("contenteditable");

    return $editable.attr("contenteditable", "true").focus();
  }

  function spaceToNBSP (text) {

    return text.replace(/\ /g, "&nbsp;");
  }

  function addEditable ($container, text, isHtml) {

    text = text || "";

    $container.children("span.tagbox-wg").removeAttr("contenteditable");

    var $newNode =  $("<span/>").addClass("tagbox-wg")
                               [isHtml? "html": "text"](text)
                               .appendTo($container);

    text = spaceToNBSP(text);

    $newNode.html(text);

    return focusEditable($newNode);
  }

  function removeEditable ($editable) {

    var $prevNode = $editable.prev();

    if($prevNode.length === 0){

      return $editable;
    }else {

      while ($editable.prev(".tagbox-wg").length === 0) {

        $editable.prev().remove();
      }

      $prevNode = $editable.prev();

      var text = $editable.text(),
          prevNodeText = $prevNode.text();

      focusEditable($prevNode);

      if (text.length > 0) {

        $prevNode.text(prevNodeText + text);
      }

      $editable.remove();

      setCursorPosition($prevNode.get(0), prevNodeText.length);

      return $prevNode;
    }
  }

  function _tagBox ($textarea, options) {

    var autoFillData = options.autoFillData;

    var existingVal = $textarea.val().trim();

    var $container = $("<div/>").addClass("tagbox-container")
                                .insertBefore($textarea);

    $textarea.hide()
             .appendTo($container);

    var $tagbox = $("<div/>").addClass("tagbox tagbox-input")
                             .prependTo($container);

    var existingLines = existingVal.split("\n"),
        numLines = existingLines.length;

    var $currentEditable = null;

    $.each(existingLines, function(i, line){

      $currentEditable = addEditable($tagbox, line);

      if ( i<numLines-1 ) {

        $("<br/>").insertAfter($currentEditable);
      }
    });

    var recentOffset = 0;

    /* Event Handlers */
    function onClickHandler (e) {

      var selection = null;

      var $node = $(e.target);

      //if the node is a wordgroup span, focus the cursor there
      if ($node.hasClass("tagbox-wg")) {

        $currentEditable = focusEditable($node);

        selection = window.getSelection();

        recentOffset = selection.focusOffset;
      }
    }

    $container.on("click", onClickHandler)
              .on("keyup", "[contenteditable='true']", function (e) {

              })
              .on("keydown", "[contenteditable='true']", function (e) {

                var key = e.which || e.keyCode;

                var selection = window.getSelection(),
                    offset = selection.focusOffset;

                var curText = $currentEditable.text();

                var preText, postText;

                if (key === RETURN) {

                  e.preventDefault();

                  var $br = $("<br/>");

                  if (offset === 0 && curText.length !== 0){

                    $br.insertBefore($currentEditable);

                    addEditable($tagbox).insertBefore($br);

                    focusEditable($currentEditable);
                  }else {

                    $br.insertAfter($currentEditable);

                    preText = curText.substr(0, offset);

                    postText = curText.substr(offset);

                    $currentEditable.text(preText);

                    $currentEditable = addEditable($tagbox, postText);

                    focusEditable($currentEditable.insertAfter($br));
                  }

                }else if (key === BKSP) {

                  if ($currentEditable.text().length === 0 || offset === 0) {

                    e.preventDefault();

                    $currentEditable = removeEditable($currentEditable);
                  }
                }else if (key === SPACE) {

                  e.preventDefault();

                  preText = spaceToNBSP(curText.substr(0, offset));
                  postText = spaceToNBSP(curText.substr(offset));

                  $currentEditable.html(preText + "&nbsp;" + postText);

                  setCursorPosition($currentEditable.get(0), offset + 1);
                }
              });
  }

  function tagBox (options) {

    options = $.extend(options, DEFAULTS);

    /* jshint validthis:true */
    return $.each(this, function (index, node) {

             var tagName = node.tagName;

             if(tagName === "TEXTAREA" || tagName === "INPUT"){

               _tagBox($(node), options);
             }
           });
  }

  $.fn.tagBox = tagBox;

}(jQuery));

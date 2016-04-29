;(function ($) {
  "use strict";

  if (String.prototype.trim !== "function") {

    String.prototype.trim = function () {

      /* jshint validthis:true */
      return this.replace(/^\s+|\s+$/g, "");
    };
  }

  // No Defaults!?
  var DEFAULTS = {

  };

  var RETURN = 13,
      LEFT   = 37,
      UP     = 38,
      RIGHT  = 39,
      DOWN   = 40,
      BKSP   = 8,
      ESC    = 27,
      SPACE  = 32,
      DEL    = 46;

  var CTRLKey = 17;

  var B = 66,// ctrl + B for bolding
      I = 73,// ctrl + I for italicizing
      U = 85;// ctrl + u for underline

  var allTrackedKeys = [RETURN, LEFT, UP, RIGHT, DOWN, BKSP,
                        ESC, SPACE, DEL, CTRLKey, B, I, U];

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

  function focusEditable ($editable, cursorPosition) {

    $editable.siblings("[contenteditable]").removeAttr("contenteditable");

    $editable.attr("contenteditable", "true").focus();

    cursorPosition = cursorPosition || $editable.text().length;

    setCursorPosition($editable.get(0), cursorPosition);

    return $editable;
  }

  function spaceToNBSP (text) {

    return text.replace(/\ /g, "&nbsp;");
  }

  var allowedTags  = {

    "bold"     : {
                   "class": "tagbox-bold"
                 },
    "italic"   : {
                   "class": "tagbox-italic"
                 },
    "underline": {
                   "class": "tagbox-underline"
                 },
    "anchor"   : {
                   "class": "tagbox-anchor"
                 },
    "label"    : {
                   "class": "tagbox-label"
                 }
  };

  function addInnerEditable ($parent, tagType, text) {

    text = text || "";

    text = spaceToNBSP(text);

    $parent.blur().removeAttr("contenteditable");

    var tagClass = allowedTags[tagType]?allowedTags[tagType].class: "";

    var $newNode = $("<span/>").addClass("inner-tagbox-wg")
                               .addClass(tagClass)
                               .attr("contenteditable", "true")
                               .html(text)
                               .appendTo($parent);

    return focusEditable($newNode);
  }

  function addEditable ($container, text) {

    text = text || "";

    text = spaceToNBSP(text);

    var $newNode =  $("<span/>").addClass("tagbox-wg")
                               .html(text)
                               .appendTo($container);

    //$newNode = addInnerEditable($newNode);

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

    var cursorPosition = 0;

    /* Event Handlers */
    function onClickHandler (e) {

      var selection = null;

      var $node = $(e.target);

      //if the node is a wordgroup span, focus the cursor there
      if ($node.hasClass("tagbox-wg")) {

        $currentEditable = focusEditable($node);

        selection = window.getSelection();

        cursorPosition = selection.focusOffset;
      }
    }

    function onKeyDownHandler (e) {

      var key = e.which || e.keyCode;

      // If the key is not being tracked, don't waste your time, just Return!
      if ($.inArray(key, allTrackedKeys) < 0) {

        return;
      }

      var selection = window.getSelection(),
          offset = selection.focusOffset;

      var curText = $currentEditable.text();

      var preText, postText;

      if (e.ctrlKey && key === B) {

        e.preventDefault();

        if (!$currentEditable.hasClass("tagbox-bold")) {

          $currentEditable = addInnerEditable($currentEditable, "bold");
        }else {

          $currentEditable = focusEditable($currentEditable.parent());
        }
      }else if (e.ctrlKey && key === U) {

        e.preventDefault();

        $currentEditable = addInnerEditable($currentEditable, "underline");
      }else if (e.ctrlKey && key === I) {

        e.preventDefault();

        $currentEditable = addInnerEditable($currentEditable, "italic");
      }else if (key === RETURN) {

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

        if (curText.length === 0 || offset === 0) {

          e.preventDefault();

          $currentEditable = removeEditable($currentEditable);
        }
      }else if(key === DEL) {

        if (curText.length === 0 || offset === curText.length) {

          e.preventDefault();

          var $nextElement = $currentEditable.nextAll(".tagbox-wg").eq(0);

          if ($nextElement.length > 0) {

            $currentEditable = removeEditable($nextElement);
          }
        }
      }else if (key === SPACE) {

        e.preventDefault();

        preText = spaceToNBSP(curText.substr(0, offset));
        postText = spaceToNBSP(curText.substr(offset));

        $currentEditable.html(preText + "&nbsp;" + postText);

        setCursorPosition($currentEditable.get(0), offset + 1);
      }else if (key === UP || key === DOWN || key === LEFT || key === RIGHT) {

        var $prevElement = $currentEditable.prevAll(".tagbox-wg").eq(0),
            $nextElement = $currentEditable.nextAll(".tagbox-wg").eq(0),
            $focusElement = null;

        var currentCursorPositon = getCursorPosition();

        if (key === UP) {

          $focusElement = $prevElement;
        }else if (key === DOWN) {

          $focusElement = $nextElement;
        }else if(key === LEFT && currentCursorPositon === 0) {

          $focusElement = $prevElement;
        }else if(key === RIGHT && currentCursorPositon === curText.length) {

          $focusElement = $nextElement;
        }

        if (!$focusElement || $focusElement.length === 0) {

          return;
        }

        e.preventDefault();

        var focusElementText = $focusElement.text();

        if (key === LEFT) {

          currentCursorPositon = focusElementText.length;
        }else if(key === RIGHT) {

          currentCursorPositon = 0;
        }else if (key === UP || key === DOWN) {

          if (focusElementText.length < cursorPosition) {

            currentCursorPositon = focusElementText.length;
          }else {

            currentCursorPositon = cursorPosition;
          }
        }

        $currentEditable = focusEditable($focusElement, currentCursorPositon);
      }
    }

    function onKeyUpHandler(e) {

      var key = e.which || e.keyCode;

      if (key !== UP && key !== DOWN) {

        var selection = window.getSelection(),
            offset = selection.focusOffset;

        cursorPosition = offset;
      }
    }

    $container.on("click", onClickHandler)
              .on("keyup", "[contenteditable='true']", onKeyUpHandler)
              .on("keydown", "[contenteditable='true']", onKeyDownHandler);
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

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
      ESC    = 27;


  function setCursorPosition (el, pos) {

    var range = null;

    if (typeof window.getSelection !== "undefined" &&
        typeof document.createRange !== "undefined") {

      range = document.createRange();

      range.selectNodeContents(el);

      range.collapse(false);

      var sel = window.getSelection();

      sel.removeAllRanges();

      sel.addRange(range);
    }else if(typeof document.body.createTextRange !== "undefined") {

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

  function addEditable ($container, text, isHtml) {

    text = text || "";

    $container.children("span.tagbox-wg").removeAttr("contenteditable");

    var $new_el =  $("<span/>").addClass("tagbox-wg")
                               [isHtml? "html": "text"](text)
                               .appendTo($container);

    return focusEditable($new_el);
  }

  function removeEditable ($editable) {

    var $prevElement = $editable.prev();

    if($prevElement.length === 0){

      return $editable.text("");
    }else {

      while ($editable.prev(".tagbox-wg").length === 0) {

        $editable.prev().remove();
      }

      $prevElement = $editable.prev();

      var text = $editable.text(),
          prev_ele_text = $prevElement.text();

      focusEditable($prevElement);

      if (text.length > 0) {

        $prevElement.text($prevElement.text() + text);
      }

      $editable.remove();

      return $prevElement;
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

    var $currentEditable = addEditable($tagbox, existingVal);

    /* Event Handlers */

    function on_click_handler (e) {

      var $node = $(e.target);

      //if the node is a wordgroup span, focus the cursor there
      if ($node.hasClass("tagbox-wg")) {

        $currentEditable = focusEditable($node);
      }
    };


    $container.on("click", on_click_handler)
              .on("keyup", "[contenteditable='true']", function (e) {

              })
              .on("keydown", "[contenteditable='true']", function (e) {

                var key = e.which || e.keyCode;

                var selection = window.getSelection(),
                    offset = selection.focusOffset;

                if (key === RETURN) {

                  e.preventDefault();

                  var $br = $("<br/>");

                  var cur_text = $currentEditable.text();

                  var pre_text, post_text;

                  if (offset === 0 && cur_text.length !== 0){

                    $br.insertBefore($currentEditable);

                    addEditable($tagbox).insertBefore($br);

                    focusEditable($currentEditable);
                  }else {

                    $br.insertAfter($currentEditable);

                    pre_text = cur_text.substr(0, offset);

                    post_text = cur_text.substr(offset);

                    $currentEditable.text(pre_text);

                    $currentEditable = addEditable($tagbox, post_text);

                    focusEditable($currentEditable.insertAfter($br));
                  }

                }else if (key === BKSP) {

                  if ($currentEditable.text().length === 0 || offset === 0) {

                    e.preventDefault();

                    $currentEditable = removeEditable($currentEditable);
                  }
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

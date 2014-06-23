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

  function addEditable ($container, text, isHtml) {

    text = text || "";

    $container.children("span.tagbox-wg").removeAttr("contenteditable");

    return $("<span/>").attr("contenteditable", "true")
                       .addClass("tagbox-wg")
                       [isHtml? "html": "text"](text)
                       .appendTo($container);

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

    var focusCurrentEditable = function () {

      $currentEditable.attr("contenteditable", "true").focus();
    };

    /* Event Handlers */
    $container.on("click", focusCurrentEditable)
              .on("keyup", "[contenteditable='true']", function (e) {

              })
              .on("keydown", "[contenteditable='true']", function (e) {

                var key = e.which || e.keyCode;

                if (key === RETURN) {

                  e.preventDefault();

                  $("<br/>").appendTo($tagbox);

                  $currentEditable = addEditable($tagbox);

                  focusCurrentEditable();
                }else if (key === BKSP && $currentEditable.text().length === 0) {

                  $currentEditable = removeEditable($currentEditable);

                  focusCurrentEditable();
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

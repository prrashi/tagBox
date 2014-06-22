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

  function _tagBox ($textarea, options) {

    var autoFillData = options.autoFillData;

    var existingVal = $textarea.val().trim();

    var $container = $("<div/>").addClass("tagbox-container")
                                .insertBefore($textarea);

    $textarea.hide()
             .appendTo($container);

    var $tagbox = $("<div/>").addClass("tagbox tagbox-input")
                             .prependTo($container);

    var $currentEditable = $("<span/>").attr("contenteditable", "true")
                                       .addClass("tagbox-wg")
                                       .text(existingVal)
                                       .prependTo($tagbox);

    var focus_current_editable = function () {

      $currentEditable.focus();
    };

    /* Event Handlers */
    $container.on("click", focus_current_editable)
              .on("keyup", "[contenteditable='true']", function (e) {
              
                var key = e.which || e.keyCode;

                if (key === ENTER) {
                
                  e.preventDefault();

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

;(function ($) {
  "use strict";

  var DEFAULTS = {

  };

  function _tagBox () {

  }

  function tagBox (options) {

	    options = $.extend(options, DEFAULTS);

		  /* jshint validthis:true */
		  return $.each(this, function (index, $node) {

				_tagBox.apply($node, options);
      });
  }

  $.fn.tagBox = tagBox;

}(jQuery));

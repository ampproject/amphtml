/* This file should be loaded before the content */

(function($) {
  "use strict";
	
	var $window = $(window),
		$imgPar = $('img').parent();
		
	$imgPar.has('img').detach();
	
	
	// Run after all content loaded
	$window.on("load", function() {

	});
	
	// on window resize
	$window.resize(function() {
	
	});
	
})(jQuery)
'use strict';

fApp.directive('metisMenu', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.metisMenu();
		}
	};
})
.directive('metisMenuCollapse', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			$(window).bind("load resize", function() {
		        if ($(this).width() < attrs.metisMenuCollapse) {
		            element.addClass('collapse');
		        } else {
		            element.removeClass('collapse');
		        }
		    });
		}
	};
});
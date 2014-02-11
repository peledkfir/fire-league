'use strict';

fApp.directive('metisMenu', function() {
	return {
		restrict: 'A',
		link: function(scope, element) {
			element.metisMenu();
		}
	};
});
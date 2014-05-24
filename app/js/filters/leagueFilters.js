
flApp.filter('isDefined', function() {
	'use strict';

	return function(input, val) {
		if (!_.isUndefined(val)) {
			return input;
		}
	};
});
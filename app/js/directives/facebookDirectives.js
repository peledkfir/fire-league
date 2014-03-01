
fApp.directive('fbAvatar', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		template: '<img class="profile_{{size}} {{clazz}}" ng-src="http://graph.facebook.com/{{id}}/picture?type=square&width={{size}}&height={{size}}">',
		scope: {
			clazz: '@',
			size: '=',
			id: '='
		}
	};
});
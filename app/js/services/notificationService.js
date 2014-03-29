
fApp.service('notificationService', function($rootScope, $timeout) {
	'use strict';
	$rootScope.notifications = {};
	var notificationId = 0;

	this.notify = function(type, message, delay) {
		var id = notificationId++;
		$rootScope.notifications[id.toString()] = {
			type: type,
			message: message
		};

		$timeout(function() {
			delete $rootScope.notifications[id.toString()];
		}, delay);
	};
});
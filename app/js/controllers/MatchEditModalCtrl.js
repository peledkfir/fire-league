
fApp.controller('MatchEditModalCtrl', function MatchEditModalCtrl($scope, $modalInstance, match) {
	'use strict';

	$scope.match = match;
	$scope.result = {};

	if (match.result) {
		$scope.result.home = match.result.home;
		$scope.result.away = match.result.away;
	}

	$scope.save = function() {
		$modalInstance.close($scope.result);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
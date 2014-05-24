
flApp.controller('MatchImagesModalCtrl', ['$scope', 'match', '$modalInstance',
	function($scope, match, $modalInstance) {
		'use strict';
		
		$scope.match = match;
		$scope.images = _.map(match.images, function(id) { return {id: id}; });

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}
]);
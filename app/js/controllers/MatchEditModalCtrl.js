
flApp.controller('MatchEditModalCtrl', function MatchEditModalCtrl($scope, $rootScope, $modalInstance, UploadPhotosService, leagueService, match, folder) {
	'use strict';

	$scope.match = match;
	$scope.folder = folder;
	var result = $scope.result = {};
	var uploadService = $scope.uploadService = new UploadPhotosService(match.images);

	if (match.result) {
		$scope.result.home = match.result.home;
		$scope.result.away = match.result.away;
	}

	$scope.save = function() {
		if (!$scope.saving) {
			if (result.home !== null && result.away !== null) {
				$scope.saving = true;
				$scope.progress = uploadService.progress;
				$scope.active = uploadService.active;
				uploadService.submit(function(images) {
					$modalInstance.close( { result: $scope.result, images: images } );
				});
			} else {
				$modalInstance.close({ result: $scope.result });
			}
		}
	};

	$scope.cancel = function () {
		if (!$scope.saving) {
			$modalInstance.dismiss('cancel');
		}
	};
});
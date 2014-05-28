
flApp.controller('SeasonEditCtrl', ['$scope', '$stateParams', '$timeout', 'leagueService', 'notificationService',
	function($scope, $stateParams, $timeout, leagueService, notificationService) {
		'use strict';
		var leagueName = $stateParams.league;
		var seasonName = $stateParams.season;

		$scope.loading = false;

		var promise = $timeout(function(){
			$scope.loading = true;
		}, 50);
		
		$scope.$locked = leagueService.res.season.locked.sync(leagueName, seasonName);
		$scope.$locked.$bind($scope, 'locked').then(function() {
			$timeout.cancel(promise);
			$scope.loading = false;
	
			$scope.$locked.$on('change', function() {
				notificationService.notify('success', 'Saved!', 1000);
			});
		});

		$scope.$on('$destroy', function() {
			$scope.$locked.$off();
		});
	}
]);
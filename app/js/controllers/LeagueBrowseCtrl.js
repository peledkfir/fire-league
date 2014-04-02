
fApp.controller('LeagueBrowseCtrl', function LeagueBrowseCtrl($scope, $timeout, leagueService) {
	'use strict';
	
	$scope.isOwner = leagueService.logic.league.isOwner;
	$scope.keys = Object.keys;

	$scope.loading = false;
	
	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);
	
	var $leagues = $scope.leagues = leagueService.res.league.all.sync();
	$leagues.$on('loaded', function() {
		$timeout.cancel(promise);
		$scope.loading = false;
	});
});
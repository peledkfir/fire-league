
flApp.controller('LeagueSeasonsCtrl', function LeagueSeasonsCtrl($scope, $rootScope, $stateParams, $timeout, leagueService) {
	'use strict';

	$scope.isOwner = leagueService.logic.league.isOwner;
	$scope.keys = Object.keys;

	var name = $scope.leagueName = $stateParams.league;
	$scope.loading = false;
	
	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);
	
	var $seasons = $scope.seasons = leagueService.res.season.all.sync(name);
	$scope.owners = leagueService.res.league.owners.sync(name);

	$seasons.$on('loaded', function() {
		$timeout.cancel(promise);
		$scope.loading = false;
	});
});

fApp.controller('NetworkSeasonsCtrl', function NetworkSeasonsCtrl($scope, $rootScope, $stateParams, $timeout, leagueService) {
	'use strict';

	$scope.isOwner = leagueService.logic.network.isOwner;
	$scope.keys = Object.keys;

	var name = $scope.networkName = $stateParams.network;
	$scope.loading = false;
	
	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);
	
	var $seasons = $scope.seasons = leagueService.res.season.all.sync(name);
	$scope.owners = leagueService.res.network.owners.sync(name);

	$seasons.$on('loaded', function() {
		$timeout.cancel(promise);
		$scope.loading = false;
	});
});
'use strict';

fApp.controller('NetworkLeaguesCtrl', function NetworkLeaguesCtrl($scope, $stateParams, $timeout, leagueService) {
	$scope.getPlayersNum = function(league) {
		return Object.keys(league.players).length;
	};

	var name = $scope.networkName = $stateParams.network;
	$scope.loading = false;
	
	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);
	
	var $leagues = $scope.leagues = leagueService.res.league.all.sync(name);
	
	$leagues.$on('loaded', function() {
		$timeout.cancel(promise);
		$scope.loading = false;
	});
});
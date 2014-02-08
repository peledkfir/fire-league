'use strict';

fApp.controller('NetworkLeaguesCtrl', function NetworkLeaguesCtrl($scope, $stateParams, leagueService) {
	$scope.getPlayersNum = function(league) {
		return Object.keys(league.players).length;
	};

	var name = $scope.networkName = $stateParams.network;
	$scope.leagues = leagueService.res.league.all.sync(name);
});
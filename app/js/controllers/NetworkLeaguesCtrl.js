
fApp.controller('NetworkLeaguesCtrl', function NetworkLeaguesCtrl($scope, $rootScope, $stateParams, $timeout, leagueService) {
	'use strict';

	$scope.getPlayersNum = function(league) {
		if (league.players) {
			return Object.keys(league.players).length;
		}

		return 0;
	};

	var name = $scope.networkName = $stateParams.network;
	$scope.isOwner = false;
	$scope.loading = false;
	
	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);
	
	var $leagues = $scope.leagues = leagueService.res.league.all.sync(name);
	var $owners = leagueService.res.network.owners.sync(name);

	$scope.isOwner = function() {
		if ($rootScope.auth.user) {
			return _.has($owners, $rootScope.auth.user.uid);
		}

		return false;
	};
	
	$leagues.$on('loaded', function() {
		$timeout.cancel(promise);
		$scope.loading = false;
	});
});
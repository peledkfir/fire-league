'use strict';

fApp.controller('LeagueCtrl', function LeagueCtrl($scope, $stateParams, $timeout, leagueService) {
	var league = $stateParams.league;
	var network = $stateParams.network;
	$scope.league = { name: league };

	var leagueRef = leagueService.res.league.ref(network, league);

	var syncTable = function() {
		_.merge($scope.league, _.pick($scope.leagueData, 'rounds'));
		//var leagueCopy = _.merge(angular.copy($scope.league), _.pick($scope.leagueData, 'rounds'));
		$scope.table = leagueService.table($scope.league);	
	};

	$scope.loading = false;

	var promise = $timeout(function(){
		$scope.loading = true;		
	}, 50);

	leagueRef.once('value', function(snap) {
		var leagueVal = snap.val();
		$scope.league = leagueService.build(leagueVal.name, leagueVal.players);

		$scope.leagueData = leagueService.res.league.table.sync(network, league);
		$scope.leagueData.$on('loaded', function() {
			$scope.loading = false;
			$timeout.cancel(promise);
			syncTable();
		});

		$scope.leagueData.$on('change', function() {
			syncTable();
		});
	});
});
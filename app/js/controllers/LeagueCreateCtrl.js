'use strict';

fApp.controller('LeagueCreateCtrl', function LeagueCreateCtrl($scope, $stateParams, leagueService) {
	$scope.create = function() {
		// Prepare model
		var teams = $scope.teams;
		var newLeague = { name: $scope.name };
		newLeague.players = [];

		for (var i = 0; i < teams.length; i++) {
			newLeague.players.push(angular.copy(teams[i]));
		}

		console.log(newLeague);

		// Creates the league
		leagueService.res.league.set(network, newLeague);

		// Connects the users to the league
		for (var j = teams.length - 1; j >= 0; j--) {
			leagueService.res.favorites.league.set(leagueService.ids.facebook(teams[j].id), network, newLeague.name);
		}
	};

	$scope.$watchCollection('teams', function(newTeams, oldTeams, $scope) {
		$scope.leaguePreview = leagueService.build($scope.name, newTeams);
	});

	$scope.sortableOptions = {
		connectWith: '.players',
		placeholder: 'playerPlaceholder'
	};

	var network = $scope.network = $stateParams.network;
	$scope.bench = [];
	$scope.teams =[];

	// Loading network friends
	var networkFriends = leagueService.res.network.friends.ref(network);
	
	networkFriends.once('value', function(snap) {
		$scope.teams = _.toArray(snap.val());
	});
});

fApp.controller('LeagueCreateCtrl', function LeagueCreateCtrl($scope, $state, $timeout, $stateParams, leagueService) {
	'use strict';

	var network = $scope.network = $stateParams.network;
	
	$scope.benchPlayer = function($index) {
		var benched = $scope.teams.splice($index, 1);
		$scope.bench.push(benched[0]);
	};

	$scope.create = function() {
		// Prepare model
		var teams = $scope.teams;
		var newLeague = { name: $scope.name };
		newLeague.players = {};

		for (var i = 0; i < teams.length; i++) {
			newLeague.players[leagueService.ids.facebook(teams[i].id)] = _.extend(angular.copy(teams[i]), { $priority: i });
		}

		console.log(newLeague);

		// Creates the league
		leagueService.res.league.$set(network, newLeague);

		// Connects the users to the league
		for (var j = teams.length - 1; j >= 0; j--) {
			leagueService.res.favorites.league.set(leagueService.ids.facebook(teams[j].id), network, newLeague.name);
		}

		$state.go('league', {network: network, league: newLeague.name});
	};

	$scope.$watchCollection('teams', function(newTeams, oldTeams, $scope) {
		$scope.leaguePreview = leagueService.build($scope.name, newTeams);
	});

	$scope.sortableOptions = {
		helper: function(ev, el) {
			var $el = $(el);
			$el.css({width: $el.outerWidth() + 'px', height: $el.outerHeight() + 'px'});
			return $el;
		},
		connectWith: '.players',
		placeholder: 'player-placeholder'
	};

	$scope.bench = [];
	$scope.teams =[];

	$scope.loading = false;
	$scope.currPage = 1;

	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);

	// Loading network friends
	var networkFriends = leagueService.res.network.friends.ref(network);
	
	networkFriends.once('value', function(snap) {
		$timeout.cancel(promise);
		$scope.loading = false;
		$scope.teams = _.toArray(snap.val());
		$scope.$digest();
	});
});

flApp.controller('SeasonCreateCtrl', function SeasonCreateCtrl($scope, $state, $timeout, $stateParams, leagueService) {
	'use strict';

	var league = $scope.league = $stateParams.league;
	
	$scope.benchPlayer = function($index) {
		var benched = $scope.teams.splice($index, 1);
		$scope.bench.push(benched[0]);
	};

	$scope.create = function() {
		// Prepare model
		var teams = $scope.teams;
		var newSeason = { name: $scope.name };
		newSeason.players = {};

		for (var i = 0; i < teams.length; i++) {
			newSeason.players[leagueService.ids.facebook(teams[i].id)] = _.extend(angular.copy(teams[i]), { $priority: i });
		}

		console.log(newSeason);

		// Creates the season
		leagueService.res.season.$set(league, newSeason);

		// Connects the users to the season
		for (var j = teams.length - 1; j >= 0; j--) {
			leagueService.res.favorites.season.set(leagueService.ids.facebook(teams[j].id), league, newSeason.name);
		}

		// state ref to child dashboard state till it gets fixed: https://github.com/angular-ui/ui-router/issues/948
		$state.go('season.dashboard', {league: league, season: newSeason.name});
	};

	$scope.$watchCollection('teams', function(newTeams, oldTeams, $scope) {
		$scope.seasonPreview = leagueService.build($scope.name, newTeams);
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

	// Loading league friends
	var leagueFriends = leagueService.res.league.friends.ref(league);
	
	leagueFriends.once('value', function(snap) {
		$timeout.cancel(promise);
		$scope.loading = false;
		$scope.teams = _.toArray(snap.val());
		$scope.$digest();
	});
});
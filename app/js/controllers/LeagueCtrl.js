/**
 * Angular controller of the league page
 * @param {Object} $scope
 * @param {Object} $stateParams
 * @param {Function} $timeout
 * @param {Object} leagueService
 */
fApp.controller('LeagueCtrl', function LeagueCtrl($scope, $rootScope, $stateParams, $timeout, leagueService) {
	'use strict';

	var league = $stateParams.league;
	var network = $stateParams.network;

	var state = {

	};

	var matchMixin = {
		currentUserMatch: function() {
			var match = this;
			if ($rootScope.auth.user) {
				return match && match.home && match.away && (match.home.id == $rootScope.auth.user.id || match.away.id == $rootScope.auth.user.id);
			}

			return false;
		},

		canEdit: function() {
			return state.isOwner || this.currentUserMatch();
		}
	};

	var syncStats = function() {
		if (state.players) {
			// saves ui state aside
			var roundTabInfo = _.map($scope.league.rounds, function(round) { return _.pick(round, 'active'); });
			
			// rebuild league as merge is not sufficient when result is deleted
			var league = leagueService.build(league, state.players, matchMixin);
			var roundsData = _.pick(state.$leagueData, 'rounds');
			
			// merge matches results to league structure
			$.each(roundsData.rounds || [], function (r, round) {
				var roundObj = league.rounds[r];
				
				if (round) {
					$.each(round.matches, function(m, match) {
						_.merge(roundObj.matches[m], match);
					});
				}
			});

			// merge back ui state
			_.merge(league.rounds, roundTabInfo);

			// update scope
			$scope.league = league;
			$scope.stats = leagueService.stats($scope.league);
		} else if (_.isArray(state.$players.$getIndex()) && state.$players.$getIndex().length > 0) {
			var keys = state.$players.$getIndex();
			var players = [];
			keys.forEach(function(key, i) {
				players.push(state.$players[key]);
			});

			state.players = players;

			syncStats();
		}
	};

	$scope.cancelEdit = function() {
		$scope.editedMatch = null;
	};

	$scope.editMatch = function(match) {
		if (match.canEdit()) {
			if ($scope.editedMatch) {
				$scope.cancelEdit();
			}

			state.originalMatch = match;
			$scope.editedMatch = match;
			$scope.editedResult = angular.extend({}, match.result);
		}
	};

	$scope.doneEditing = function(match) {
		var result = $scope.editedResult;
		$scope.cancelEdit();

		if (result && _.isNumber(result.away) && _.isNumber(result.home) && result.away >= 0 && result.home >= 0) {
			// checking if adding match result for the first time
			if (!state.$leagueData.rounds) {
				state.$leagueData.rounds = {};
			}

			if (!state.$leagueData.rounds[match.round - 1]) {
				state.$leagueData.rounds[match.round - 1] = { matches: {} };
			}

			match.result = angular.copy(result);
			state.$leagueData.rounds[match.round - 1].matches[match.match - 1] = { result: angular.copy(result) };
		} else {
			if (state.$leagueData.rounds && state.$leagueData.rounds[match.round - 1] && state.$leagueData.rounds[match.round - 1].matches) {
				delete match.result;
				delete state.$leagueData.rounds[match.round - 1].matches[match.match - 1];
			}
		}
		
		state.$leagueData.$save();
	};

	state.$players = leagueService.res.league.players.sync(network, league);
	var ownersRef = leagueService.res.network.owners.ref(network);

	$scope.loading = false;
	$scope.league = { name: league };

	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);

	// TODO: update when logged in
	ownersRef.once('value', function(snap) {
		if ($rootScope.auth.user) {
			state.isOwner = _.has(snap.val(), $rootScope.auth.user.uid);
		}
	});

	state.$players.$on('loaded', function() {
		state.$leagueData = leagueService.res.league.table.sync(network, league);

		state.$leagueData.$on('loaded', function() {
			$scope.loading = false;
			$timeout.cancel(promise);
			syncStats();
		});

		state.$leagueData.$on('change', function() {
			syncStats();
		});
	});
});
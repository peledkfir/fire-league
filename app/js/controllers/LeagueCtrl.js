/**
 * Angular controller of the league page
 * @param {Object} $scope
 * @param {Object} $stateParams
 * @param {Function} $timeout
 * @param {Object} leagueService
 */
fApp.controller('LeagueCtrl', function LeagueCtrl($scope, $rootScope, $modal, leagueName, networkName, $timeout, leagueService) {
	'use strict';

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
			return $scope.isOwner() || this.currentUserMatch();
		},

		edit: function() {
			state.openEditMatchModal(this);
		},

		versus: function(team) {
			return this.home.name == team ? this.away : this.home;
		},

		conclude: function(team) {
			if (this.result) {
				if (this.result.home == this.result.away) {
					return 'D';
				}

				if (this.result.home > this.result.away) {
					return this.home.name == team ? 'W' : 'L';
				}

				return this.home.name == team ? 'L' : 'W';
			}
		}
	};

	var syncStats = function() {
		if (state.players) {
			// saves ui state aside
			var roundTabInfo = _.map($scope.league.rounds, function(round) { return _.pick(round, 'active'); });
			
			// rebuild league as merge is not sufficient when result is deleted
			var league = leagueService.build(leagueName, state.players, matchMixin);
			var roundsData = _.pick(state.$leagueData, 'rounds');
			
			// merge matches results to league structure
			_.each(roundsData.rounds || [], function (round, r) {
				var roundObj = league.rounds[r];
				
				if (round) {
					_.each(round.matches, function(match, m) {
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

	state.openEditMatchModal = function (match) {
		if (match.canEdit()) {
			var modal = $modal.open({
				templateUrl: 'templates/MatchEditModal.html',
				resolve: {
					$leagueCtrlScope: function() {
						return $scope;
					},
					match: function() {
						return match;
					}
				},
				controller: 'MatchEditModalCtrl'
			});

			modal.result.then(function(result) {
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
			});
		}
	};

	$scope.isOwner = function() {
		if ($rootScope.auth && $rootScope.auth.user) {
			return _.has(state.$owners, $rootScope.auth.user.uid);
		}

		return false;
	};

	state.$players = leagueService.res.league.players.sync(networkName, leagueName);
	state.$owners = leagueService.res.network.owners.sync(networkName);

	$scope.loading = false;
	$scope.league = { name: leagueName };
	$scope.networkName = networkName;

	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);

	state.$players.$on('loaded', function() {
		state.$leagueData = leagueService.res.league.table.sync(networkName, leagueName);

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
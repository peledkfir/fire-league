/**
 * Angular controller of the season page
 * @param {Object} $scope
 * @param {Object} $stateParams
 * @param {Function} $timeout
 * @param {Object} leagueService
 */
flApp.controller('SeasonCtrl', function SeasonCtrl($scope, $rootScope, $modal, params, $timeout, notificationService, leagueService) {
	'use strict';

	var seasonName = params.seasonName,
		leagueName = params.leagueName;

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
			return leagueService.logic.league.isOwner(state.$owners, $rootScope.auth) || this.currentUserMatch();
		},

		edit: function() {
			state.openEditMatchModal(this);
		},

		hasImages: function() {
			return Boolean(this.images);
		},

		showImages: function() {
			state.openMatchImagesModal(this);
		}
	};

	var syncStats = function() {
		if (state.players) {
			// saves ui state aside
			var roundTabInfo = _.map($scope.season.rounds, function(round) { return _.pick(round, 'active'); });
			
			// rebuild season as merge is not sufficient when result is deleted
			var season = leagueService.build(seasonName, state.players, matchMixin);
			var roundsData = _.pick(state.$seasonData, 'rounds');
			
			// merge matches results to season structure
			_.each(roundsData.rounds || [], function (round, r) {
				var roundObj = season.rounds[r];
				
				if (round) {
					_.each(round.matches, function(match, m) {
						_.merge(roundObj.matches[m], match);
					});
				}
			});

			// merge back ui state
			_.merge(season.rounds, roundTabInfo);

			// update scope
			$scope.season = season;
			$scope.stats = leagueService.stats($scope.season);
			// var stats = 
			// stats.overdueRounds = _(stats.season.allMatches)
			//	.filter(function(val) { return val.isOverdue(); })
			//	.groupBy(function(val) { return val.round; })
			//	.value();
			// stats.overdueRoundsLength = _.size(stats.overdueRounds);
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

	state.openMatchImagesModal = function(match) {
		if (match.hasImages()) {
			var modal = $modal.open({
				templateUrl: 'templates/MatchImagesModal.html',
				resolve: {
					match: function() {
						return match;
					}
				},
				controller: 'MatchImagesModalCtrl'
			});
		}
	};

	state.openEditMatchModal = function (match) {
		if (match.canEdit()) {
			var modal = $modal.open({
				templateUrl: 'templates/MatchEditModal.html',
				resolve: {
					match: function() {
						return match;
					},
					folder: function() {
						return leagueService.ids.cloudinary.folder(leagueName, seasonName, match);
					}
				},
				controller: 'MatchEditModalCtrl'
			});

			modal.result.then(function(modalResult) {
				var result = (modalResult ? modalResult.result : null);

				if (result && _.isNumber(result.away) && _.isNumber(result.home) && result.away >= 0 && result.home >= 0) {
					// checking if adding match result for the first time
					if (!state.$seasonData.rounds) {
						state.$seasonData.rounds = {};
					}

					if (!state.$seasonData.rounds[match.round - 1]) {
						state.$seasonData.rounds[match.round - 1] = { matches: {} };
					}

					match.result = angular.copy(result);
					match.images = _.pluck(modalResult.images, 'id');
					state.$seasonData.rounds[match.round - 1].matches[match.match - 1] = { result: angular.copy(result), images: match.images };
				} else {
					if (state.$seasonData.rounds && state.$seasonData.rounds[match.round - 1] && state.$seasonData.rounds[match.round - 1].matches) {
						delete match.result;
						delete match.images;
						delete state.$seasonData.rounds[match.round - 1].matches[match.match - 1];
					}
				}
				
				state.$seasonData.$save().then(function() {
					notificationService.notify('success', 'Saved !', 2000);
				}, function() {
					notificationService.notify('danger', 'Failed !', 3500);
				});
			});
		}
	};

	state.$players = leagueService.res.season.players.sync(leagueName, seasonName);
	state.$owners = leagueService.res.league.owners.sync(leagueName);

	$scope.loading = false;
	$scope.season = { name: seasonName };
	$scope.leagueName = leagueName;

	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);

	state.$players.$on('loaded', function() {
		state.$seasonData = leagueService.res.season.table.sync(leagueName, seasonName);

		state.$seasonData.$on('loaded', function() {
			$scope.loading = false;
			$timeout.cancel(promise);
			syncStats();
		});
		
		state.$seasonData.$on('change', function() {
			syncStats();
		});
	});
});
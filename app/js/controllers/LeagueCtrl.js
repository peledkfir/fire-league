/**
 * Angular controller of the league page
 * @param {Object} $scope
 * @param {Object} $stateParams
 * @param {Function} $timeout
 * @param {Object} leagueService
 */
fApp.controller('LeagueCtrl', function LeagueCtrl($scope, $rootScope, $stateParams, $timeout, leagueService) {
	'use strict';

	var syncTable = function() {
		var roundTabInfo = _.map($scope.league.rounds, function(round) { return _.pick(round, 'active'); });
		$scope.league = leagueService.build($scope.leagueInfo.name, $scope.leagueInfo.players);
		var roundsData = _.pick($scope.leagueData, 'rounds');
		
		$.each(roundsData.rounds, function (r, round) {
			var roundObj = $scope.league.rounds[r];
			
			if (round) {
				$.each(round.matches, function(m, match) {
					_.merge(roundObj.matches[m], match);
				});
			}
		});

		_.merge($scope.league.rounds, roundTabInfo);
		$scope.table = leagueService.table($scope.league);
	};

	// TODO: update when logged in
	$scope.currentUserMatch = function(match) {
		if ($rootScope.auth.user) {
			return match && match.home && match.away && (match.home.id == $rootScope.auth.user.id || match.away.id == $rootScope.auth.user.id);
		}

		return false;
	};

	$scope.cancelEdit = function() {
		var originalMatch = $scope.originalMatch;
		$scope.league.rounds[originalMatch.round - 1].matches[originalMatch.match - 1] = originalMatch;
		$scope.editedMatch = null;
	};

	$scope.editMatch = function(match) {
		if ($scope.isOwner || $scope.currentUserMatch(match)) {
			if ($scope.editedMatch) {
				$scope.cancelEdit();
			}

			$scope.editedMatch = match;
			$scope.originalMatch = angular.extend({}, $scope.editedMatch);
			$scope.originalMatch.result = angular.extend({}, $scope.editedMatch.result);
		}
	};

	$scope.doneEditing = function(match) {
		$scope.editedMatch = null;
		
		if (match.result && match.result.away >= 0 && match.result.home >= 0) {
			// checking if adding match result for the first time
			if (!$scope.leagueData.rounds) {
				$scope.leagueData.rounds = {};
			}

			if (!$scope.leagueData.rounds[match.round - 1]) {
				$scope.leagueData.rounds[match.round - 1] = { matches: {} };
			}

			$scope.leagueData.rounds[match.round - 1].matches[match.match - 1] = { result: angular.copy(match.result) };
		} else {
			if ($scope.leagueData.rounds && $scope.leagueData.rounds[match.round - 1] && $scope.leagueData.rounds[match.round - 1].matches) {
				delete $scope.leagueData.rounds[match.round - 1].matches[match.match - 1];
			}
		}
		
		$scope.leagueData.$save();
	};

	var league = $stateParams.league;
	var network = $stateParams.network;

	var leagueRef = leagueService.res.league.ref(network, league);
	var ownersRef = leagueService.res.network.owners.ref(network);

	$scope.loading = false;
	$scope.league = { name: league };

	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);

	// TODO: update when logged in
	ownersRef.once('value', function(snap) {
		if ($rootScope.auth.user) {
			$scope.isOwner = _.has(snap.val(), $rootScope.auth.user.uid);
		}
	});

	leagueRef.once('value', function(snap) {
		var leagueVal = $scope.leagueInfo = snap.val();
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
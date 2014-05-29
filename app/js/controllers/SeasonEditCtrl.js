
flApp.controller('SeasonEditCtrl', ['$scope', '$stateParams', '$timeout', 'leagueService', 'notificationService',
	function($scope, $stateParams, $timeout, leagueService, notificationService) {
		'use strict';
		var leagueName = $stateParams.league;
		var seasonName = $stateParams.season;

		$scope.loading = -3;

		var $players = leagueService.res.season.players.sync(leagueName, seasonName);
		$scope.$locked = leagueService.res.season.locked.sync(leagueName, seasonName);
		$scope.$roundOverwrite = leagueService.res.season.roundOverwrite.sync(leagueName, seasonName);

		$players.$on('loaded', function() {
			var players = $players.$getIndex().length;
			var rounds = $scope.rounds = new Array((players % 2 == 1 ? players : players - 1) * 2);
			for (var i = rounds.length - 1; i >= 0; i--) {
				rounds[i] = i + 1;
			};
			$scope.loading += 1;
		});

		$scope.$roundOverwrite.$bind($scope, 'roundOverwrite').then(function() {
			$scope.loading += 1;

			// TODO: doesn't actually notifies when data is synced..
			// waiting for answer: https://groups.google.com/forum/#!topic/firebase-angular/iIFi9YfT6fU
			$scope.$roundOverwrite.$on('change', function() {
				notificationService.notify('info', 'Synced', 1000);
			});
		});

		$scope.$locked.$bind($scope, 'locked').then(function() {
			$scope.loading += 1;

			$scope.$locked.$on('change', function() {
				notificationService.notify('info', 'Synced', 1000);
			});
		});

		$scope.$on('$destroy', function() {
			$scope.$roundOverwrite.$off();
			$scope.$locked.$off();
		});
	}
]);
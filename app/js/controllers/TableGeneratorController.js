'use strict';

app.controller('TableGeneratorController',
	function TableGeneratorController($scope, teamsData, leagueBuilder, tableCalculator) {
		// $scope.scrollToRound = function (round) {
			//$anchorScroll();
			// $('#r' + round)[0].scrollIntoView();
			// scrollBy(0, -50);
		// };

		$scope.teams = teamsData.jive.teams;

		$scope.league = leagueBuilder.build('jive', $scope.teams);

		// test
		$scope.league.rounds[0].matches[0].result = { home: 5, away: 2};
		$scope.league.rounds[0].matches[1].result = { home: 2, away: 2};

		$scope.table = tableCalculator.calc($scope.league);
	});
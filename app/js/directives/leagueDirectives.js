
fApp.directive('leagueTablePanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: false,// workaround for firebase hosting
		templateUrl: 'templates/directives/LeagueTablePanel.html',
		scope: {
			table: '='
		}
	};
})
.directive('leagueCurrRoundPanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: false,// workaround for firebase hosting
		templateUrl: 'templates/directives/LeagueCurrRoundPanel.html',
		scope: {
			stats: '='
		},
		link: function($scope) {
			//Use $watch - will get called every time the value changes:
			$scope.$watch('stats', function(stats) {
				if (!$scope.currPage && stats) {
					$scope.currPage = stats.currentRound;
				}
			});
		}
	};
});

fApp.directive('appVersion', ['version', function(version) {
	'use strict';
    
	return function(scope, elm) {
		elm.text(version);
	};
}])
.directive('leagueTablePanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/LeagueTablePanel.html',
		scope: {
			table: '=',
			maximizeUrl: '@'
		},
		link: function($scope) {
			$scope.abs = Math.abs;
		}
	};
})
.directive('leagueCurrRoundPanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
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
})
.directive('leaguePlayerCompetition', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/LeaguePlayerCompetition.html',
		scope: {
			stats: '=',
			player: '='
		}
	};
})
.directive('editableFriendsList', function() {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/EditableFriendsList.html',
		scope: {
			friends: '='
		},
		controller: function($scope) {
			$scope.addFriend = function(item, model, label) {
				$scope.friends.push({id: parseInt(item.uid), name: item.name, isNew: true});
			};
			
			$scope.removeFriend = function(index) {
				if ($scope.friends[index].isNew) {
					$scope.friends.splice(index, 1);
				} else {
					$scope.friends[index].isDeleted = true;
				}
			};

			$scope.reAddFriend = function(index) {
				$scope.friends[index].isDeleted = false;
			};
		}
	};
});

flApp.directive('flAppVersion', ['version', function(version) {
	'use strict';
    
	return function(scope, elm) {
		elm.text(version);
	};
}])
.directive('flSpinner', function() {
	'use strict';
	
	return {
		restrict: 'A',
		link: function($scope, $element) {
			$element.addClass('fa fa-spin fa-circle-o-notch');
		}
	};
})
.directive('flSeasonTablePanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonTablePanel.html',
		scope: {
			table: '=',
			maximizeUrl: '@'
		},
		link: function($scope) {
			$scope.abs = Math.abs;
		}
	};
})
.directive('flSeasonLatestPanel', function($rootScope) {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonLatestPanel.html',
		scope: {
			latest: '='
		}
	};
})
.directive('flSeasonCurrRoundPanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonCurrRoundPanel.html',
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
.directive('flSeasonPlayerCompetition', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonPlayerCompetition.html',
		scope: {
			stats: '=',
			player: '='
		}
	};
})
.directive('flEditableFriendsList', function() {
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
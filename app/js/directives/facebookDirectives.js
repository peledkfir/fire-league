
flApp.directive('fbAvatar', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		template: '<img class="profile_{{size}} {{clazz}}" ng-src="//graph.facebook.com/{{id}}/picture?type=square&width={{size}}&height={{size}}">',
		scope: {
			clazz: '@',
			size: '=',
			id: '='
		}
	};
})
.directive('fbFriendsTypeahead', function() {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/FacebookFriendsTypeahead.html',
		scope: {
			filter: '=',
			onAddFriend: '&'
		},
		controller: function($scope, Facebook, leagueService) {
			$scope.searchFriend = function(query) {
				var filter = _.map($scope.filter, function(f) { return f.id; }).join();
				var groups = _.chain($scope.groups || []).filter('filter').pluck('gid').value().join();
				var fql = leagueService.facebook.friends.query(query, filter, groups);
				return Facebook.api('/fql', {q: fql}, function(response) {}).then(function(response){
					return response.data;
				});
			};

			$scope.onSelect = function(item, model, label) {
				$scope.onAddFriend({ item: item, model: model, label: label }); // TODO: test whether there is a better way to call outer methods
				$scope.selectedFriend = '';	
			};

			Facebook.api('/fql', { q: leagueService.facebook.groups.query() }, function(response) {}).then(function(response) {
				$scope.groups = response.data;
			});	
		}
	};
});
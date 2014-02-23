'use strict';

fApp.controller('NetworkEditCtrl', function NetworkEditCtrl($scope, $timeout, $state, $stateParams, Facebook, leagueService) {
	$scope.addFriend = function(item, model, label) {
		$scope.network.friends[leagueService.ids.facebook(item.uid)] = {id: item.uid, name: item.name};
		$scope.selectedFriend = '';
	};

	$scope.isOwner = function(friend) {
		return !$scope.network.owners[leagueService.ids.facebook(friend.id)];
	};
	
	$scope.removeFriend = function(friend) {
		delete $scope.network.friends[leagueService.ids.facebook(friend.id)];
	};

	$scope.searchFriend = function(query) {
		var filter = _.map($scope.network.friends, function(f) { return f.id; }).join();
		var fql = leagueService.facebook.friends.query(query, filter);
		return Facebook.api('/fql', {q: fql}, function(response) {}).then(function(response){
			return response.data;
		});
	};

	$scope.save = function() {
		$scope.saving = true;
		$scope.network.$save();

	  	// Connects the users to the network
		for (var id in $scope.network.friends) {
			leagueService.res.favorites.network.set(id, $scope.network.name);
		}

	  	$state.go('^');
	};

	$scope.loading = false;

	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);
	
	var $network = $scope.network = leagueService.res.network.sync($stateParams.network);
	$network.$on('loaded', function() {
		$timeout.cancel(promise);
		$scope.loading = false;
	});

	$scope.saving = false;
});
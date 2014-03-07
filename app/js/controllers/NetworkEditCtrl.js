
fApp.controller('NetworkEditCtrl', function NetworkEditCtrl($scope, $timeout, $state, $stateParams, leagueService) {
	'use strict';
	
	$scope.addFriend = function(item, model, label) {
		$scope.network.friends[leagueService.ids.facebook(item.uid)] = {id: item.uid, name: item.name};
	};

	$scope.isOwner = function(friend) {
		return $scope.network && $scope.network.owners && !$scope.network.owners[leagueService.ids.facebook(friend.id)];
	};
	
	$scope.removeFriend = function(friend) {
		delete $scope.network.friends[leagueService.ids.facebook(friend.id)];
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
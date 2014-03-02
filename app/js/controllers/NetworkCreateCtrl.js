'use strict';

fApp.controller('NetworkCreateCtrl', function NetworkCreateCtrl($scope, $rootScope, $state, leagueService) {	
	$scope.addFriend = function(item, model, label) {
		network.friends.push({id: item.uid, name: item.name});
	};

	$scope.removeFriend = function(index) {
		$scope.network.friends.splice(index, 1);
	};

	$scope.create = function() {
		// Prepare model
		var newNetwork = { name: network.name };
		newNetwork.friends = {};
		
		for (var i = network.friends.length - 1; i >= 0; i--) {
			var friend = angular.copy(network.friends[i]);
			newNetwork.friends[leagueService.ids.facebook(friend.id)] = friend;
		}

		newNetwork.owners = {};
		newNetwork.owners[$rootScope.auth.user.uid] = angular.copy(owner);
		
		console.log(newNetwork);

		// Creates the network
		leagueService.res.network.set(newNetwork);

		// Connects the users to the network
		for (var j = network.friends.length - 1; j >= 0; j--) {
			var friend = network.friends[j];
			leagueService.res.favorites.network.set(leagueService.ids.facebook(friend.id), newNetwork.name);
		}

		$state.go('network', {network: newNetwork.name});
	};

	var network = $scope.network = {
		name: '',
		friends: []
	};
	var owner = { id: Number($rootScope.auth.user.id), name: $rootScope.auth.user.name };
	network.friends.push(owner);
});
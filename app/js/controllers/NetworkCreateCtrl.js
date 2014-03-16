
fApp.controller('NetworkCreateCtrl', function NetworkCreateCtrl($scope, $rootScope, $state, leagueService) {
	'use strict';
	
	$scope.create = function() {
		// Prepare model
		var newNetwork = { name: network.name };
		newNetwork.friends = {};
		
		for (var i = network.friends.length - 1; i >= 0; i--) {
			var friend = { id: network.friends[i].id, name: network.friends[i].name };
			newNetwork.friends[leagueService.ids.facebook(friend.id)] = friend;
		}

		newNetwork.owners = {};
		newNetwork.owners[$rootScope.auth.user.uid] = _.pick(owner, 'id', 'name');
		
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
	var owner = { id: Number($rootScope.auth.user.id), name: $rootScope.auth.user.name, isOwner: true };
	network.friends.push(owner);
});
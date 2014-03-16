
fApp.controller('NetworkEditCtrl', function NetworkEditCtrl($scope, $timeout, $state, $stateParams, leagueService) {
	'use strict';
	var networkName = $stateParams.network;

	$scope.save = function() {
		$scope.saving = true;

		var friendsRef = leagueService.res.network.friends.ref(networkName);
		var newFriends = _.filter($scope.friends, 'isNew');
		var deletedFriends = _.filter($scope.friends, 'isDeleted');

		_.each(newFriends, function(friend) {
			var uid = leagueService.ids.facebook(friend.id);
			friendsRef.child(uid).set({id: friend.id, name: friend.name});
			leagueService.res.favorites.network.set(uid, networkName);
		});

		_.each(deletedFriends, function(friend) {
			friendsRef.child(leagueService.ids.facebook(friend.id)).remove();
		});

		$state.go('^');
	};

	$scope.loading = false;

	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);
	
	var networkRef = leagueService.res.network.ref(networkName);
	networkRef.once('value', function(snap) {
		$timeout.cancel(promise);
		$scope.loading = false;

		var friends = [];
		var network = snap.val();
		_.each(network.friends, function(friend, uid) {
			friends.push({id: friend.id, name: friend.name, isOwner: !_.isUndefined(network.owners[uid])});
		});

		$scope.friends = friends;
	});

	$scope.saving = false;
});
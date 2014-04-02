
fApp.controller('LeagueEditCtrl', function LeagueEditCtrl($scope, $timeout, $state, $stateParams, leagueService) {
	'use strict';
	var leagueName = $stateParams.league;

	$scope.save = function() {
		$scope.saving = true;

		var friendsRef = leagueService.res.league.friends.ref(leagueName);
		var newFriends = _.filter($scope.friends, 'isNew');
		var deletedFriends = _.filter($scope.friends, 'isDeleted');

		_.each(newFriends, function(friend) {
			var uid = leagueService.ids.facebook(friend.id);
			friendsRef.child(uid).set({id: friend.id, name: friend.name});
			leagueService.res.favorites.league.set(uid, leagueName);
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
	
	var leagueRef = leagueService.res.league.ref(leagueName);
	leagueRef.once('value', function(snap) {
		$timeout.cancel(promise);
		$scope.loading = false;

		var friends = [];
		var league = snap.val();
		_.each(league.friends, function(friend, uid) {
			friends.push({id: friend.id, name: friend.name, isOwner: leagueService.logic.league.isOwner(league, uid)});
		});

		$scope.friends = friends;
	});

	$scope.saving = false;
});
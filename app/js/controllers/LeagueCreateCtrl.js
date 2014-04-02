
fApp.controller('LeagueCreateCtrl', function LeagueCreateCtrl($scope, $rootScope, $state, leagueService) {
	'use strict';
	
	$scope.create = function() {
		// Prepare model
		var newLeague = { name: league.name };
		newLeague.friends = {};
		
		for (var i = league.friends.length - 1; i >= 0; i--) {
			var friend = { id: league.friends[i].id, name: league.friends[i].name };
			newLeague.friends[leagueService.ids.facebook(friend.id)] = friend;
		}

		newLeague.owners = {};
		newLeague.owners[$rootScope.auth.user.uid] = _.pick(owner, 'id', 'name');
		
		console.log(newLeague);

		// Creates the league
		leagueService.res.league.set(newLeague);

		// Connects the users to the league
		for (var j = league.friends.length - 1; j >= 0; j--) {
			var friend = league.friends[j];
			leagueService.res.favorites.league.set(leagueService.ids.facebook(friend.id), newLeague.name);
		}

		$state.go('league', {league: newLeague.name});
	};

	var league = $scope.league = {
		name: '',
		friends: []
	};
	var owner = { id: Number($rootScope.auth.user.id), name: $rootScope.auth.user.name, isOwner: true };
	league.friends.push(owner);
});
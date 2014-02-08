'use strict';

fApp.controller('NetworkBrowseCtrl', function NetworkBrowseCtrl($scope, leagueService) {
	$scope.getOwners = function(network) {
		return _.map(network.owners, function(owner) {
			return owner.name;
		}).join(', ');
	};
	$scope.getFriendsNum = function(network) {
		return Object.keys(network.friends).length;
	};
	
	$scope.networks = leagueService.res.network.all.sync();
});
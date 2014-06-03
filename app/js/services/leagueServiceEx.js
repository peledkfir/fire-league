
flApp.run(['$modal', '$state', 'notificationService', 'leagueService', function($modal, $state, notificationService, leagueService){
	'use strict';

	leagueService.res.league.delete = function(league, cb) {
		var friends = leagueService.res.league.friends.ref(league);

		// Deletes all league favorites
		friends.once('value', function(snap) {
			snap.forEach(function(friendSnap) {
				leagueService.res.favorites.league.remove(friendSnap.name(), league);
			});

			// deletes all seasons updates
			leagueService.res.season.latestMatches.remove(league);

			// deletes all seasons data
			leagueService.res.league.seasonsData.remove(league);

			// deletes all the seasons
			leagueService.res.season.all.remove(league);

			// deletes the league
			leagueService.res.league.ref(league).remove(function() {
				if (cb) {
					cb();
				}
			});
		});
	};

	leagueService.logic.league.delete = function(league) {
		var modal = $modal.open({
			templateUrl: 'templates/LeagueDeleteModal.html',
			resolve: {
				league: function() { return league; }
			},
			controller: 'LeagueDeleteCtrl'
		});

		modal.result.then(function(result) {
			if (result) {
				leagueService.res.league.delete(league, function() {
					notificationService.notify('success', 'Deleted', 3500);
					$state.transitionTo('browse');
				});
			}
		});
	};
}]);
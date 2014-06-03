
flApp.service('leagueService', ['firebaseRef', 'syncData', 'SITE_ID', function(firebaseRef, syncData, SITE_ID) {
	'use strict';
	
	var mixinTableRow = {
		gd: function() {
			return this.f - this.a;
		},

		pts: function() {
			return this.w * 3 + this.d;
		}
	};
	
	var service = {
		ids: {
			facebook: function(id) {
				return 'facebook:' + id;
			},
			cloudinary: {
				uuid: function() {
				},

				folder: function(league, season, match) {
					var prefix = SITE_ID ? (SITE_ID + '/') : '';
					return prefix + league + '/' + season + '/' + match.round + '/' + match.match;
				}
			}
		},

		facebook: {
			groups: {
				query: function() {
					return 'SELECT gid, name from group WHERE gid IN (SELECT gid FROM group_member WHERE uid = me())';
				}
			},

			friends: {
				query: function(query, filter, groups) {
					if (filter && filter.length > 0) {
						filter = sprintf('NOT (uid IN (%s)) AND ', filter);
					}

					if (groups && groups.length > 0) {
						groups = sprintf(' OR uid in (SELECT uid FROM group_member WHERE gid IN (%s))', groups);
					}
					var fql = sprintf("SELECT uid, name, pic_square FROM user WHERE %s(uid = me() OR uid IN (SELECT uid2 FROM friend WHERE uid1 = me())%s) AND strpos(lower(name), lower('%s')) >=0 ORDER BY strpos(lower(name), lower('%s')) LIMIT 10", filter, groups, query, query);

					return fql;
				}
			}
		},

		logic: {
			league: {
				isOwner: function(owners, auth) {
					owners = (owners || {}).owners || owners;
					var uid = _.isObject(auth) && auth.user ? auth.user.uid : auth;

					if (uid && owners) {
						return _.has(owners, uid);
					}

					return false;
				}
			}
		},

		res: {
			root: {
				ref: function() {
					return firebaseRef('');
				}
			},

			favorites: {
				sync: function(uid) {
					return syncData('user_favorites/' + uid);
				},

				league: {
					ref: function(uid, name) {
						return firebaseRef('user_favorites/' + uid + '/leagues/' + name);
					},

					set: function(uid, name) {
						var ref = this.ref(uid, name);
						ref.set(true);
					},

					remove: function(uid, name) {
						var ref = this.ref(uid, name);
						ref.remove();
					}
				},

				season: {
					set: function(uid, league, name) {
						var ref = firebaseRef('user_favorites/' + uid + '/leagues/' + league + '/seasons/' + name);
						ref.set(true);
					}
				}
			},

			league: {
				ref: function(name) {
					return firebaseRef('leagues/' + name);
				},

				sync: function(name) {
					return syncData('leagues/' + name);
				},

				set: function(leagueObj) {
					var ref = this.ref(leagueObj.name);
					ref.set(leagueObj);
				},

				all: {
					sync: function() {
						return syncData('leagues');
					}
				},

				owners: {
					ref: function(name){
						return firebaseRef('leagues/' + name + '/owners');
					},

					sync: function(name){
						return syncData('leagues/' + name + '/owners');
					}
				},

				friends: {
					ref: function(name) {
						return firebaseRef('leagues/' + name + '/friends');
					}
				},

				seasonsData: {
					ref: function(name) {
						return firebaseRef('season_matches/' + name);
					},

					remove: function(name) {
						var ref = this.ref(name);
						ref.remove();
					}
				}
			},

			season: {
				$set: function(league, seasonObj) {
					var sync = this.sync(league, seasonObj.name);
					sync.$set(seasonObj);
				},

				sync: function(league, season) {
					var sync = syncData('league_seasons/' + league + '/' + season);
					return sync;
				},

				roundOverwrite: {
					ref: function(league, season) {
						return firebaseRef('league_seasons/' + league + '/' + season + '/roundOverwrite');
					},
					sync: function(league, season) {
						return syncData('league_seasons/' + league + '/' + season + '/roundOverwrite');
					}
				},

				locked: {
					sync: function(league, season) {
						return syncData('league_seasons/' + league + '/' + season + '/locked');
					}
				},

				players: {
					sync: function(league, season) {
						var sync = syncData('league_seasons/' + league + '/' + season + '/players');
						return sync;
					}
				},

				set: function(league, seasonObj) {
					var ref = this.ref(league, seasonObj.name);
					ref.set(seasonObj);
				},

				ref: function(league, season) {
					var ref = firebaseRef('league_seasons/' + league + '/' + season);
					return ref;
				},

				table: {
					sync: function (league, season) {
						return syncData('season_matches/' + league + '/' + season);
					}
				},

				latestMatches: {
					sync: function(league, season, limit) {
						return syncData('season_matches_latest/' + league + '/' + season + '/list', limit);
					},

					key: function(match) {
						return match.round + '_' + match.match;
					},

					set: function($latestMatches, match, uid) {
						$latestMatches.$child(this.key(match)).$set({ author: uid, $priority: Firebase.ServerValue.TIMESTAMP });
					},

					remove: function(league, season) {
						var url = 'season_matches_latest/' + league;

						if (season) {
							url += '/' + season;
						}

						var ref = firebaseRef(url);
						ref.remove();
					}
				},

				all: {
					ref: function(league) {
						return firebaseRef('league_seasons/' + league);
					},

					sync: function(league) {
						return syncData('league_seasons/' + league);
					},

					remove: function(league) {
						var ref = this.ref(league);
						ref.remove();
					}
				}
			},

			user: {
				set: function(uid, user) {
					var ref = firebaseRef('users/' + uid);
					ref.set(user);
				},
				lastOnline: {
					ref: function(uid) {
						return firebaseRef('users/' + uid + '/lastOnline');
					}
				}
			},

			_info: {
				connected: function() {
					return firebaseRef('.info/connected');
				}
			},

			cloudinary_hash: {
				requests: {
					set: function(uid, params) {
						var ref = firebaseRef('cloudinary_hash/requests/' + uid);
						ref.set(params);
					}
				},

				results: {
					ref: function(uid) {
						return firebaseRef('cloudinary_hash/results/' + uid);
					}
				}
			}
		},

		build: function(name, teams, matchMixin) {
			var indexer = function (round, teams, away) {
				var totalRounds = teams - 1;
				return (totalRounds - away - round) % totalRounds + 1;
			};
			var next = function(index, teams, match, skip) {
				return (index + match - 1 + skip) % teams;
			};
			var previous = function(index, teams, match, skip) {
				return (index - match + teams - skip) % teams;
			};

			matchMixin = _.extend(matchMixin || {}, {
				versus: function(teamId) {
					return this.home.id == teamId ? this.away : this.home;
				},

				conclude: function(teamId) {
					if (this.result) {
						if (this.result.home == this.result.away) {
							return 'D';
						}

						if (this.result.home > this.result.away) {
							return this.home.id == teamId ? 'W' : 'L';
						}

						return this.home.id == teamId ? 'L' : 'W';
					}
				},

				isOverdue: function(currentRound) {
					return this.round < currentRound && !this.result;
				}
			});

			var season = {
				name: name,
				teams: teams
			};

			var dummy = teams.length % 2;
			var dummyIdx = teams.length;

			var cnt = teams.length + dummy;
			var matchesInRound = Math.floor(cnt/2);

			var rounds = [];

			var p = 0; // pinned

			for (var i = 0; i < 2; i++) {
				// walking through the rounds
				for (var r = 0; r < cnt - 1; r++) {
					var hi = indexer(r, cnt, 0); // home index
					var ai = indexer(r, cnt, 1); // away index
					var sh = 0, // home skip
						sa = 0, // away skip
						matches = [],
						round = i * (cnt - 1) + r + 1,
						dummyMatched = 0;

					// walking through the matches
					for (var m = 0; m < matchesInRound; m++) {
						var h; // home
						if (m === 0) {
							h = p;
						} else {
							h = next(hi, cnt, m, sh);

							// skip pinned
							if (h == p) {
								sh = 1;
								h++;
							}
						}

						var a = previous(ai, cnt, m, sa); // away
						if (a === 0) {
							sa = 1;
							a = previous(ai, cnt, m, sa);
						}

						if (dummy && (h == dummyIdx || a == dummyIdx)) {
							dummyMatched = 1;
						} else {
							// console.log('r' + (r+1) + 'm' + (m+1) + 'hi'+ hi + 'ai'+ ai+ 'h' + h + 'a' + a);
							var match = _.extend({
								round: round,
								match: m + 1 - dummyMatched,
								matchIdx: (round - 1) * (matchesInRound - dummy) + m + 1 - dummyMatched,
								home: teams[i === 0 ? h : a],
								away: teams[i === 0 ? a : h]
							}, matchMixin || {});
							matches.push(match);
						}
					}

					rounds.push({
						number: round,
						matches: matches
					});
				}
			}

			season.matchInRound = matchesInRound - dummy;
			season.rounds = rounds;
			season.totalMatches = season.matchInRound * rounds.length;

			return season;
		},


		/**
		 * Calculates statistices of given season
		 * @param  {Season} season The season to calc the statistices for
		 * @return {Statistices} Calculated statistics
		 */
		stats: function (season, roundOverwrite) {
			var tblHash = {};
			var teamStats = {};

			for (var t = 0; t < season.teams.length; t++) {
				var team = season.teams[t];

				/**
				 * @typedef TableRow
				 * @type {Object}
				 * @property {Object} team associated team table information
				 * @property {Number} p played matches
				 * @property {Number} w matches won
				 * @property {Number} d matches ended draw
				 * @property {Number} l matches lose
				 * @property {Number} f goals for
				 * @property {Number} a goals against
				 * @property {Function} gd goal difference
				 * @property {Function} pts points
				 */
				tblHash[team.name] = _.extend({
					team: team,
					p: 0,
					w: 0,
					d: 0,
					l: 0,
					f: 0,
					a: 0
				}, mixinTableRow);

				/**
				 * @typedef TeamStats
				 * @type {Object}
				 * @property {Array.<Number>} posPerRound Specifies the team position per round (value index is mapped to round number - 1)
				 * @property {Array.<Number>} ptsPerRound Specifies the team points per round (value index is mapped to round number - 1)
				 * @property {Number} missingMatches Number of unplayed matches of previous rounds (previous to current round)
				 */
				teamStats[team.name] = {
					team: team,
					posPerRound: [],
					ptsPerRound: [],
					missingMatches: 0
				};
			}

			var currentRound = 1,
				totalPlayedMatches = 0;
			var allMatches = [];

			_.each(season.rounds, function(round) {
				if (round.matches) {
					var resultCount = 0;

					_.each(round.matches, function(match) {
						allMatches.push(match);

						if (match.result) {
							totalPlayedMatches++;
							resultCount++;
							var h = tblHash[match.home.name];
							var a = tblHash[match.away.name];
							h.p++;
							a.p++;

							h.f += match.result.home;
							h.a += match.result.away;

							a.f += match.result.away;
							a.a += match.result.home;

							if (match.result.home == match.result.away) {
								h.d++;
								a.d++;
							} else {
								var winner = match.result.home > match.result.away ? h : a;
								var looser = winner == h ? a : h;
								winner.w++;
								looser.l++;
							}
						}
					});

					if (resultCount > 0) {
						currentRound = round.number;

						if (resultCount  == season.matchInRound && round.number < season.rounds.length) {
							currentRound++;
						}
					}
				}

				// workaround until lodash support sort by functions
				_.each(tblHash, function(row) {
					row.ptsR = row.pts();
					row.gdR = row.gd();
				});

				var positions = _.sortBy(_.toArray(tblHash), ['ptsR', 'gdR', 'f']);

				_.each(positions, function(tableRow, posReversed, col) {
					var pos = col.length - posReversed;
					teamStats[tableRow.team.name].posPerRound.push(pos);
					teamStats[tableRow.team.name].ptsPerRound.push(tableRow.ptsR);
				});
			});

			var totalMissingMatches = 0;

			// overwrites current round if valid
			if (roundOverwrite >= 1 && roundOverwrite <= season.rounds.length && roundOverwrite > currentRound) {
				currentRound = roundOverwrite;
			}

			if (currentRound > 1) {
				_.each(allMatches, function(match) {
					if (match.isOverdue(currentRound)) {
						teamStats[match.home.name].missingMatches++;
						teamStats[match.away.name].missingMatches++;
						totalMissingMatches++;
					}
				});

				_.each(teamStats, function(stats, team) {
					tblHash[team].posChange = stats.posPerRound[currentRound-2] - stats.posPerRound[currentRound-1];
				});
			}
			
			var table = _.sortBy(_.toArray(tblHash), function(row) { return teamStats[row.team.name].posPerRound[season.rounds.length - 1]; });
			/**
			 * @typedef Statistices
			 * @type {Object}
			 * @property {Array.<TableRow>} table Ordered table rows from the first place to the last. 
			 * @property {Season} season Season general information which processed the stats for.
			 * @property {Number} currentRound Current round playing
			 * @property {Object<string, TeamStats>} teamStats Dictionary of stats per team 
			 * @property {Number} totalMissingMatches Number of matches that are not played (before current round)
			 */
			return {
				table: table,
				season: season,
				currentRound: currentRound,
				teamStats: teamStats,
				totalMissingMatches: totalMissingMatches,
				totalPlayedMatches: totalPlayedMatches
			};
		},

		filterPlayerUpcoming: function(stats, below, after, overdue) {
			var matches = [];

			if (stats && stats.season.rounds) {
				var rounds = stats.season.rounds;
				
				for (var i = 0; i < Math.min(rounds.length, stats.currentRound + after); i++) {
					var round = rounds[i];
					var match = null;

					for (var j = round.matches.length - 1; j >= 0; j--) {
						if (round.matches[j].currentUserMatch()) {
							match = round.matches[j];
							break;
						}
					}

					if (match && ((stats.currentRound - below <= match.round && match.round <= stats.currentRound + after) ||
									(overdue && match.isOverdue(stats.currentRound)))) {
						matches.push(match);
					}
				}
			}

			return matches;
		},

		latestMatches: function(season, $latestMatches, lastTimeOnline) {
			var matches = [];
			var keys = $latestMatches.$getIndex();
			var newItems = 0;

			for (var i = keys.length - 1; i >= 0; i--) {
				var matchSplit = keys[i].split('_');
				var round = parseInt(matchSplit[0], 10) - 1;
				var match = parseInt(matchSplit[1], 10) - 1;
				var timestamp = $latestMatches[keys[i]].$priority;
				if (timestamp > lastTimeOnline) {
					newItems++;
				}
				matches.push( { timestamp: timestamp, match: season.rounds[round].matches[match]});
			}

			return {
				new: newItems,
				matches: matches
			};
		}
	};

	return service;
}]);
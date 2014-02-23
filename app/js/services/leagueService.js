'use strict';

fApp.service('leagueService', function(firebaseRef, syncData) {
	var mixinTableRow = {
		gd: function() {
			return this.f - this.a;
		},

		pts: function() {
			return this.w * 3 + this.d;
		}
	};
	
	return {
		ids: {
			facebook: function(id) {
				return 'facebook:' + id;
			}
		},

		facebook: {
			friends: {
				query: function(query, filter) {
					if (filter && filter.length > 0) {
						filter = sprintf("NOT (uid IN (%s)) AND ", filter);
					}
					var fql = sprintf("SELECT uid, name, pic_square FROM user WHERE %s(uid = me() OR uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) OR uid in (SELECT uid FROM group_member WHERE gid IN (SELECT gid FROM group_member WHERE uid = me()))) AND strpos(lower(name), lower('%s')) >=0 ORDER BY strpos(lower(name), lower('%s')) LIMIT 10", filter, query, query);
					return fql;
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
				network: {
					ref: function(uid, name) {
						return firebaseRef('user_favorites/' + uid + '/networks/' + name);
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

				league: {
					set: function(uid, network, name) {
						var ref = firebaseRef('user_favorites/' + uid + '/networks/' + network + '/leagues/' + name);  
						ref.set(true);
					}
				}
			},

			network: {
				ref: function(name) {
					return firebaseRef('networks/' + name);
				},

				sync: function(name) {
					return syncData('networks/' + name);
				},

				set: function(networkObj) {
					var ref = this.ref(networkObj.name);
					ref.set(networkObj);
				},

				all: {
					sync: function() {
						return syncData('networks');
					}
				},

				friends: {
					ref: function(name) {
						return firebaseRef('networks/' + name + '/friends');
					}
				},

				leaguesData: {
					ref: function(name) {
						return firebaseRef('league_matches/' + name);
					},

					remove: function(name) {
						var ref = this.ref(name);
						ref.remove();
					}
				}
			},

			league: {
				set: function(network, leagueObj) {
					var ref = this.ref(network, leagueObj.name);
					ref.set(leagueObj);
				},

				ref: function(network, league) {
					var ref = firebaseRef('network_leagues/' + network + '/' + league);	
					return ref;
				},

				table: {
					sync: function (network, league) {
						return syncData('league_matches/' + network + '/' + league);
					}
				},

				all: {
					ref: function(network) {
						return firebaseRef('network_leagues/' + network);
					},

					sync: function(network) {
						return syncData('network_leagues/' + network);
					},

					remove: function(network) {
						var ref = this.ref(network);
						ref.remove();
					}
				}
			},

			user: {
				set: function(uid, user) {
					var ref = firebaseRef('users/' + uid);
					ref.set(user);
				}
			}
		},

		build: function(name, teams) {
			var indexer = function (round, teams, away) {
				var totalRounds = teams - 1;
				return (totalRounds - away - round) % totalRounds + 1;
			};
			var next = function(index, teams, match, skip) {
				return (index + match - 1 + skip) % teams;
			}
			var previous = function(index, teams, match, skip) {
				return (index - match + teams - skip) % teams;
			}

			var league = {
				name: name,
				teams: teams
			};

			var cnt = teams.length;

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
						round = i * (cnt - 1) + r + 1;

					// walking through the matches
					for (var m = 0; m < Math.floor(cnt/2); m++) {
						var h; // home
						if (m == 0) {
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
						if (a == 0) {
							sa = 1;
							a = previous(ai, cnt, m, sa);
						}

						//console.log('r' + (r+1) + 'm' + (m+1) + 'hi'+ hi + 'ai'+ ai+ 'h' + h + 'a' + a);
						matches.push({
							round: round,
							match: i * (cnt - 1) + m + 1,
							home: teams[i == 0 ? h : a],
							away: teams[i == 0 ? a : h]
						});
					}

					rounds.push({
						number: round,
						matches: matches
					});
				}
			}

			league.matchInRound = Math.floor(cnt/2);
			league.rounds = rounds;

			return league;
		},

		table: function (league) {
			var tblHash = {};

			for (var t = 0; t < league.teams.length; t++) {
				var team = league.teams[t];

				tblHash[team.name] = _.extend({
					team: team,
					p: 0,
					w: 0,
					d: 0,
					l: 0,
					f: 0,
					a: 0
				}, mixinTableRow);
			};

			for (var r = 0; r < league.rounds.length; r++) {
				var round = league.rounds[r];
				for (var m = 0; m < round.matches.length; m++) {
					var match = round.matches[m];

					if (match.result) {
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
				}
			}

			var table = [];
			
			$.each(tblHash, function(key, value) {
				table.push(value);
			});

			return table;
		}
	};
});
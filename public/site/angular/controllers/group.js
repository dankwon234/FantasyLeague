var app = angular.module('GroupModule', []);

app.controller('GroupController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':'', 'isPublic':'no'};
	$scope.loading = false;
	$scope.group = null;
	$scope.currentSection = 'matchups';
	$scope.invitee = {'name':'', 'email':'', 'phone':''};
	$scope.players = {};
	$scope.contestDescription = 'No Prize';
	$scope.currentWeek = null;
	$scope.contest = {
		'creator':'',
		'group':'',
		'season':'',
		'week':'',
		'title':'',
		'state':'open',
		'entries':[],
		'participants':[],
		'eligibleTeams':[],
		'payouts':[],
		'minEntries':5,
		'buyIn':0
	};

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;

			RestService.query({resource:'weeklysummary', id:null, limit:'1'}, function(response) {
				if (response.confirmation != 'success'){
					alert(response.message);
					return;
				}

				$scope.currentWeek = response['weekly summaries'][0];
				var games = $scope.currentWeek.games;
				var gameIds = Object.keys(games);

				var now = new Date();
				for (var i=0; i<gameIds.length; i++){
					var game = games[gameIds[i]];
					var gameTime = new Date(game.Date);
					if (gameTime < now)
						continue
					
					$scope.contest.eligibleTeams.push(game.HomeTeam.toLowerCase());
					$scope.contest.eligibleTeams.push(game.AwayTeam.toLowerCase());
				}

//				console.log('ELIGIBLE - '+JSON.stringify($scope.contest.eligibleTeams));

				// fetch group:
				var requestInfo = $scope.generalService.parseLocation('site');
				if (requestInfo.identifier == null){
					alert('Error');
					return;
				}

				fetchGroup(requestInfo.identifier);
			});

		});
	}

	function fetchGroup(groupId){
		RestService.query({resource:'group', id:groupId}, function(response) {
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}

			$scope.group = response.group;
			fetchContests();
		});
	}


	function fetchContests(){
		RestService.query({resource:'contest', id:null, group:$scope.group.id}, function(response) {
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}

			$scope.group['contests'] = response.contests;
			fetchRosterPlayers();
		});
	}


	function fetchRosterPlayers(){
		var roster = $scope.group.rosters[$scope.profile.id]['roster'];
		for (var i=0; i<roster.length; i++){
			var key = roster[i];

			RestService.query({resource:'nflplayer', id:null, fantasyPlayerKey:key}, function(response) {
				if (response.confirmation != 'success'){
					alert(response.message);
					return;
				}

				var player = response.players[0];
				$scope.players[player.fantasyPlayerKey] = player;
			});
		}
	}

	$scope.invite = function(){
		if ($scope.invitee.name.length == 0){
			alert('Please enter a name.');
			return;
		}

		if ($scope.invitee.email.length == 0){
			alert('Please enter an email or phone number.');
			return;
		}

		var email = $scope.invitee.email;
		if ($scope.generalService.validateEmail(email) == false){
			$scope.invitee['phone'] = email; // this is actually a phone number
			$scope.invitee['email'] = '';
		}

		var parts = $scope.invitee.name.split(' ');
		$scope.invitee['firstName'] = parts[0];
		if (parts.length > 1)
			$scope.invitee['lastName'] = parts[parts.length-1];


		console.log('INVTE: '+JSON.stringify($scope.invitee));
		var params = {'group':$scope.group.id, 'invited':[$scope.invitee]};

		RestService.put({resource:'invite', id:$scope.group.id}, params, function(response) {
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}

			$scope.group['invited'] = response.group.invited;
			$scope.invitee = {'name':'', 'email':'', 'phone':''};
			alert('Invitation Sent!');
			document.getElementById('inviteButton').click();
		});
	}

	$scope.createContest = function(){
		$scope.contest['participants'] = [$scope.profile.id];
		$scope.contest['group'] = $scope.group.id;
		$scope.contest['creator'] = $scope.profile.id;
		$scope.contest['week'] = $scope.currentWeek.week;
		$scope.contest['season'] = $scope.currentWeek.season;


		var entry = {};
		entry['profile'] = $scope.profile.id;
		entry['score'] = '0';
		var players = $scope.group.rosters[$scope.profile.id]['roster'];
		var lineup = [];
		for (var i=0; i<players.length; i++){
			var playerId = players[i];
			var player = $scope.players[playerId];
			if ($scope.contest.eligibleTeams.indexOf(player.team.toLowerCase()) == -1)
				continue;

			console.log('PLAYER: '+JSON.stringify(player));
			lineup.push(playerId);
		}

		entry['lineup'] = lineup;

		$scope.contest.entries.push(entry);
		console.log('CREATE CONTEST: '+JSON.stringify($scope.contest));
	}
	
	$scope.updateContestDescription = function(){
		if ($scope.contest.buyIn == 0){
			$scope.contestDescription = 'No Prize';
			return;
		}

		var total = $scope.contest.buyIn * $scope.contest.minEntries;
		if ($scope.contest.minEntries < 5){
			$scope.contest['payouts'] = [total];
			$scope.contestDescription = 'First Place: $'+total+'.';
			return;
		}

		var secondPlace = 2*$scope.contest.buyIn;
		var firstPlace = total - secondPlace;

		$scope.contestDescription = 'First Place: $'+firstPlace+'. Second Place: $'+secondPlace;
		$scope.contest['payouts'] = [firstPlace, secondPlace];
		console.log('updateContestDescription: '+JSON.stringify($scope.contest));
	}

	
	$scope.login = function() {
		$scope.loading = true;
		accountService.login($scope.credentials, function(response, error){
			if (error != null){
				$scope.loading = false;
                alert(error.message);
				return;
			}
			
			window.location.href = '/site/account';
		});
	}
	
	
	
	
	

}]);

var nflPlayersCtr = angular.module('NFLPlayersModule', []);

nflPlayersCtr.controller('NFLPlayersController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':''};
	$scope.loading = false;

	$scope.pages = [];
	$scope.players = [];
	$scope.playerMap = {};
	$scope.visiblePlayers = [];
	$scope.currentSection = 'all';
	$scope.group = null;
	$scope.salaryCap = 50000;

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;
			
			RestService.query({resource:'nflplayer', id:null}, function(response) {
				if (response.confirmation != 'success')
					return;
				
				for (var i=0; i<response.players.length; i++){
					var player = response.players[i];
					if (player.value == 0)
						continue;

					player['index'] = i;
					$scope.players.push(player);
					$scope.playerMap[player.fantasyPlayerKey] = player;
				}

				for (var i=0; i<$scope.players.length; i++){
					if (i < 20)
						$scope.visiblePlayers.push($scope.players[i]);

					if (i % 20 == 0){
						$scope.pages.push(i/20 + 1);
					}
				}

				if ($scope.profile == null)
					return;

				var requestInfo = $scope.generalService.parseLocation('site');
				if (requestInfo.params == null)
					return;

				if (requestInfo.params.group == null)
					return;
				
				fetchGroup(requestInfo.params.group);
			});


		});
	}

	$scope.loadPlayers = function(page){
		var index = page * 20;
		var max = index+20;
		if (max >= $scope.players.length)
			max = $scope.players.length;

		$scope.visiblePlayers = [];
		for (var i=index; i<max; i++)
			$scope.visiblePlayers.push($scope.players[i]);
	}


	function fetchGroup(groupId){
		RestService.query({resource:'group', id:groupId}, function(response) {
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success')
				return;

			$scope.group = response.group;
			if ($scope.group.rosters[$scope.profile.id] == null)
				$scope.group.rosters[$scope.profile.id] = {'roster':[], 'profile':{'id':$scope.profile.id, 'firstName':$scope.profile.firstName, 'lastName':$scope.profile.lastName, 'username':$scope.profile.username}};
			else
				adjustSalaryCap();
		});
	}

	function adjustSalaryCap(){
		var roster = $scope.group.rosters[$scope.profile.id].roster;
		for (var i=0; i<roster.length; i++) {
			var player = $scope.playerMap[roster[i]];
			$scope.salaryCap -= player.value;
		}
	}

	
	$scope.addPlayer = function(player) {
		var index = $scope.group.rosters[$scope.profile.id].roster.indexOf(player.fantasyPlayerKey);
		if (index != -1)
			return;

		if (player.value > $scope.salaryCap){
			alert('No Cap Space. Please drop a player first.');
			return;
		}

		$scope.salaryCap -= player.value;
		$scope.group.rosters[$scope.profile.id].roster.push(player.fantasyPlayerKey);
		var roster = $scope.group.rosters[$scope.profile.id];
		updateRoster();
	}
	

	$scope.dropPlayer = function(player){
		console.log('DROP PLAYER: '+JSON.stringify(player));
		var index = $scope.group.rosters[$scope.profile.id].roster.indexOf(player.fantasyPlayerKey);
		if (index == -1)
			return;

		$scope.salaryCap += player.value;
		$scope.group.rosters[$scope.profile.id].roster.splice(index, 1);
		updateRoster();
	}

	function updateRoster(){
		var roster = $scope.group.rosters[$scope.profile.id];
		RestService.put({resource:'updateroster', id:$scope.group.id}, {'roster':roster}, function(response) {
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success')
				return;

		});
	}

	$scope.login = function(){
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

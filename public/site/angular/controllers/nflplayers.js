var app = angular.module('NFLPlayersModule', []);

app.controller('NFLPlayersController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':''};
	$scope.loading = false;
	$scope.players = null;
	$scope.currentSection = 'all';
	$scope.group = null;

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;
			
			RestService.query({resource:'nflplayer', id:null}, function(response) {
				if (response.confirmation != 'success')
					return;
				
				$scope.players = response.players;
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

	function fetchGroup(groupId){
		RestService.query({resource:'group', id:groupId}, function(response) {
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success')
				return;

			$scope.group = response.group;
			if ($scope.group.rosters[$scope.profile.id] == null)
				$scope.group.rosters[$scope.profile.id] = {'roster':[], 'profile':{'id':$scope.profile.id, 'firstName':$scope.profile.firstName, 'lastName':$scope.profile.lastName, 'username':$scope.profile.username}};





		});
	}
	
	$scope.addPlayer = function(player){
		console.log('ADD PLAYER: '+JSON.stringify(player));
		$scope.group.rosters[$scope.profile.id].roster.push(player.id);


	}
	

	$scope.dropPlayer = function(player){
		console.log('DROP PLAYER: '+JSON.stringify(player));
		var index = $scope.group.rosters[$scope.profile.id].roster.indexOf(player.id);
		if (index == -1)
			return;

		$scope.group.rosters[$scope.profile.id].roster.splice(index, 1);

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

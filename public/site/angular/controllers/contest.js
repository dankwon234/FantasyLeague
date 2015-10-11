var app = angular.module('ContestModule', []);

app.controller('ContestController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':'', 'isPublic':'no'};
	$scope.loading = false;
	$scope.group = null;
	$scope.contest = null;
	$scope.profiles = {};
	$scope.currentWeek = null;


	
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
				var upcomingGames = [];

				var now = new Date();
				for (var i=0; i<gameIds.length; i++){
					var game = games[gameIds[i]];
					var gameTime = new Date(game.Date);

					// Temporarily removed. restore after testing.
					// if (gameTime < now) // this game already started, not eligible
					// 	continue
					
					upcomingGames.push(game);
				}

				upcomingGames.sort(function(a, b){ // Turn your strings into dates, and then subtract them to get a value that is either negative, positive, or zero.
					return new Date(b.Date) - new Date(a.Date);
				});

				$scope.currentWeek['upcomingGames'] = upcomingGames;

				// fetch group:
				var requestInfo = $scope.generalService.parseLocation('site');
				if (requestInfo.identifier == null){
					alert('Error');
					return;
				}

				fetchContest(requestInfo.identifier);
			});

		});
	}

	function fetchContest(contestId){
		RestService.query({resource:'contest', id:contestId}, function(response) {
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}

			$scope.contest = response.contest;
			$scope.currentSection = 'summary';
			fetchProfiles();
		});
	}

	function fetchProfiles(){
		var keys = Object.keys($scope.profiles);
		if (keys.length == $scope.contest.participants.length)
			return;
		
		RestService.query({resource:'profile', id:$scope.contest.participants[keys.length]}, function(response) {
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}

			$scope.profiles[response.profile.id] = response.profile;
			fetchProfiles();
			console.log(JSON.stringify($scope.profiles));
		});
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

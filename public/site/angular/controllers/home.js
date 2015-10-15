var app = angular.module('HomeModule', []);

app.controller('HomeController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':''};
	$scope.loading = false;
	$scope.weeklyGames = {};

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;
				getWeeklyGames();
		});
	}
	
	$scope.viewAccount = function(){
		if ($scope.profile.id == null)
			return;
		
		window.location.href = '/site/account';
	}
	
	$scope.register = function(){
		$scope.loading = true;

		var parts = $scope.credentials.name.split(' ');
		$scope.credentials['firstName'] = parts[0];
		if (parts.length > 1)
			$scope.credentials['lastName'] = parts[parts.length-1];

		accountService.register($scope.credentials, function(response, error){
			if (error != null){
				$scope.loading = false;
                alert(error.message);
				return;
			}
			
			window.location.href = '/site/account';
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
	
	$scope.getWeeklyGames = function () {
		console.log('get weekly games called')
      restService.query({resource:'weeklysummary'}, function(response){
      console.log(JSON.stringify(response));
      if (response.confirmation != 'success') {
          alert('Error: ' + response.message);
          return;
      }
      
  });


	}
	
	
	
	

}]);

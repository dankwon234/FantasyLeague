var app = angular.module('HomeModule', []);

app.controller('HomeController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':''};
	$scope.loading = false;

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;
			
		});
	}
	
	$scope.viewAccount = function(){
		if ($scope.profile.id == null)
			return;
		
		window.location.href = '/site/account';
	}
	
	$scope.register = function(){
		$scope.loading = true;
		accountService.register($scope.profile, function(response, error){
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
	
	
	
	
	

}]);

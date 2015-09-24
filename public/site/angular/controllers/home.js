var app = angular.module('HomeModule', []);

app.controller('HomeController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':''};
	$scope.workshops = ['Mean Stack Demo', 'iOS Demo', 'Node JS Crashcourse', 'iOS Crashcourse', '8-Week Node JS Course', '8-Week iOS Course'];
	$scope.selectedWorkshop = 'video series';
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
			
			window.location.href = '/site/forum';
		});
	}
	
	$scope.selectWorkshop = function(index){
		$scope.selectedWorkshop = $scope.workshops[index];
	}
	
	$scope.sendInfoRequest = function(){
		if ($scope.credentials.email.length == 0){
			alert('Please Enter Your Email');
			return;
		}

		if ($scope.credentials.email.name == 0){
			alert('Please Enter Your Name');
			return;
		}
		
		
		var body = {'email':$scope.credentials.email, 'password':$scope.credentials.password, 'name':$scope.credentials.name};
		if ($scope.selectedWorkshop != null)
			body['workshop'] = $scope.selectedWorkshop;
		
		
		RestService.post({resource:'info', id:null}, body, function(response) {
			if (response.confirmation != 'success')
				return;
			
			alert(response.message);
			window.location.href = '/site/events';
		});
	}
	
	
	
	

}]);

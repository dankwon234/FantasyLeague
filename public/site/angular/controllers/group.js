var app = angular.module('GroupModule', []);

app.controller('GroupController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':'', 'isPublic':'no'};
	$scope.loading = false;
	$scope.group = null;

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;

			// fetch group:
			var requestInfo = $scope.generalService.parseLocation('site');
			if (requestInfo.identifier == null){
				alert('Error');
				return;
			}

			RestService.query({resource:'group', id:requestInfo.identifier}, function(response) {
				console.log(JSON.stringify(response));
				if (response.confirmation != 'success'){
					alert(response.message);
					return;
				}

				$scope.group = response.group;
			});

			
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

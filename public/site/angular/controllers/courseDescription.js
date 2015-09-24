var app = angular.module('CourseDescriptionModule', []);

app.controller('CourseDescriptionController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':''};
	$scope.proposal = {'email':'', 'description':'', 'name':''};
	$scope.loading = false;

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;
			
		});
	}
	
	$scope.submitIdea = function(){
		if ($scope.proposal.email.length == 0){
			alert('Please enter your email.');
			return;
		}
		
		if ($scope.proposal.description.length == 0){
			alert('Please enter a description for your proposal.');
			return;
		}
			
		console.log('Submit Idea: '+JSON.stringify($scope.proposal));
		RestService.post({resource:'proposal', id:null}, $scope.proposal, function(response) {
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}

			$scope.proposal = {'email':'', 'description':''};
			alert('Thanks for submitting your proposal. We will reach out to you soon!');
		});
	}
	
	
	$scope.sendInfoRequest = function(){
		if ($scope.credentials.email.length == 0){
			alert('Please Enter Your Email');
			return;
		}

		if ($scope.credentials.name.length == 0){
			alert('Please Enter Your Name');
			return;
		}
		
		
		var body = {'email':$scope.credentials.email, 'password':$scope.credentials.password, 'name':$scope.credentials.name, 'workshop':'8-Week Node JS Course'};
		RestService.post({resource:'info', id:null}, body, function(response) {
			if (response.confirmation != 'success')
				return;
			
			alert(response.message);
		});
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
	
	
	
	

}]);

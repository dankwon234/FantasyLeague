var app = angular.module('EventsModule', []);

app.controller('EventsController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':''};
	$scope.workshops = ['Mean Stack Demo', 'iOS Demo'];
	$scope.selectedWorkshop = null;
	$scope.recentPosts = null;
	$scope.loading = false;

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;
			
			fetchRecentPosts();
		});
	}
	
	function fetchRecentPosts(){
		RestService.query({resource:'post', id:null, limit:'3'}, function(response){
			if (response.confirmation != 'success')
				return;
			
			$scope.recentPosts = response.posts;
			for (var i=0; i<$scope.recentPosts.length; i++){
				var post = $scope.recentPosts[i];
				if (post.link.length == 0)
					continue;
				
				var source = post.link;
				var parts = source.split('//');
				if (parts.length < 2)
					continue; 
				
				var p = parts[1].split('/');
				post['source'] = parts[0]+'//'+p[0];
			}
		});
	}
	
	$scope.openPost = function(post){
		if (post == null)
			return;
		
		if (post.link.length == 0){
			window.location.href = '/site/post/'+post.id;
			return;
		}
		
		var url = post.link;
		if (url.indexOf('http') == -1)
			url = 'http://'+url;
		
		window.open(url, '_blank');
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
			window.location.href = '/site/forum';
		});
	}
	
	
	
	

}]);

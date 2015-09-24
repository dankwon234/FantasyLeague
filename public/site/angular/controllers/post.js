var app = angular.module('PostModule', ['ngSanitize']);

app.controller('PostController', ['$scope', 'generalService', 'accountService', 'uploadService', 'RestService', function($scope, generalService, accountService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':''};
	$scope.comment = {'text':'', 'subject':''};
	$scope.post = null;
	$scope.loading = false;

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;
			
			var requestInfo = $scope.generalService.parseLocation('site');
			if (requestInfo.identifier == null)
				return;
			
			RestService.query({resource:'post', id:requestInfo.identifier}, function(response){
				console.log('POST == '+JSON.stringify(response));
				if (response.confirmation != 'success')
					return;
				
				$scope.post = response.post;
				$scope.post.text = $scope.post.text.replace(/(?:\r\n|\r|\n)/g, '<br />');
				$scope.post.text = $scope.generalService.convertToLinks($scope.post.text);
				fetchComments();
			});
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
	
	
	function fetchComments(){
		if ($scope.post == null)
			return;
		
		RestService.query({resource:'comment', id:null, thread:$scope.post.id}, function(response){
			console.log('COMMENTS == '+JSON.stringify(response));
			if (response.confirmation == 'success') 
				$scope.post['comments'] = response.comments;
			
			for (var i=0; i<$scope.post.comments.length; i++){
				var comment = $scope.post.comments[i];
				comment.text = comment.text.replace(/(?:\r\n|\r|\n)/g, '<br />');
				comment.text = $scope.generalService.convertToLinks(comment.text);
			}
			
			
			fetchRecentPosts();
		});
	}

	
	function fetchRecentPosts(){
		RestService.query({resource:'post', id:null, limit:5}, function(response){
			if (response.confirmation == 'success') 
				$scope.recentPosts = response.posts;
			
		});
	}
	
	
	$scope.submitComment = function(){
		if ($scope.profile == null){
			alert('Please log in to submit a post.');
			return;
		}
		
		if ($scope.comment.text.length == 0){
			alert('Please enter a comment first.');
			return;
		}
		
		var username = $scope.profile.username;
		if (username.length == 0)
			username = $scope.profile.firstName.substring(0, 1)+$scope.profile.lastName;
		
		$scope.comment['profile'] = {'id':$scope.profile.id, 'username':username};
		$scope.comment['subject'] = $scope.post.id;
		$scope.comment['thread'] = $scope.post.id;
		
		RestService.post({resource:'comment', id:null}, $scope.comment, function(response){
			console.log('FORUM CONTROLLER == '+JSON.stringify(response));
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}
			
			if ($scope.post.comments == null)
				$scope.post.comments = [];
			
			var comment = response['comment'];
			comment.text = comment.text.replace(/(?:\r\n|\r|\n)/g, '<br />');
			comment.text = $scope.generalService.convertToLinks(comment.text);
			
			
			$scope.post.comments.push(comment);
			$scope.comment = {'text':'', 'subject':''};
		});
	}
	
	
	$scope.viewAccount = function(){
		if ($scope.profile.id == null)
			return;
		
		window.location.href = '/site/forum';
	}
	
	$scope.register = function(){
		$scope.loading = true;
		accountService.register($scope.profile, function(response, error){
			if (error != null){
				$scope.loading = false;
                alert(error.message);
				return;
			}
			
			window.location.href = '/site/forum';
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

var app = angular.module('eurovision', []);

app.controller('AppCtrl', [
  '$scope',
  'youtubeService',
  'lastfmService',
  function ($scope, youtubeService, lastfmService) {
  'use strict';
  $scope.loadingVideos = true;
  $scope.loadingVideosError = false;

  // When last.fm songs have loaded
  lastfmService.getSongs().then(function(responses){
    var songs = lastfmService.parseResponses(responses);
    $scope.chartByPlaycount = lastfmService.getChartByPlaycount(songs);

    $scope.loadingVideos = false;
  });

  // when youtube videos have loaded
  youtubeService.getVideos().then(function(responses){
    var videos = youtubeService.parseResponses(responses);
    youtubeService.setTotals(videos);

    $scope.loadingVideos = false;

    $scope.top10 = youtubeService.getTop10(videos);

    $scope.chartByScore = youtubeService.getChartByScore(videos);
    $scope.chartByViews = youtubeService.getChartByViews(videos);
    $scope.chartByLikes = youtubeService.getChartByLikes(videos);
    $scope.chartByComments = youtubeService.getChartByComments(videos);

  },function(){
    $scope.loadingVideos = false;
    $scope.loadingVideosError = true;
  });

}]);

app.factory('youtubeService', [
  '$q',
  '$http',
  'countriesService',
  'helpersService',
  function($q, $http, countriesService, helpersService){
  'use strict';

  var totals = {
    views: 0,
    likes: 0,
    dislikes: 0,
    comments: 0
  };

  var setTotals = function(videos){
    videos.map(function(video){
      totals.views += video.views;
      totals.likes += video.likes;
      totals.dislikes += video.dislikes;
      totals.comments += video.comments;
    });
  };

  var getFormattedVideos = function(videos) {
    var formattedVideos = {
      countries: [],
      titles: [],
      views: [],
      comments: [],
      likes: [],
      dislikes: [],
      likeRatios: []
    };

    // change data structure
    angular.forEach(videos, function(video){
      formattedVideos.countries.push(video.country);
      formattedVideos.titles.push(video.title);
      formattedVideos.views.push(video.views);
      formattedVideos.comments.push(video.comments);
      formattedVideos.likes.push(video.likes);
      formattedVideos.dislikes.push(video.dislikes);
      formattedVideos.likeRatios.push(video.likeRatio);
    });

    return formattedVideos;
  };


  var getChartByViews = function(videos) {
    // Sort by views
    helpersService.sortBy('views', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        'text': 'Views (live updating)'
      },
      subtitle: {
          text: 'Ordered by views'
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Views'
        }
      },
      xAxis: {
        categories: videos.countries
      },
      tooltip: {},
      series: [{
        color: '#8085e9',
        name: 'Views',
        data: videos.views
      }]
    };

    return chart;
  };

  var getScore = function(videos) {
    videos.map(function(video){
      var nettoLikes = video.likes - (video.dislikes * 0.5);
      var nettoLikesPrView = nettoLikes / video.views;
      var likesPrView = video.likes / video.views;

      // Share
      var viewsShare = video.views / totals.views;
      var likesShare = video.likes / totals.likes;
      var dislikesShare = video.dislikes / totals.dislikes;
      var commentsShare = video.comments / totals.comments;

      video.score = likesShare * viewsShare;
      return video;
    });

    return videos;
  };

  var getTop10 = function(videos){
    videos = getScore(videos);

    // sort by score
    helpersService.sortBy('score', videos);

    // Limit to top 10
    videos = videos.slice(0,10);

    return videos;
  };

  var getChartByScore = function(videos) {
    videos = getScore(videos);

    // sort by score
    helpersService.sortBy('score', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        text: 'Fancy Eurovision Score (live updating)'
      },
      subtitle: {
          text: 'Ordered by "Eurovision Score"'
      },
      yAxis: [{
        min: 0,
        title: {
          text: 'Number of Likes'
        }
      },{
        opposite: true,
        min: 0,
        title: {
          text: 'Number of views'
        }
      }],
      xAxis: {
        categories: videos.countries
      },
      tooltip: {},
      series: [{
        color: '#7cb5ec',
        name: 'Likes',
        data: videos.likes,
        yAxis: 0
      },
      {
        color: '#8085e9',
        name: 'Views',
        data: videos.views,
        yAxis: 1
      }]
    };

    return chart;
  };


  var getChartByLikes = function(videos) {
    // sort by likes
    helpersService.sortBy('likes', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        text: 'Likes and dislikes (live updating)'
      },
      subtitle: {
          text: 'Ordered by likes'
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        }
      },
      xAxis: {
        categories: videos.countries
      },
      tooltip: {},
      series: [{
        color: '#7cb5ec',
        name: 'Likes',
        data: videos.likes
      },
      {
        color: '#434348',
        name: 'Dislikes',
        data: videos.dislikes
      }]
    };

    return chart;
  };

  var getChartByComments = function(videos) {
    // sort by comments
    helpersService.sortBy('comments', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        text: 'Comments (live updating)'
      },
      subtitle: {
          text: 'Ordered by comments'
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        }
      },
      xAxis: {
        categories: videos.countries
      },
      tooltip: {},
      series: [{
        color: '#f7a35c',
        name: 'Comments',
        data: videos.comments,
        visible: true
      }]
    };

    return chart;
  };

  var getVideos = function() {
    var videoPromises = [];

    // load videos
    angular.forEach(countriesService.countries, function(country){
      var videoPromise = $http({
        method: 'JSONP',
        url: 'https://gdata.youtube.com/feeds/api/videos/' + country.video + '?&v=2&alt=json-in-script&callback=JSON_CALLBACK&fields=yt:rating,yt:statistics,gd:comments(gd:feedLink(@countHint)),title'
      });

      videoPromises.push(videoPromise);
    });

    return $q.all(videoPromises);
  };

  var parseResponses = function(responses) {
    var videos = [];

    angular.forEach(responses, function(response, i){
      var country = countriesService.countries[i].name;
      var title = response.data.entry.title.$t;
      var views = parseInt(response.data.entry.yt$statistics.viewCount, 10);
      var comments = response.data.entry.gd$comments ? parseInt(response.data.entry.gd$comments.gd$feedLink.countHint, 10) : 0;
      var likes = parseInt(response.data.entry.yt$rating.numLikes, 10);
      var dislikes = parseInt(response.data.entry.yt$rating.numDislikes, 10);
      var likeRatio = likes/(dislikes + likes) * 100;

      videos.push({
        country: country,
        title: title,
        views: views,
        comments: comments,
        likes: likes,
        dislikes: dislikes,
        likeRatio: likeRatio
      });
    });

    return videos;
  };



  return {
    getTop10: getTop10,
    setTotals: setTotals,
    getVideos: getVideos,
    parseResponses: parseResponses,
    getChartByViews: getChartByViews,
    getChartByComments: getChartByComments,
    getChartByLikes: getChartByLikes,
    getChartByScore: getChartByScore
  };
}]);

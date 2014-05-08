'use strict';

app.directive('chart', function() {
  return {
    restrict: 'E',
    template: '<div></div>',
    scope: {
      chartData: '=value',
      chartObj: '=?'
    },
    transclude: true,
    replace: true,
    link: function($scope, $element, $attrs) {
      var chartsDefaults = {
        chart: {
          renderTo: $element[0],
          type: $attrs.type || null,
          height: $attrs.height || null,
          width: $attrs.width || null
        }
      };

      //Update when charts data changes
      $scope.$watch('chartData', function(value) {
        if (!value) return;

        var newSettings = {};
        angular.extend(newSettings, chartsDefaults, $scope.chartData);
        new Highcharts.Chart(newSettings);
      });
    }
  };

});

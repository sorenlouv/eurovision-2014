app.directive('displayBreakPoints', [
  '$window',
  '$rootScope',
  function($window, $rootScope) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        scope.breakpoint = {
          'class': '',
          windowSize: $window.innerWidth
        }; // Initialise Values

        var breakpoints = (scope.$eval(attr.displayBreakPoints));
        var firstTime = true;

        angular.element($window).bind('resize', setWindowSize);

        scope.$watch('breakpoint.windowSize', function(windowWidth, oldValue) {
          setClass(windowWidth);
        });

        scope.$watch('breakpoint.class', function(newClass, oldClass) {
          if (newClass != oldClass || firstTime) {
            firstTime = false;
          }
        });

        function setWindowSize() {
          scope.breakpoint.windowSize = $window.innerWidth;
          if (!scope.$$phase) scope.$apply();
        }

        function setClass(windowWidth) {
          var breakpointClass = breakpoints[Object.keys(breakpoints)[0]];
          for (var breakpoint in breakpoints) {
            if (breakpoints.hasOwnProperty(breakpoint)) {
              if (breakpoint < windowWidth) breakpointClass = breakpoints[breakpoint];
              element.removeClass(breakpoints[breakpoint]);
            }
          }
          element.addClass(breakpointClass);
          scope.breakpoint['class'] = breakpointClass;

          if (!scope.$$phase) scope.$apply();
        }
      }
    };
  }
]);

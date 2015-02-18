'use strict';

rpgApp.directive("popoverHtmlUnsafePopup", function () {
  return {
    restrict: "EA",
    replace: true,
    scope: { title: "@", content: "@", placement: "@", animation: "&", isOpen: "&" },
    templateUrl: "popover-html-unsafe-popup.html"
  };
})

rpgApp.directive("popoverHtmlUnsafe", [ "$tooltip", function ($tooltip) {
  return $tooltip("popoverHtmlUnsafe", "popover", "click");
}]);


(function () {
    'use strict';

    var module = angular.module("lvl.directives.dragdrop", ['lvl.services']);

    /**
     * @ngdoc directive
     * @name lvlDraggable
     *
     * @description
     * Directive to enable drag on elements
     *
     * <example module="lvl.directives.dragdrop">
     *     <file name="index.html">
     *
     *         <div ng-controller="exampleController">
     *           <div lvl-draggable="true" dragid="someDragId" drag-data="dragObj">
     *             {{dragObj.name}}
     *           </div>
     *         </div>
     *
     *     </file>
     *     <file name="exampleController.js">
     *
     *         angular.module('lvl.directives.dragdrop').controller('exampleController', function(scope){
     *              scope.dragObj = { name: 'John Doe', id: 999 };
     *         });
     *
     *     </file>
     * </example>
     *
     * @param  {string} dragid A unique string to identificate the draggable element
     * @param {object} dragData placeholder for a data object which can be 'transported' with the dragging element.
     *
     * @restrict A
     * */
    module.directive('lvlDraggable', ['$rootScope', 'uuid', function ($rootScope, uuid) {
        return {
            restrict: 'A',
            scope: {
                dragid: '=',
                dragData: '='
            },
            link: function (scope, el, attrs) {
                var isDraggable = scope.$parent.$eval(attrs.lvlDraggable),
                    id,
                    dragData;

                if (isDraggable !== false) {
                    angular.element(el).attr('draggable', 'true');

                    if (scope.dragid) {
                        id = scope.dragid;
                    } else {
                        id = angular.element(el).attr('id') || uuid.new();
                    }
                    dragData = angular.isDefined(scope.dragData) ? JSON.stringify(scope.dragData) : undefined;

                    el.bind('dragstart', function (e) {
                        e.dataTransfer.setData('text', id);
                        e.dataTransfer.setData('dragData', dragData);
                        $rootScope.$emit('LVL-DRAG-START');
                    });

                    el.bind('dragend', function (e) {
                        $rootScope.$emit('LVL-DRAG-END');
                    });
                }
            }
        }
    }]);

    /**
     * @ngdoc directive
     * @name lvlDropTarget
     *
     * @description
     * Directive for accepting drop action of draggable elements
     *
     * <example module="lvl.directives.dragdrop">
     *     <file name="index.html">
     *         <div ng-controller="exampleController">
     *             <div lvl-drop-target="true" dropid="myTargetZone" on-drop="droppedItem(dragEl, dropEl, dragData);"></div>
     *         </div>
     *     </file>
     *     <file name="exampleController.js">
     *
     *         angular.module('lvl.directives.dragdrop').controller('exampleController', function(scope){
     *
     *              scope.droppedItem = function(dragId, dropId, dragData){
     *                  console.log(dragId, dropId, dragData);
     *              };
     *
     *         });
     *
     *     </file>
     * </example>
     *
     * @param {function} onDrop Function that emitted when draggable element dropped on the element.
     * @param {string} dropid A unique string to identificate the element where the draggable element dropped to.
     *
     * @restrict A
     * */
    module.directive('lvlDropTarget', ['$rootScope', 'uuid', function ($rootScope, uuid) {
        return {
            restrict: 'A',
            scope: {
                onDrop: '&',
                dropid: '='
            },
            link: function (scope, el, attrs, controller) {
                var id;
                if (scope.dropid) {
                    id = scope.dropid;
                } else {
                    id = angular.element(el).attr('id');
                    if (!id) {
                        id = uuid.new();
                        angular.element(el).attr('id', id);
                    }
                }

                el.bind('dragover', function (e) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
                    return false;
                });

                el.bind('dragenter', function (e) {
                    // this / e.target is the current hover target.
                    angular.element(e.target).addClass('lvl-over');
                });

                el.bind('dragleave', function (e) {
                    el.removeClass('lvl-over');
                    el.removeClass('lvl-target');
                    angular.element(e.target).removeClass('lvl-over');  // this / e.target is previous target element.
                    angular.element(e.target).removeClass('lvl-target');
                });

                el.bind('drop', function (e) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                    e.stopPropagation(); // Necessary. Allows us to drop.
                    var data = e.dataTransfer.getData('text');
                    var dest = id;
                    var src = data;

                    var dragData = e.dataTransfer.getData('dragData');
                    dragData = (dragData !== 'undefined') ? JSON.parse(dragData) : undefined;
                    scope.onDrop({dragEl: src, dropEl: dest, dragData: dragData});

                    el.removeClass('lvl-over');
                    el.removeClass('lvl-target');
                    angular.element(e.target).removeClass('lvl-over');  // this / e.target is previous target element.
                    angular.element(e.target).removeClass('lvl-target');

                });

                $rootScope.$on('LVL-DRAG-START', function () {
                    var targetEl = document.getElementById(id);
                    angular.element(targetEl).addClass('lvl-target');
                });

                $rootScope.$on('LVL-DRAG-END', function () {
                    var targetElement = document.getElementById(id);
                    angular.element(targetElement).removeClass('lvl-target');
                    angular.element(targetElement).removeClass('lvl-over');
                });
            }
        }
    }]);
})();

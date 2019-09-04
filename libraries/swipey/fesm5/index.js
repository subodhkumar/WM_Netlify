/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// Get a regular interval for drawing to the screen
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimaitonFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
}());
(function ($) {
    /** @type {?} */
    var DIRECTIONS = {
        'NONE': 0,
        'HORIZONTAL': 1,
        'LEFT_TO_RIGHT': 2,
        'RIGHT_TO_LEFT': 3,
        'VERTICAL': 4,
        'TOP_TO_DOWN': 5,
        'DOWN_TO_TOP': 6
    };
    /** @type {?} */
    var abs = Math.abs;
    /** @type {?} */
    var max = Math.max;
    /** @type {?} */
    var SwipeTracer;
    /** @type {?} */
    var activeEventProcessor;
    /** @type {?} */
    var swipeMask = $('<div style="background-color:rgba(0, 0, 0, 0);position: fixed; top: 0;width:100vw; height: 100vh;z-index: 100000;"></div>');
    /** @type {?} */
    var touchMoveListeners = [];
    /** @type {?} */
    var touchEndListeners = [];
    /** @type {?} */
    var onTouch = function (e) {
        $.each(touchMoveListeners, function (i, fn) {
            return fn(e);
        });
    };
    /** @type {?} */
    var onTouchEnd = function (e) {
        $.each(touchEndListeners, function (i, fn) {
            return fn(e);
        });
        touchMoveListeners.length = 0;
        touchEndListeners.length = 0;
    };
    // Binds events outside of zone
    /**
     * @param {?} target
     * @param {?} event
     * @param {?} callback
     * @return {?}
     */
    function addEventListener(target, event, callback) {
        (target.__zone_symbol__addEventListener || target.addEventListener).call(target, event, callback);
    }
    addEventListener(document, 'mousemove', onTouch);
    addEventListener(document, 'touchmove', onTouch);
    addEventListener(document, 'mouseup', onTouchEnd);
    addEventListener(document, 'touchcancel', onTouchEnd);
    addEventListener(document, 'touchend', onTouchEnd);
    /**
     * @param {?} parent
     * @param {?} child
     * @param {?} direction
     * @return {?}
     */
    function ScrollObserver(parent, child, direction) {
        /** @type {?} */
        var elementsToObserve = (function (array) {
            /** @type {?} */
            var iter = child;
            while (iter) {
                array.push({
                    '$ele': $(iter),
                    'last': {
                        'scrollLeft': iter.iscroll ? iter.iscroll.x : iter.scrollLeft,
                        'scrollTop': iter.iscroll ? iter.iscroll.y : iter.scrollTop
                    }
                });
                iter = iter.parentElement;
            }
            return array;
        })([]);
        /**
         * @return {?}
         */
        function isVerticalScroll() {
            /** @type {?} */
            var result;
            $.each(elementsToObserve, function () {
                if (this.$ele[0].iscroll) {
                    if (!isNaN(this.$ele[0].iscroll.y) && this.$ele[0].iscroll.y !== 0) {
                        result = true;
                    }
                }
                else if (this.$ele[0].scrollTop !== 0) {
                    result = true;
                }
            });
            return result;
        }
        /**
         * @return {?}
         */
        function isHorizontalScroll() {
            /** @type {?} */
            var result;
            $.each(elementsToObserve, function () {
                if (this.$ele[0].iscroll) {
                    if (!isNaN(this.$ele[0].iscroll.x) && this.$ele[0].iscroll.x !== 0) {
                        result = true;
                    }
                }
                else if (this.$ele[0].scrollLeft !== 0) {
                    result = true;
                }
            });
            return result;
        }
        this.hasSrcolled = function () {
            if (direction === $.fn.swipey.DIRECTIONS.VERTICAL) {
                return isVerticalScroll();
            }
            if (direction === $.fn.swipey.DIRECTIONS.HORIZONTAL) {
                return isHorizontalScroll();
            }
        };
    }
    /**
     * @return {?}
     */
    function SwipeEventSmoother() {
        /** @type {?} */
        var queue = [];
        /** @type {?} */
        var isProcessing = false;
        /**
         * @return {?}
         */
        function process() {
            if (queue.length > 0) {
                try {
                    queue.shift()();
                }
                catch (e) {
                    console.error('Function invocation failed', e);
                }
                window.requestAnimationFrame(process);
            }
            else {
                isProcessing = false;
            }
        }
        this.push = function (fn) {
            queue.push(fn);
        };
        this.process = function () {
            if (!isProcessing) {
                isProcessing = true;
                // time = 0;
                process();
            }
        };
    }
    activeEventProcessor = new SwipeEventSmoother();
    /**
     * @param {?} event
     * @return {?}
     */
    function getTouchEvent(event) {
        return (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0]) ||
            (event && event.touches && event.touches[0]) ||
            event;
    }
    /**
     * @param {?} startPoint
     * @param {?} endPoint
     * @param {?} direction
     * @return {?}
     */
    function computeDistance(startPoint, endPoint, direction) {
        /** @type {?} */
        var distance = 0;
        /** @type {?} */
        var deltaX;
        /** @type {?} */
        var deltaY;
        if (direction === DIRECTIONS.HORIZONTAL) {
            distance = endPoint.x - startPoint.x;
        }
        else if (direction === DIRECTIONS.LEFT_TO_RIGHT) {
            distance = max(endPoint.x - startPoint.x, 0);
        }
        else if (direction === DIRECTIONS.RIGHT_TO_LEFT) {
            distance = max(startPoint.x - endPoint.x, 0);
        }
        else if (direction === DIRECTIONS.VERTICAL) {
            distance = endPoint.y - startPoint.y;
        }
        else if (direction === DIRECTIONS.TOP_TO_DOWN) {
            distance = max(endPoint.y - startPoint.y, 0);
        }
        else if (direction === DIRECTIONS.DOWN_TO_TOP) {
            distance = max(startPoint.y - endPoint.y, 0);
        }
        else {
            deltaX = endPoint.x - startPoint.x;
            deltaY = endPoint.y - startPoint.y;
            distance = max(abs(deltaX), abs(deltaY));
            if ((deltaX < 0 && abs(deltaX) === distance) || (deltaY < 0 && abs(deltaY) === distance)) {
                distance = -distance;
            }
        }
        return distance;
    }
    /**
     * @param {?} event
     * @param {?} settings
     * @return {?}
     */
    function onActiveSwipe(event, settings) {
        /** @type {?} */
        var touch = getTouchEvent(event);
        /** @type {?} */
        var startPoint = settings.data.path[0];
        /** @type {?} */
        var point = {
            'x': touch.pageX,
            'y': touch.pageY
        };
        /** @type {?} */
        var distance = computeDistance(startPoint, point, settings.direction);
        /** @type {?} */
        var eventSplits = [];
        /** @type {?} */
        var increment;
        /** @type {?} */
        var limit;
        settings.renderInProgress = false;
        if (distance !== settings.lastDistance) {
            increment = (distance < settings.lastDistance ? -1 : 1) * 30;
            limit = (distance - settings.lastDistance);
            for (var i = increment; (increment > 0 && i <= limit) || (increment < 0 && i >= limit); i += increment) {
                eventSplits.push(i + settings.lastDistance);
            }
            if (limit % increment !== 0) {
                eventSplits.push(limit % abs(increment) + (eventSplits.length === 0 ? settings.lastDistance : eventSplits[eventSplits.length - 1]));
            }
            // eventSplits = [distance];
            settings.lastDistance = distance;
            $.each(eventSplits, function () {
                /** @type {?} */
                var d = this;
                activeEventProcessor.push(function () {
                    settings.data.length = d;
                    settings.data.totalLength += abs(d);
                    settings.data.velocity = abs(settings.data.totalLength / (Date.now() - settings.data.startTime));
                    settings.data.path.push(point);
                    if (settings.onSwipe.call(settings.target, event, settings.data) === false) {
                        onActiveSwipeEnd(event, settings);
                    }
                    SwipeTracer.onSwipe(event, settings.data);
                });
            });
            activeEventProcessor.process();
        }
    }
    /**
     * @param {?} event
     * @param {?} settings
     * @return {?}
     */
    function onActiveSwipeEnd(event, settings) {
        /** @type {?} */
        var touch = getTouchEvent(event);
        if (touch) {
            settings.data.path.push({
                'x': touch.pageX,
                'y': touch.pageY
            });
        }
        activeEventProcessor.push(function () {
            SwipeTracer.onSwipeEnd(event, settings.data);
            settings.onSwipeEnd.call(settings.target, event, settings.data);
        });
        activeEventProcessor.process();
    }
    /**
     * @param {?} event
     * @param {?} settings
     * @return {?}
     */
    function listenActiveSwipe(event, settings) {
        /** @type {?} */
        var touch = getTouchEvent(event);
        /** @type {?} */
        var swipeHandler;
        /** @type {?} */
        var swipeEndHandler;
        /** @type {?} */
        var passiveDistance;
        /** @type {?} */
        var passiveSwipeStartPoint = settings.data.path[0];
        /** @type {?} */
        var activeSwipeStartPoint = {
            'x': touch.pageX,
            'y': touch.pageY
        };
        passiveDistance = computeDistance(passiveSwipeStartPoint, activeSwipeStartPoint, settings.direction);
        settings.data.length = passiveDistance < 0 ? -1 : 1;
        settings.lastDistance = settings.data.length;
        settings.data.path = [activeSwipeStartPoint];
        settings.data.totalLength = abs(settings.data.length);
        settings.data.startTime = Date.now();
        if (settings.onSwipeStart.call(settings.target, event, settings.data) === false) {
            return false;
        }
        swipeMask.appendTo($('body'));
        swipeHandler = function (em) {
            onActiveSwipe(em, settings);
        };
        swipeEndHandler = function (ee) {
            swipeMask.remove();
            onActiveSwipeEnd(ee, settings);
        };
        touchMoveListeners = [];
        touchMoveListeners.push(swipeHandler);
        touchEndListeners = [];
        touchEndListeners.push(swipeEndHandler);
        SwipeTracer.onSwipeStart(event, settings.data);
        return true;
    }
    // This function checks if touch positions are within +/- 20deg error in horizontal and 70deg in vertical direction.
    /**
     * @param {?} startPoint
     * @param {?} endPoint
     * @param {?} direction
     * @return {?}
     */
    function isThresholdAngleReached(startPoint, endPoint, direction) {
        // tan20, tan(-20deg)
        if (direction === DIRECTIONS.HORIZONTAL) {
            if (Math.abs((endPoint.y - startPoint.y) / (endPoint.x - startPoint.x)) <= 0.36397023426) {
                return true;
            }
        }
        else if (direction === DIRECTIONS.VERTICAL) { // between tan70 & tan110
            if (Math.abs((endPoint.y - startPoint.y) / (endPoint.x - startPoint.x)) >= 2.74747741945) {
                return true;
            }
        }
        return false;
    }
    /**
     * @param {?} touch
     * @param {?} settings
     * @return {?}
     */
    function isThresholdReached(touch, settings) {
        /** @type {?} */
        var startPoint = settings.data.path[0];
        /** @type {?} */
        var endPoint = {
            'x': touch.pageX,
            'y': touch.pageY
        };
        /** @type {?} */
        var distance = computeDistance(startPoint, endPoint, settings.direction);
        return abs(distance) > settings.threshold && isThresholdAngleReached(startPoint, endPoint, settings.direction);
    }
    /**
     * @param {?} touch
     * @param {?} settings
     * @return {?}
     */
    function listenPassiveSwipe(touch, settings) {
        /** @type {?} */
        var passiveSwipeHandler;
        settings.scrollObserver = new ScrollObserver(event.currentTarget, event.target, settings.direction);
        passiveSwipeHandler = function (em) {
            if (isThresholdReached(getTouchEvent(em), settings)) {
                if (settings.scrollObserver.hasSrcolled() || listenActiveSwipe(em, settings)) {
                    return false;
                }
            }
        };
        touchMoveListeners.push(passiveSwipeHandler);
        settings.data = {
            path: [{
                    'x': touch.pageX,
                    'y': touch.pageY
                }]
        };
    }
    /**
     * @param {?} settings
     * @return {?}
     */
    function bind(settings) {
        // Listens for events depending on value passed to bindEvents.
        /** @type {?} */
        var events = settings.bindEvents;
        /** @type {?} */
        var listenFor = '';
        if (_.includes(events, 'touch')) {
            listenFor += ' touchstart';
        }
        else if (_.includes(events, 'mouse')) {
            listenFor += ' mousedown';
        }
        if (!listenFor) {
            return;
        }
        settings.target.on(listenFor, function (es) {
            /** @type {?} */
            var touch = getTouchEvent(es);
            if (touch) {
                listenPassiveSwipe(touch, settings);
            }
        });
    }
    $.fn.swipey = function (settings) {
        this.each(function () {
            bind($.extend({
                'direction': DIRECTIONS.NONE,
                'target': $(this),
                'bindEvents': ['touch', 'mouse'],
                'swipeTarget': document,
                'threshold': 30,
                'onSwipeStart': $.noop,
                'onSwipe': $.noop,
                'onSwipeEnd': $.noop
            }, settings));
        });
        return this;
    };
    SwipeTracer = {
        'onSwipeStart': function (e, data) {
            if ($.fn.swipey.trace) {
                $('body').append('<svg height="100vh" width="100vw" ' +
                    '   style="position : fixed;top: 0;left: 0; width:100vw; height: 100vh; z-index:10000" id ="canvas">' +
                    '       <path stroke="rgba(0, 0, 0, 0.5)" stroke-linecap="round" stroke-width="20" fill-opacity="0" ' +
                    '           stroke-opacity="0.8" d="M' + data.path[0].x + ' ' + data.path[0].y + ' " />' +
                    '   </svg>');
                data.tracer = {
                    pathd: $('#canvas path')
                };
            }
        },
        'onSwipe': function (e, data) {
            if (data.tracer) {
                /** @type {?} */
                var d = data.tracer.pathd.attr('d');
                /** @type {?} */
                var p = data.path[data.path.length - 1];
                data.tracer.pathd.attr('d', d + ' L' + p.x + ' ' + p.y + ' ');
            }
        },
        'onSwipeEnd': function (e, data) {
            if (data.tracer) {
                /** @type {?} */
                var firstPoint = data.path[0];
                /** @type {?} */
                var expected_1 = [
                    firstPoint,
                    { y: firstPoint.y - 50 },
                    { x: firstPoint.x + 50 },
                    { y: firstPoint.y + 50 }
                ];
                /** @type {?} */
                var trace_1 = 0;
                _.forEach(data.path, function (p) {
                    /** @type {?} */
                    var ep;
                    if (trace_1 !== expected_1.length) {
                        ep = expected_1[trace_1];
                        if ((!ep.x || ep.x <= p.x) && (!ep.y || ep.y <= p.y)) {
                            trace_1++;
                        }
                    }
                });
                setTimeout(function () {
                    $('body >#canvas').remove();
                }, 500);
            }
        }
    };
    $.fn.swipey.DIRECTIONS = DIRECTIONS;
})(jQuery);
// Plugin extension for swipeAnimation.
(function ($) {
    /** @type {?} */
    var $parse;
    /** @type {?} */
    var expressionRegex = /\$\{\{[a-zA-Z\+-/%\.\*\s\(\)\d,\\'"\$_]*\}\}/;
    /**
     * @return {?}
     */
    function getParseService() {
        if ($.fn.swipeAnimation.expressionEvaluator) {
            return $.fn.swipeAnimation.expressionEvaluator;
        }
        if (window.exprEval && window.exprEval.Parser) {
            return function (exp) {
                /** @type {?} */
                var parser = new window.exprEval.Parser().parse(exp);
                return function (context) {
                    return parser.evaluate(context);
                };
            };
        }
    }
    // Angular parser to parse the expression inside the interpolation
    /**
     * @param {?} script
     * @return {?}
     */
    function compile(script) {
        /** @type {?} */
        var tArr = [];
        /** @type {?} */
        var match;
        $parse = $parse || getParseService();
        if (_.isFunction(script)) {
            return script;
        }
        else if ($parse) {
            while ((match = expressionRegex.exec(script)) !== null) {
                /** @type {?} */
                var expression = match[0];
                /** @type {?} */
                var prefix = script.substring(0, match.index);
                script = script.substring(match.index + expression.length);
                expression = expression.substring(3, expression.length - 2);
                tArr.push(prefix);
                tArr.push($parse(expression).bind({}));
            }
            tArr.push(script);
            return function () {
                /** @type {?} */
                var args = arguments;
                return _.map(tArr, function (v) {
                    return _.isFunction(v) ? v.apply(undefined, args) : v;
                }).join('');
            };
        }
    }
    /**
     * @param {?} obj
     * @param {?} $ele
     * @param {?=} args
     * @return {?}
     */
    function getObject(obj, $ele, args) {
        if (_.isFunction(obj)) {
            return obj.apply($ele, args);
        }
        return obj;
    }
    /**
     * @return {?}
     */
    function VelocityComputator() {
        /** @type {?} */
        var lastDistance = 0;
        /** @type {?} */
        var lastTime = 0;
        /** @type {?} */
        var v = 0;
        return {
            addDistance: function (d) {
                /** @type {?} */
                var currentTime = Date.now();
                if (Math.abs(d - lastDistance) > 10 && currentTime !== lastTime) {
                    v = (d - lastDistance) / (currentTime - lastTime);
                    lastDistance = d;
                    lastTime = currentTime;
                }
                if (v < 0) {
                    v = Math.min(v, -1);
                }
                else {
                    v = Math.max(v, 1);
                }
                return this;
            },
            getVelocity: function () {
                return v;
            },
            getTime: function (d) {
                return Math.abs(d / v);
            }
        };
    }
    /**
     * lower and upper bounds are relative distance from the center.
     * Calculates the lower and upper bounds based on relative position from center
     * @param {?} $el
     * @param {?} settings
     * @param {?=} args
     * @return {?}
     */
    function calculateBounds($el, settings, args) {
        /** @type {?} */
        var centerVal = 0;
        /** @type {?} */
        var bounds = getObject(settings.bounds, $el, args);
        if (!_.isUndefined(bounds.center)) {
            centerVal = bounds.center;
        }
        if (!_.isUndefined(bounds.lower)) {
            bounds.lower = bounds.lower + centerVal;
        }
        if (!_.isUndefined(bounds.upper)) {
            bounds.upper = bounds.upper + centerVal;
        }
        return bounds;
    }
    /**
     * This function checks if target is a function or an element and gets the target element.
     * @param {?} settings
     * @return {?}
     */
    function retrieveTargets(settings) {
        _.forEach(settings.animation, function (a) {
            if (_.isFunction(a.target) || a.targetFn) {
                a.targetFn = _.isUndefined(a.targetFn) ? a.target : a.targetFn;
                a.target = a.targetFn();
            }
        });
    }
    /**
     * Getter and setter for settings object
     * @return {?}
     */
    function SettingsProperty() {
        this.setSettings = function (settings, $el) {
            $el.data('swipeAnimationDefaults', settings);
        };
        this.getSettings = function ($el) {
            return $el.data('swipeAnimationDefaults');
        };
    }
    /**
     * This function handles the animation on element
     * @param {?} settings , metadata related to animation
     * @param {?} metaData , contains the distance moved i.e. $d and current position $D, and also bounds details
     * @param {?} time , time to persist transition
     * @param {?} $el , element on which swipe is applied
     * @param {?=} distanceMoved
     * @param {?=} e
     * @return {?}
     */
    function animate(settings, metaData, time, $el, distanceMoved, e) {
        _.forEach(settings.animation, function (a) {
            if (!a.target) {
                return;
            }
            if (a.target.length > 1) {
                a.target.each(function (i) {
                    metaData.$i = i;
                    $(this).css(_.mapValues(a.css, function (v, k) {
                        return v(metaData);
                    }));
                });
            }
            else {
                metaData.$i = 0;
                a.target.css(_.mapValues(a.css, function (v, k) {
                    return v(metaData);
                }));
            }
            a.target.css({
                'transition': 'all ease-out ' + time + 'ms'
            });
            a.target.one('webkitTransitionEnd transitionend', function () {
                a.target.css({
                    'transition': ''
                });
            });
        });
        setTimeout(function () {
            window.requestAnimationFrame(function () {
                if (metaData.$D === metaData.bounds.lower) {
                    settings.onLower.call($el);
                }
                else if (metaData.$D === metaData.bounds.upper) {
                    settings.onUpper.call($el);
                }
                settings.onAnimation(e, distanceMoved);
            });
        }, time);
    }
    /** @type {?} */
    var methods = {
        'gotoUpper': function () {
            swipeToEnd(this, 'upper', arguments[1]);
        },
        'gotoLower': function (time) {
            swipeToEnd(this, 'lower', arguments[1]);
        }
    };
    // This function animates to the upper or lower bound.
    /**
     * @param {?} $ele
     * @param {?} moveTo
     * @param {?} time
     * @return {?}
     */
    function swipeToEnd($ele, moveTo, time) {
        /** @type {?} */
        var settingsObj = new SettingsProperty();
        /** @type {?} */
        var settings = settingsObj.getSettings($ele);
        /** @type {?} */
        var metaData = {};
        /** @type {?} */
        var bounds = calculateBounds($ele, settings);
        /** @type {?} */
        var context;
        retrieveTargets(settings);
        time = time || 300;
        context = getObject(settings.context, $ele);
        metaData = _.extend({}, context);
        metaData.$d = 0;
        metaData.$D = moveTo === 'lower' ? bounds.lower : bounds.upper;
        metaData.bounds = bounds;
        animate(settings, metaData, time, $ele);
    }
    // This function adds swipe functionality on the element.
    /**
     * @param {?} $ele
     * @param {?} settings
     * @return {?}
     */
    function addSwipey($ele, settings) {
        /** @type {?} */
        var state = { '$D': 0 };
        /** @type {?} */
        var baseContext = {
            'max': Math.max,
            'min': Math.min,
            'abs': Math.abs
        };
        if (!_.isArray(settings.animation)) {
            /** @type {?} */
            var target = settings.animation.target || $ele;
            /** @type {?} */
            var css = settings.animation.css || settings.animation;
            delete css[$ele];
            settings.animation = [{
                    'target': target,
                    'css': css
                }];
        }
        _.forEach(settings.animation, function (a) {
            a.css = _.mapValues(a.css, function (v, k) {
                return compile(v);
            });
        });
        /** @type {?} */
        var settingsObj = new SettingsProperty();
        settingsObj.setSettings(settings, $ele);
        $ele.swipey({
            'direction': settings.direction,
            'threshold': settings.threshold,
            'bindEvents': settings.bindEvents,
            'target': settings.target,
            'onSwipeStart': function (e, data) {
                /** @type {?} */
                var cd;
                state.$d = 0;
                state.bounds = calculateBounds(this, settings, [e, data.length]);
                if (!_.isUndefined(state.bounds.center)) {
                    state.$D = state.bounds.center;
                }
                else {
                    state.$D = 0;
                }
                cd = state.$D + data.length;
                // by default strict is true
                state.bounds.strictLower = !(state.bounds.strict === false || state.bounds.strictLower === false);
                state.bounds.strictUpper = !(state.bounds.strict === false || state.bounds.strictUpper === false);
                if (!settings.enableGestures() ||
                    (state.bounds.strictLower &&
                        ((_.isUndefined(state.bounds.lower) && data.length < 0) ||
                            (!_.isUndefined(state.bounds.lower) && state.bounds.lower > cd))) ||
                    (state.bounds.strictUpper &&
                        ((_.isUndefined(state.bounds.upper) && data.length > 0) ||
                            (!_.isUndefined(state.bounds.upper) && state.bounds.upper < cd)))) {
                    return false;
                }
                state.vc = VelocityComputator();
                state.context = _.extend(baseContext, getObject(settings.context, $ele));
                state.localState = _.extend({}, state.context);
                retrieveTargets(settings);
                _.forEach(settings.animation, function (a) {
                    if (a.target) {
                        a.target.css({
                            'transition': 'none'
                        });
                    }
                });
            },
            'onSwipe': function (e, data) {
                /** @type {?} */
                var localState = state.localState;
                /** @type {?} */
                var cd = state.$D + data.length;
                localState.$d = data.length;
                localState.$D = state.$D;
                // only in strict mode, restrict the $d value to go beyond the bounds.
                if (state.bounds.strictLower && !_.isUndefined(state.bounds.lower) && state.bounds.lower > cd) {
                    localState.$d = (state.bounds.lower - state.$D);
                }
                else if (state.bounds.strictUpper && !_.isUndefined(state.bounds.upper) && state.bounds.upper < cd) {
                    localState.$d = (state.bounds.upper - state.$D);
                }
                state.vc.addDistance(data.length);
                _.forEach(settings.animation, function (a) {
                    if (a.target) {
                        if (a.target.length > 1) {
                            a.target.each(function (i) {
                                localState.$i = i;
                                $(this).css(_.mapValues(a.css, function (v, k) {
                                    return v(localState);
                                }));
                            });
                        }
                        else {
                            localState.$i = 0;
                            a.target.css(_.mapValues(a.css, function (v, k) {
                                return v(localState);
                            }));
                        }
                    }
                });
            },
            'onSwipeEnd': function (e, data) {
                /** @type {?} */
                var localState = state.localState;
                /** @type {?} */
                var cd = state.$D + data.length;
                /** @type {?} */
                var v = state.vc.getVelocity();
                /** @type {?} */
                var time;
                localState.$d = data.length;
                localState.$D = state.$D;
                // assigns upper or lower bounds to $D
                if (!_.isUndefined(state.bounds.lower) && v <= 0 && state.$D > cd) {
                    localState.$D = state.bounds.lower;
                }
                else if (!_.isUndefined(state.bounds.upper) && v >= 0 && state.$D < cd) {
                    localState.$D = state.bounds.upper;
                }
                localState.$d = 0;
                localState.bounds = state.bounds;
                state.$D = localState.$D;
                time = state.vc.getTime(localState.$D - cd);
                animate(settings, localState, time, $ele, cd, e);
            }
        });
    }
    // Adds the swipe functionality on the element
    $.fn.swipeAnimation = function (settings) {
        if (methods[settings]) {
            return methods[settings].apply(this, arguments);
        }
        this.each(function () {
            addSwipey($(this), $.extend({
                'direction': $.fn.swipey.DIRECTIONS.HORIZONTAL,
                'target': $(this),
                // 'step': 10,
                'threshold': 30,
                'enableGestures': function () {
                    return true;
                },
                'bindEvents': ['touch'],
                'bounds': {},
                'context': {},
                'animation': {},
                'onLower': $.noop,
                'onUpper': $.noop,
                'onAnimation': $.noop
            }, settings));
        });
        return this;
    };
})(jQuery);

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @abstract
 */
var  /**
 * @abstract
 */
SwipeAnimation = /** @class */ (function () {
    function SwipeAnimation() {
        this._isGesturesEnabled = true;
    }
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.bindEvents = /**
     * @return {?}
     */
    function () { return ['touch']; };
    /**
     * @param {?=} e
     * @param {?=} $d
     * @return {?}
     */
    SwipeAnimation.prototype.bounds = /**
     * @param {?=} e
     * @param {?=} $d
     * @return {?}
     */
    function (e, $d) { return {}; };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.context = /**
     * @return {?}
     */
    function () { return {}; };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.direction = /**
     * @return {?}
     */
    function () { return $.fn.swipey.DIRECTIONS.HORIZONTAL; };
    /**
     * @param {?} enabled
     * @return {?}
     */
    SwipeAnimation.prototype.setGesturesEnabled = /**
     * @param {?} enabled
     * @return {?}
     */
    function (enabled) { this._isGesturesEnabled = enabled; };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.isGesturesEnabled = /**
     * @return {?}
     */
    function () { return this._isGesturesEnabled; };
    /**
     * @param {?=} time
     * @return {?}
     */
    SwipeAnimation.prototype.goToLower = /**
     * @param {?=} time
     * @return {?}
     */
    function (time) {
        this._$ele.swipeAnimation('gotoLower', time);
    };
    /**
     * @param {?=} time
     * @return {?}
     */
    SwipeAnimation.prototype.goToUpper = /**
     * @param {?=} time
     * @return {?}
     */
    function (time) {
        this._$ele.swipeAnimation('gotoUpper', time);
    };
    /**
     * @param {?} e
     * @param {?} distanceMoved
     * @return {?}
     */
    SwipeAnimation.prototype.onAnimation = /**
     * @param {?} e
     * @param {?} distanceMoved
     * @return {?}
     */
    function (e, distanceMoved) { };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.onUpper = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.onLower = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.threshold = /**
     * @return {?}
     */
    function () { return 30; };
    /**
     * @param {?} $ele
     * @param {?=} $swipeTargetEle
     * @return {?}
     */
    SwipeAnimation.prototype.init = /**
     * @param {?} $ele
     * @param {?=} $swipeTargetEle
     * @return {?}
     */
    function ($ele, $swipeTargetEle) {
        this._$ele = $ele;
        $ele.swipeAnimation({
            animation: this.animation(),
            target: $swipeTargetEle,
            bounds: this.bounds.bind(this),
            bindEvents: this.bindEvents(),
            context: this.context.bind(this),
            direction: this.direction(),
            enableGestures: this.isGesturesEnabled.bind(this),
            onAnimation: this.onAnimation.bind(this),
            onLower: this.onLower.bind(this),
            onUpper: this.onUpper.bind(this),
            threshold: this.threshold()
        });
    };
    return SwipeAnimation;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { SwipeAnimation };

//# sourceMappingURL=index.js.map
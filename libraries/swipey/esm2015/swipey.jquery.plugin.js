/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// Get a regular interval for drawing to the screen
window.requestAnimationFrame = (function () {
    'use strict';
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
    'use strict';
    /** @type {?} */
    const DIRECTIONS = {
        'NONE': 0,
        'HORIZONTAL': 1,
        'LEFT_TO_RIGHT': 2,
        'RIGHT_TO_LEFT': 3,
        'VERTICAL': 4,
        'TOP_TO_DOWN': 5,
        'DOWN_TO_TOP': 6
    };
    /** @type {?} */
    const abs = Math.abs;
    /** @type {?} */
    const max = Math.max;
    /** @type {?} */
    let SwipeTracer;
    /** @type {?} */
    let activeEventProcessor;
    /** @type {?} */
    const swipeMask = $('<div style="background-color:rgba(0, 0, 0, 0);position: fixed; top: 0;width:100vw; height: 100vh;z-index: 100000;"></div>');
    /** @type {?} */
    let touchMoveListeners = [];
    /** @type {?} */
    let touchEndListeners = [];
    /** @type {?} */
    const onTouch = function (e) {
        $.each(touchMoveListeners, function (i, fn) {
            return fn(e);
        });
    };
    /** @type {?} */
    const onTouchEnd = function (e) {
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
        const elementsToObserve = (function (array) {
            /** @type {?} */
            let iter = child;
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
            let result;
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
            let result;
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
        const queue = [];
        /** @type {?} */
        let isProcessing = false;
        /** @type {?} */
        let time;
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
        let distance = 0;
        /** @type {?} */
        let deltaX;
        /** @type {?} */
        let deltaY;
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
        const touch = getTouchEvent(event);
        /** @type {?} */
        const startPoint = settings.data.path[0];
        /** @type {?} */
        const point = {
            'x': touch.pageX,
            'y': touch.pageY
        };
        /** @type {?} */
        const distance = computeDistance(startPoint, point, settings.direction);
        /** @type {?} */
        const eventSplits = [];
        /** @type {?} */
        let increment;
        /** @type {?} */
        let limit;
        settings.renderInProgress = false;
        if (distance !== settings.lastDistance) {
            increment = (distance < settings.lastDistance ? -1 : 1) * 30;
            limit = (distance - settings.lastDistance);
            for (let i = increment; (increment > 0 && i <= limit) || (increment < 0 && i >= limit); i += increment) {
                eventSplits.push(i + settings.lastDistance);
            }
            if (limit % increment !== 0) {
                eventSplits.push(limit % abs(increment) + (eventSplits.length === 0 ? settings.lastDistance : eventSplits[eventSplits.length - 1]));
            }
            // eventSplits = [distance];
            settings.lastDistance = distance;
            $.each(eventSplits, function () {
                /** @type {?} */
                const d = this;
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
        const touch = getTouchEvent(event);
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
        const touch = getTouchEvent(event);
        /** @type {?} */
        let swipeHandler;
        /** @type {?} */
        let swipeEndHandler;
        /** @type {?} */
        let passiveDistance;
        /** @type {?} */
        const passiveSwipeStartPoint = settings.data.path[0];
        /** @type {?} */
        const activeSwipeStartPoint = {
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
        const startPoint = settings.data.path[0];
        /** @type {?} */
        const endPoint = {
            'x': touch.pageX,
            'y': touch.pageY
        };
        /** @type {?} */
        const distance = computeDistance(startPoint, endPoint, settings.direction);
        return abs(distance) > settings.threshold && isThresholdAngleReached(startPoint, endPoint, settings.direction);
    }
    /**
     * @param {?} touch
     * @param {?} settings
     * @return {?}
     */
    function listenPassiveSwipe(touch, settings) {
        /** @type {?} */
        let passiveSwipeHandler;
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
        const events = settings.bindEvents;
        /** @type {?} */
        let listenFor = '';
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
            const touch = getTouchEvent(es);
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
                const d = data.tracer.pathd.attr('d');
                /** @type {?} */
                const p = data.path[data.path.length - 1];
                data.tracer.pathd.attr('d', d + ' L' + p.x + ' ' + p.y + ' ');
            }
        },
        'onSwipeEnd': function (e, data) {
            if (data.tracer) {
                /** @type {?} */
                const firstPoint = data.path[0];
                /** @type {?} */
                const expected = [
                    firstPoint,
                    { y: firstPoint.y - 50 },
                    { x: firstPoint.x + 50 },
                    { y: firstPoint.y + 50 }
                ];
                /** @type {?} */
                let trace = 0;
                _.forEach(data.path, function (p) {
                    /** @type {?} */
                    let ep;
                    if (trace !== expected.length) {
                        ep = expected[trace];
                        if ((!ep.x || ep.x <= p.x) && (!ep.y || ep.y <= p.y)) {
                            trace++;
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
    let $parse;
    /** @type {?} */
    const expressionRegex = /\$\{\{[a-zA-Z\+-/%\.\*\s\(\)\d,\\'"\$_]*\}\}/;
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
                const parser = new window.exprEval.Parser().parse(exp);
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
        const tArr = [];
        /** @type {?} */
        let match;
        $parse = $parse || getParseService();
        if (_.isFunction(script)) {
            return script;
        }
        else if ($parse) {
            while ((match = expressionRegex.exec(script)) !== null) {
                /** @type {?} */
                let expression = match[0];
                /** @type {?} */
                const prefix = script.substring(0, match.index);
                script = script.substring(match.index + expression.length);
                expression = expression.substring(3, expression.length - 2);
                tArr.push(prefix);
                tArr.push($parse(expression).bind({}));
            }
            tArr.push(script);
            return function () {
                /** @type {?} */
                const args = arguments;
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
        let lastDistance = 0;
        /** @type {?} */
        let lastTime = 0;
        /** @type {?} */
        let v = 0;
        return {
            addDistance: function (d) {
                /** @type {?} */
                const currentTime = Date.now();
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
        let centerVal = 0;
        /** @type {?} */
        const bounds = getObject(settings.bounds, $el, args);
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
    const methods = {
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
        const settingsObj = new SettingsProperty();
        /** @type {?} */
        const settings = settingsObj.getSettings($ele);
        /** @type {?} */
        let metaData = {};
        /** @type {?} */
        const bounds = calculateBounds($ele, settings);
        /** @type {?} */
        let context;
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
        const state = { '$D': 0 };
        /** @type {?} */
        const baseContext = {
            'max': Math.max,
            'min': Math.min,
            'abs': Math.abs
        };
        if (!_.isArray(settings.animation)) {
            /** @type {?} */
            const target = settings.animation.target || $ele;
            /** @type {?} */
            const css = settings.animation.css || settings.animation;
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
        const settingsObj = new SettingsProperty();
        settingsObj.setSettings(settings, $ele);
        $ele.swipey({
            'direction': settings.direction,
            'threshold': settings.threshold,
            'bindEvents': settings.bindEvents,
            'target': settings.target,
            'onSwipeStart': function (e, data) {
                /** @type {?} */
                let cd;
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
                const localState = state.localState;
                /** @type {?} */
                const cd = state.$D + data.length;
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
                const localState = state.localState;
                /** @type {?} */
                const cd = state.$D + data.length;
                /** @type {?} */
                const v = state.vc.getVelocity();
                /** @type {?} */
                let time;
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
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpcGV5LmpxdWVyeS5wbHVnaW4uanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vc3dpcGV5LyIsInNvdXJjZXMiOlsic3dpcGV5LmpxdWVyeS5wbHVnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFHQSxNQUFNLENBQUMscUJBQXFCLEdBQUcsQ0FBQztJQUM1QixZQUFZLENBQUM7SUFDYixPQUFPLE1BQU0sQ0FBQyxxQkFBcUI7UUFDL0IsTUFBTSxDQUFDLDJCQUEyQjtRQUNsQyxNQUFNLENBQUMsd0JBQXdCO1FBQy9CLE1BQU0sQ0FBQyxzQkFBc0I7UUFDN0IsTUFBTSxDQUFDLHVCQUF1QjtRQUM5QixVQUFVLFFBQVE7WUFDZCxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDO0FBQ1YsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNMLENBQUMsVUFBVSxDQUFDO0lBQ1IsWUFBWSxDQUFDOztVQUNQLFVBQVUsR0FBRztRQUNmLE1BQU0sRUFBRSxDQUFDO1FBQ1QsWUFBWSxFQUFFLENBQUM7UUFDZixlQUFlLEVBQUUsQ0FBQztRQUNsQixlQUFlLEVBQUUsQ0FBQztRQUNsQixVQUFVLEVBQUUsQ0FBQztRQUNiLGFBQWEsRUFBRSxDQUFDO1FBQ2hCLGFBQWEsRUFBRSxDQUFDO0tBQ25COztVQUNLLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRzs7VUFDZCxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUc7O1FBQ2hCLFdBQVc7O1FBQ1gsb0JBQW9COztVQUNsQixTQUFTLEdBQUcsQ0FBQyxDQUFDLDJIQUEySCxDQUFDOztRQUM1SSxrQkFBa0IsR0FBRyxFQUFFOztRQUN2QixpQkFBaUIsR0FBRyxFQUFFOztVQUVwQixPQUFPLEdBQUcsVUFBVSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxPQUFPLEVB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Q0FBQztnQkFDeEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVO2dCQUM5QyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQzs7Z0JBRWpCLFdBQVcsRUFBRSxFQUFFO2dCQUNmLGdCQUFnQixFQUFFO29CQUNkLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO2dCQUNELFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQztnQkFDdkIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsV0FBVyxFQUFFLEVBQUU7Z0JBQ2YsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJO2dCQUNqQixTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUk7Z0JBQ2pCLGFBQWEsRUFBRSxDQUFDLENBQUMsSUFBSTthQUN4QixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUVYLGVBQWUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZGVjbGFyZSBjb25zdCB3aW5kb3csIF8sIGpRdWVyeTtcblxuLy8gR2V0IGEgcmVndWxhciBpbnRlcnZhbCBmb3IgZHJhd2luZyB0byB0aGUgc2NyZWVuXG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYWl0b25GcmFtZSB8fFxuICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgICAgICB9O1xufSgpKTtcbihmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBjb25zdCBESVJFQ1RJT05TID0ge1xuICAgICAgICAnTk9ORSc6IDAsXG4gICAgICAgICdIT1JJWk9OVEFMJzogMSxcbiAgICAgICAgJ0xFRlRfVE9fUklHSFQnOiAyLFxuICAgICAgICAnUklHSFRfVE9fTEVGVCc6IDMsXG4gICAgICAgICdWRVJUSUNBTCc6IDQsXG4gICAgICAgICdUT1BfVE9fRE9XTic6IDUsXG4gICAgICAgICdET1dOX1RPX1RPUCc6IDZcbiAgICB9O1xuICAgIGNvbnN0IGFicyA9IE1hdGguYWJzO1xuICAgIGNvbnN0IG1heCA9IE1hdGgubWF4O1xuICAgIGxldCBTd2lwZVRyYWNlcjtcbiAgICBsZXQgYWN0aXZlRXZlbnRQcm9jZXNzb3I7XG4gICAgY29uc3Qgc3dpcGVNYXNrID0gJCgnPGRpdiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6cmdiYSgwLCAwLCAwLCAwKTtwb3NpdGlvbjogZml4ZWQ7IHRvcDogMDt3aWR0aDoxMDB2dzsgaGVpZ2h0OiAxMDB2aDt6LWluZGV4OiAxMDAwMDA7XCI+PC9kaXY+Jyk7XG4gICAgbGV0IHRvdWNoTW92ZUxpc3RlbmVycyA9IFtdO1xuICAgIGxldCB0b3VjaEVuZExpc3RlbmVycyA9IFtdO1xuXG4gICAgY29uc3Qgb25Ub3VjaCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICQuZWFjaCh0b3VjaE1vdmVMaXN0ZW5lcnMsIGZ1bmN0aW9uIChpLCBmbikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGUpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGNvbnN0IG9uVG91Y2hFbmQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAkLmVhY2godG91Y2hFbmRMaXN0ZW5lcnMsIGZ1bmN0aW9uIChpLCBmbikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdG91Y2hNb3ZlTGlzdGVuZXJzLmxlbmd0aCA9IDA7XG4gICAgICAgIHRvdWNoRW5kTGlzdGVuZXJzLmxlbmd0aCA9IDA7XG4gICAgfTtcblxuICAgIC8vIEJpbmRzIGV2ZW50cyBvdXRzaWRlIG9mIHpvbmVcbiAgICBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHRhcmdldCwgZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICh0YXJnZXQuX196b25lX3N5bWJvbF9fYWRkRXZlbnRMaXN0ZW5lciB8fCB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikuY2FsbCh0YXJnZXQsIGV2ZW50LCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihkb2N1bWVudCwgJ21vdXNlbW92ZScsIG9uVG91Y2gpO1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoZG9jdW1lbnQsICd0b3VjaG1vdmUnLCBvblRvdWNoKTtcbiAgICBhZGRFdmVudExpc3RlbmVyKGRvY3VtZW50LCAnbW91c2V1cCcsIG9uVG91Y2hFbmQpO1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoZG9jdW1lbnQsICd0b3VjaGNhbmNlbCcsIG9uVG91Y2hFbmQpO1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoZG9jdW1lbnQsICd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuXG4gICAgZnVuY3Rpb24gU2Nyb2xsT2JzZXJ2ZXIocGFyZW50LCBjaGlsZCwgZGlyZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzVG9PYnNlcnZlID0gKGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICAgICAgbGV0IGl0ZXIgPSBjaGlsZDtcbiAgICAgICAgICAgIHdoaWxlIChpdGVyKSB7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICckZWxlJzogJChpdGVyKSxcbiAgICAgICAgICAgICAgICAgICAgJ2xhc3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnc2Nyb2xsTGVmdCc6IGl0ZXIuaXNjcm9sbCA/IGl0ZXIuaXNjcm9sbC54IDogaXRlci5zY3JvbGxMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3Njcm9sbFRvcCc6IGl0ZXIuaXNjcm9sbCA/IGl0ZXIuaXNjcm9sbC55IDogaXRlci5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGl0ZXIgPSBpdGVyLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgICAgIH0pKFtdKTtcblxuICAgICAgICBmdW5jdGlvbiBpc1ZlcnRpY2FsU2Nyb2xsKCkge1xuICAgICAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgICAgICQuZWFjaChlbGVtZW50c1RvT2JzZXJ2ZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRlbGVbMF0uaXNjcm9sbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKHRoaXMuJGVsZVswXS5pc2Nyb2xsLnkpICYmIHRoaXMuJGVsZVswXS5pc2Nyb2xsLnkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuJGVsZVswXS5zY3JvbGxUb3AgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpc0hvcml6b250YWxTY3JvbGwoKSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICAgICAgJC5lYWNoKGVsZW1lbnRzVG9PYnNlcnZlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJGVsZVswXS5pc2Nyb2xsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4odGhpcy4kZWxlWzBdLmlzY3JvbGwueCkgJiYgdGhpcy4kZWxlWzBdLmlzY3JvbGwueCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy4kZWxlWzBdLnNjcm9sbExlZnQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1NyY29sbGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJC5mbi5zd2lwZXkuRElSRUNUSU9OUy5WRVJUSUNBTCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc1ZlcnRpY2FsU2Nyb2xsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAkLmZuLnN3aXBleS5ESVJFQ1RJT05TLkhPUklaT05UQUwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNIb3Jpem9udGFsU2Nyb2xsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gU3dpcGVFdmVudFNtb290aGVyKCkge1xuICAgICAgICBjb25zdCBxdWV1ZSA9IFtdO1xuICAgICAgICBsZXQgaXNQcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGxldCB0aW1lO1xuXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3MoKSB7XG4gICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnNoaWZ0KCkoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Z1bmN0aW9uIGludm9jYXRpb24gZmFpbGVkJywgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocHJvY2Vzcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlzUHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wdXNoID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnByb2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWlzUHJvY2Vzc2luZykge1xuICAgICAgICAgICAgICAgIGlzUHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgLy8gdGltZSA9IDA7XG4gICAgICAgICAgICAgICAgcHJvY2VzcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFjdGl2ZUV2ZW50UHJvY2Vzc29yID0gbmV3IFN3aXBlRXZlbnRTbW9vdGhlcigpO1xuXG4gICAgZnVuY3Rpb24gZ2V0VG91Y2hFdmVudChldmVudCkge1xuICAgICAgICByZXR1cm4gKGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSkgfHxcbiAgICAgICAgICAgIChldmVudCAmJiBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0pIHx8XG4gICAgICAgICAgICBldmVudDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb21wdXRlRGlzdGFuY2Uoc3RhcnRQb2ludCwgZW5kUG9pbnQsIGRpcmVjdGlvbikge1xuICAgICAgICBsZXQgZGlzdGFuY2UgPSAwLFxuICAgICAgICAgICAgZGVsdGFYLFxuICAgICAgICAgICAgZGVsdGFZO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBESVJFQ1RJT05TLkhPUklaT05UQUwpIHtcbiAgICAgICAgICAgIGRpc3RhbmNlID0gZW5kUG9pbnQueCAtIHN0YXJ0UG9pbnQueDtcbiAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IERJUkVDVElPTlMuTEVGVF9UT19SSUdIVCkge1xuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXgoZW5kUG9pbnQueCAtIHN0YXJ0UG9pbnQueCwgMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSBESVJFQ1RJT05TLlJJR0hUX1RPX0xFRlQpIHtcbiAgICAgICAgICAgIGRpc3RhbmNlID0gbWF4KHN0YXJ0UG9pbnQueCAtIGVuZFBvaW50LngsIDApO1xuICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gRElSRUNUSU9OUy5WRVJUSUNBTCkge1xuICAgICAgICAgICAgZGlzdGFuY2UgPSBlbmRQb2ludC55IC0gc3RhcnRQb2ludC55O1xuICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gRElSRUNUSU9OUy5UT1BfVE9fRE9XTikge1xuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXgoZW5kUG9pbnQueSAtIHN0YXJ0UG9pbnQueSwgMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSBESVJFQ1RJT05TLkRPV05fVE9fVE9QKSB7XG4gICAgICAgICAgICBkaXN0YW5jZSA9IG1heChzdGFydFBvaW50LnkgLSBlbmRQb2ludC55LCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbHRhWCA9IGVuZFBvaW50LnggLSBzdGFydFBvaW50Lng7XG4gICAgICAgICAgICBkZWx0YVkgPSBlbmRQb2ludC55IC0gc3RhcnRQb2ludC55O1xuICAgICAgICAgICAgZGlzdGFuY2UgPSBtYXgoYWJzKGRlbHRhWCksIGFicyhkZWx0YVkpKTtcbiAgICAgICAgICAgIGlmICgoZGVsdGFYIDwgMCAmJiBhYnMoZGVsdGFYKSA9PT0gZGlzdGFuY2UpIHx8IChkZWx0YVkgPCAwICYmIGFicyhkZWx0YVkpID09PSBkaXN0YW5jZSkpIHtcbiAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IC1kaXN0YW5jZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25BY3RpdmVTd2lwZShldmVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgY29uc3QgdG91Y2ggPSBnZXRUb3VjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgY29uc3Qgc3RhcnRQb2ludCA9IHNldHRpbmdzLmRhdGEucGF0aFswXTtcbiAgICAgICAgY29uc3QgcG9pbnQgPSB7XG4gICAgICAgICAgICAneCc6IHRvdWNoLnBhZ2VYLFxuICAgICAgICAgICAgJ3knOiB0b3VjaC5wYWdlWVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IGNvbXB1dGVEaXN0YW5jZShzdGFydFBvaW50LCBwb2ludCwgc2V0dGluZ3MuZGlyZWN0aW9uKTtcbiAgICAgICAgY29uc3QgZXZlbnRTcGxpdHMgPSBbXTtcbiAgICAgICAgbGV0IGluY3JlbWVudDtcbiAgICAgICAgbGV0IGxpbWl0O1xuICAgICAgICBzZXR0aW5ncy5yZW5kZXJJblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgIGlmIChkaXN0YW5jZSAhPT0gc2V0dGluZ3MubGFzdERpc3RhbmNlKSB7XG4gICAgICAgICAgICBpbmNyZW1lbnQgPSAoZGlzdGFuY2UgPCBzZXR0aW5ncy5sYXN0RGlzdGFuY2UgPyAtMSA6IDEpICogMzA7XG4gICAgICAgICAgICBsaW1pdCA9IChkaXN0YW5jZSAtIHNldHRpbmdzLmxhc3REaXN0YW5jZSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gaW5jcmVtZW50O1xuICAgICAgICAgICAgICAgICAoaW5jcmVtZW50ID4gMCAmJiBpIDw9IGxpbWl0KSB8fCAoaW5jcmVtZW50IDwgMCAmJiBpID49IGxpbWl0KTsgaSArPSBpbmNyZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudFNwbGl0cy5wdXNoKGkgKyBzZXR0aW5ncy5sYXN0RGlzdGFuY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbWl0ICUgaW5jcmVtZW50ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRTcGxpdHMucHVzaChsaW1pdCAlIGFicyhpbmNyZW1lbnQpICsgKGV2ZW50U3BsaXRzLmxlbmd0aCA9PT0gMCA/IHNldHRpbmdzLmxhc3REaXN0YW5jZSA6IGV2ZW50U3BsaXRzW2V2ZW50U3BsaXRzLmxlbmd0aCAtIDFdKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBldmVudFNwbGl0cyA9IFtkaXN0YW5jZV07XG4gICAgICAgICAgICBzZXR0aW5ncy5sYXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICQuZWFjaChldmVudFNwbGl0cywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIGFjdGl2ZUV2ZW50UHJvY2Vzc29yLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5kYXRhLmxlbmd0aCA9IGQ7XG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmRhdGEudG90YWxMZW5ndGggKz0gYWJzKGQpO1xuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5kYXRhLnZlbG9jaXR5ID0gYWJzKHNldHRpbmdzLmRhdGEudG90YWxMZW5ndGggLyAoRGF0ZS5ub3coKSAtIHNldHRpbmdzLmRhdGEuc3RhcnRUaW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmRhdGEucGF0aC5wdXNoKHBvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLm9uU3dpcGUuY2FsbChzZXR0aW5ncy50YXJnZXQsIGV2ZW50LCBzZXR0aW5ncy5kYXRhKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQWN0aXZlU3dpcGVFbmQoZXZlbnQsIHNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBTd2lwZVRyYWNlci5vblN3aXBlKGV2ZW50LCBzZXR0aW5ncy5kYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYWN0aXZlRXZlbnRQcm9jZXNzb3IucHJvY2VzcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25BY3RpdmVTd2lwZUVuZChldmVudCwgc2V0dGluZ3MpIHtcbiAgICAgICAgY29uc3QgdG91Y2ggPSBnZXRUb3VjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYgKHRvdWNoKSB7XG4gICAgICAgICAgICBzZXR0aW5ncy5kYXRhLnBhdGgucHVzaCh7XG4gICAgICAgICAgICAgICAgJ3gnOiB0b3VjaC5wYWdlWCxcbiAgICAgICAgICAgICAgICAneSc6IHRvdWNoLnBhZ2VZXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBhY3RpdmVFdmVudFByb2Nlc3Nvci5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIFN3aXBlVHJhY2VyLm9uU3dpcGVFbmQoZXZlbnQsIHNldHRpbmdzLmRhdGEpO1xuICAgICAgICAgICAgc2V0dGluZ3Mub25Td2lwZUVuZC5jYWxsKHNldHRpbmdzLnRhcmdldCwgZXZlbnQsIHNldHRpbmdzLmRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgYWN0aXZlRXZlbnRQcm9jZXNzb3IucHJvY2VzcygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RlbkFjdGl2ZVN3aXBlKGV2ZW50LCBzZXR0aW5ncykge1xuICAgICAgICBjb25zdCB0b3VjaCA9IGdldFRvdWNoRXZlbnQoZXZlbnQpO1xuICAgICAgICBsZXQgc3dpcGVIYW5kbGVyO1xuICAgICAgICBsZXQgc3dpcGVFbmRIYW5kbGVyO1xuICAgICAgICBsZXQgcGFzc2l2ZURpc3RhbmNlO1xuICAgICAgICBjb25zdCBwYXNzaXZlU3dpcGVTdGFydFBvaW50ID0gc2V0dGluZ3MuZGF0YS5wYXRoWzBdO1xuICAgICAgICBjb25zdCBhY3RpdmVTd2lwZVN0YXJ0UG9pbnQgPSB7XG4gICAgICAgICAgICAneCc6IHRvdWNoLnBhZ2VYLFxuICAgICAgICAgICAgJ3knOiB0b3VjaC5wYWdlWVxuICAgICAgICB9O1xuICAgICAgICBwYXNzaXZlRGlzdGFuY2UgPSBjb21wdXRlRGlzdGFuY2UocGFzc2l2ZVN3aXBlU3RhcnRQb2ludCwgYWN0aXZlU3dpcGVTdGFydFBvaW50LCBzZXR0aW5ncy5kaXJlY3Rpb24pO1xuICAgICAgICBzZXR0aW5ncy5kYXRhLmxlbmd0aCA9IHBhc3NpdmVEaXN0YW5jZSA8IDAgPyAtMSA6IDE7XG4gICAgICAgIHNldHRpbmdzLmxhc3REaXN0YW5jZSA9IHNldHRpbmdzLmRhdGEubGVuZ3RoO1xuICAgICAgICBzZXR0aW5ncy5kYXRhLnBhdGggPSBbYWN0aXZlU3dpcGVTdGFydFBvaW50XTtcbiAgICAgICAgc2V0dGluZ3MuZGF0YS50b3RhbExlbmd0aCA9IGFicyhzZXR0aW5ncy5kYXRhLmxlbmd0aCk7XG4gICAgICAgIHNldHRpbmdzLmRhdGEuc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgaWYgKHNldHRpbmdzLm9uU3dpcGVTdGFydC5jYWxsKHNldHRpbmdzLnRhcmdldCwgZXZlbnQsIHNldHRpbmdzLmRhdGEpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHN3aXBlTWFzay5hcHBlbmRUbygkKCdib2R5JykpO1xuICAgICAgICBzd2lwZUhhbmRsZXIgPSBmdW5jdGlvbiAoZW0pIHtcbiAgICAgICAgICAgIG9uQWN0aXZlU3dpcGUoZW0sIHNldHRpbmdzKTtcbiAgICAgICAgfTtcbiAgICAgICAgc3dpcGVFbmRIYW5kbGVyID0gZnVuY3Rpb24gKGVlKSB7XG4gICAgICAgICAgICBzd2lwZU1hc2sucmVtb3ZlKCk7XG4gICAgICAgICAgICBvbkFjdGl2ZVN3aXBlRW5kKGVlLCBzZXR0aW5ncyk7XG4gICAgICAgIH07XG4gICAgICAgIHRvdWNoTW92ZUxpc3RlbmVycyA9IFtdO1xuICAgICAgICB0b3VjaE1vdmVMaXN0ZW5lcnMucHVzaChzd2lwZUhhbmRsZXIpO1xuXG4gICAgICAgIHRvdWNoRW5kTGlzdGVuZXJzID0gW107XG4gICAgICAgIHRvdWNoRW5kTGlzdGVuZXJzLnB1c2goc3dpcGVFbmRIYW5kbGVyKTtcbiAgICAgICAgU3dpcGVUcmFjZXIub25Td2lwZVN0YXJ0KGV2ZW50LCBzZXR0aW5ncy5kYXRhKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBjaGVja3MgaWYgdG91Y2ggcG9zaXRpb25zIGFyZSB3aXRoaW4gKy8tIDIwZGVnIGVycm9yIGluIGhvcml6b250YWwgYW5kIDcwZGVnIGluIHZlcnRpY2FsIGRpcmVjdGlvbi5cbiAgICBmdW5jdGlvbiBpc1RocmVzaG9sZEFuZ2xlUmVhY2hlZChzdGFydFBvaW50LCBlbmRQb2ludCwgZGlyZWN0aW9uKSB7XG4gICAgICAgIC8vIHRhbjIwLCB0YW4oLTIwZGVnKVxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBESVJFQ1RJT05TLkhPUklaT05UQUwpIHtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicygoZW5kUG9pbnQueSAtIHN0YXJ0UG9pbnQueSkgLyAoZW5kUG9pbnQueCAtIHN0YXJ0UG9pbnQueCkpIDw9IDAuMzYzOTcwMjM0MjYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IERJUkVDVElPTlMuVkVSVElDQUwpIHsgLy8gYmV0d2VlbiB0YW43MCAmIHRhbjExMFxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKChlbmRQb2ludC55IC0gc3RhcnRQb2ludC55KSAvIChlbmRQb2ludC54IC0gc3RhcnRQb2ludC54KSkgPj0gMi43NDc0Nzc0MTk0NSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1RocmVzaG9sZFJlYWNoZWQodG91Y2gsIHNldHRpbmdzKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSBzZXR0aW5ncy5kYXRhLnBhdGhbMF07XG4gICAgICAgIGNvbnN0IGVuZFBvaW50ID0ge1xuICAgICAgICAgICAgJ3gnOiB0b3VjaC5wYWdlWCxcbiAgICAgICAgICAgICd5JzogdG91Y2gucGFnZVlcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBjb21wdXRlRGlzdGFuY2Uoc3RhcnRQb2ludCwgZW5kUG9pbnQsIHNldHRpbmdzLmRpcmVjdGlvbik7XG4gICAgICAgIHJldHVybiBhYnMoZGlzdGFuY2UpID4gc2V0dGluZ3MudGhyZXNob2xkICYmIGlzVGhyZXNob2xkQW5nbGVSZWFjaGVkKHN0YXJ0UG9pbnQsIGVuZFBvaW50LCBzZXR0aW5ncy5kaXJlY3Rpb24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RlblBhc3NpdmVTd2lwZSh0b3VjaCwgc2V0dGluZ3MpIHtcbiAgICAgICAgbGV0IHBhc3NpdmVTd2lwZUhhbmRsZXI7XG4gICAgICAgIHNldHRpbmdzLnNjcm9sbE9ic2VydmVyID0gbmV3IFNjcm9sbE9ic2VydmVyKGV2ZW50LmN1cnJlbnRUYXJnZXQsIGV2ZW50LnRhcmdldCwgc2V0dGluZ3MuZGlyZWN0aW9uKTtcbiAgICAgICAgcGFzc2l2ZVN3aXBlSGFuZGxlciA9IGZ1bmN0aW9uIChlbSkge1xuICAgICAgICAgICAgaWYgKGlzVGhyZXNob2xkUmVhY2hlZChnZXRUb3VjaEV2ZW50KGVtKSwgc2V0dGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnNjcm9sbE9ic2VydmVyLmhhc1NyY29sbGVkKCkgfHwgbGlzdGVuQWN0aXZlU3dpcGUoZW0sIHNldHRpbmdzKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0b3VjaE1vdmVMaXN0ZW5lcnMucHVzaChwYXNzaXZlU3dpcGVIYW5kbGVyKTtcbiAgICAgICAgc2V0dGluZ3MuZGF0YSA9IHtcbiAgICAgICAgICAgIHBhdGg6IFt7XG4gICAgICAgICAgICAgICAgJ3gnOiB0b3VjaC5wYWdlWCxcbiAgICAgICAgICAgICAgICAneSc6IHRvdWNoLnBhZ2VZXG4gICAgICAgICAgICB9XVxuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gYmluZChzZXR0aW5ncykge1xuICAgICAgICAvLyBMaXN0ZW5zIGZvciBldmVudHMgZGVwZW5kaW5nIG9uIHZhbHVlIHBhc3NlZCB0byBiaW5kRXZlbnRzLlxuICAgICAgICBjb25zdCBldmVudHMgPSBzZXR0aW5ncy5iaW5kRXZlbnRzO1xuICAgICAgICBsZXQgbGlzdGVuRm9yID0gJyc7XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKGV2ZW50cywgJ3RvdWNoJykpIHtcbiAgICAgICAgICAgIGxpc3RlbkZvciArPSAnIHRvdWNoc3RhcnQnO1xuICAgICAgICB9IGVsc2UgaWYgKF8uaW5jbHVkZXMoZXZlbnRzLCAnbW91c2UnKSkge1xuICAgICAgICAgICAgbGlzdGVuRm9yICs9ICcgbW91c2Vkb3duJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbGlzdGVuRm9yKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzZXR0aW5ncy50YXJnZXQub24obGlzdGVuRm9yLCBmdW5jdGlvbiAoZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvdWNoID0gZ2V0VG91Y2hFdmVudChlcyk7XG4gICAgICAgICAgICBpZiAodG91Y2gpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5QYXNzaXZlU3dpcGUodG91Y2gsIHNldHRpbmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJC5mbi5zd2lwZXkgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJpbmQoJC5leHRlbmQoe1xuICAgICAgICAgICAgICAgICdkaXJlY3Rpb24nOiBESVJFQ1RJT05TLk5PTkUsXG4gICAgICAgICAgICAgICAgJ3RhcmdldCc6ICQodGhpcyksXG4gICAgICAgICAgICAgICAgJ2JpbmRFdmVudHMnOiBbJ3RvdWNoJywgJ21vdXNlJ10sXG4gICAgICAgICAgICAgICAgJ3N3aXBlVGFyZ2V0JzogZG9jdW1lbnQsXG4gICAgICAgICAgICAgICAgJ3RocmVzaG9sZCc6IDMwLFxuICAgICAgICAgICAgICAgICdvblN3aXBlU3RhcnQnOiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgJ29uU3dpcGUnOiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgJ29uU3dpcGVFbmQnOiAkLm5vb3BcbiAgICAgICAgICAgIH0sIHNldHRpbmdzKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgU3dpcGVUcmFjZXIgPSB7XG4gICAgICAgICdvblN3aXBlU3RhcnQnOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xuICAgICAgICAgICAgaWYgKCQuZm4uc3dpcGV5LnRyYWNlKSB7XG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmFwcGVuZCgnPHN2ZyBoZWlnaHQ9XCIxMDB2aFwiIHdpZHRoPVwiMTAwdndcIiAnICtcbiAgICAgICAgICAgICAgICAgICAgJyAgIHN0eWxlPVwicG9zaXRpb24gOiBmaXhlZDt0b3A6IDA7bGVmdDogMDsgd2lkdGg6MTAwdnc7IGhlaWdodDogMTAwdmg7IHotaW5kZXg6MTAwMDBcIiBpZCA9XCJjYW52YXNcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJyAgICAgICA8cGF0aCBzdHJva2U9XCJyZ2JhKDAsIDAsIDAsIDAuNSlcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLXdpZHRoPVwiMjBcIiBmaWxsLW9wYWNpdHk9XCIwXCIgJyArXG4gICAgICAgICAgICAgICAgICAgICcgICAgICAgICAgIHN0cm9rZS1vcGFjaXR5PVwiMC44XCIgZD1cIk0nICsgZGF0YS5wYXRoWzBdLnggKyAnICcgKyBkYXRhLnBhdGhbMF0ueSArICcgXCIgLz4nICtcbiAgICAgICAgICAgICAgICAgICAgJyAgIDwvc3ZnPicpO1xuICAgICAgICAgICAgICAgIGRhdGEudHJhY2VyID0ge1xuICAgICAgICAgICAgICAgICAgICBwYXRoZDogJCgnI2NhbnZhcyBwYXRoJylcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAnb25Td2lwZSc6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS50cmFjZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gZGF0YS50cmFjZXIucGF0aGQuYXR0cignZCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBkYXRhLnBhdGhbZGF0YS5wYXRoLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGRhdGEudHJhY2VyLnBhdGhkLmF0dHIoJ2QnLCBkICsgJyBMJyArIHAueCArICcgJyArIHAueSArICcgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICdvblN3aXBlRW5kJzogZnVuY3Rpb24gKGUsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChkYXRhLnRyYWNlcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0UG9pbnQgPSBkYXRhLnBhdGhbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWQgPSBbXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0UG9pbnQsXG4gICAgICAgICAgICAgICAgICAgIHsgeTogZmlyc3RQb2ludC55IC0gNTAgfSxcbiAgICAgICAgICAgICAgICAgICAgeyB4OiBmaXJzdFBvaW50LnggKyA1MCB9LFxuICAgICAgICAgICAgICAgICAgICB7IHk6IGZpcnN0UG9pbnQueSArIDUwfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgbGV0IHRyYWNlID0gMDtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goZGF0YS5wYXRoLCBmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZXA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFjZSAhPT0gZXhwZWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcCA9IGV4cGVjdGVkW3RyYWNlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoIWVwLnggfHwgZXAueCA8PSBwLngpICYmICghZXAueSB8fCBlcC55IDw9IHAueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFjZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ2JvZHkgPiNjYW52YXMnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAkLmZuLnN3aXBleS5ESVJFQ1RJT05TID0gRElSRUNUSU9OUztcbn0pKGpRdWVyeSk7XG5cbi8vIFBsdWdpbiBleHRlbnNpb24gZm9yIHN3aXBlQW5pbWF0aW9uLlxuKGZ1bmN0aW9uICgkKSB7XG4gICAgbGV0ICRwYXJzZTtcbiAgICBjb25zdCBleHByZXNzaW9uUmVnZXggPSAvXFwkXFx7XFx7W2EtekEtWlxcKy0vJVxcLlxcKlxcc1xcKFxcKVxcZCxcXFxcJ1wiXFwkX10qXFx9XFx9LztcblxuICAgIGZ1bmN0aW9uIGdldFBhcnNlU2VydmljZSgpIHtcbiAgICAgICAgaWYgKCQuZm4uc3dpcGVBbmltYXRpb24uZXhwcmVzc2lvbkV2YWx1YXRvcikge1xuICAgICAgICAgICAgcmV0dXJuICQuZm4uc3dpcGVBbmltYXRpb24uZXhwcmVzc2lvbkV2YWx1YXRvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAod2luZG93LmV4cHJFdmFsICYmIHdpbmRvdy5leHByRXZhbC5QYXJzZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZXhwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IHdpbmRvdy5leHByRXZhbC5QYXJzZXIoKS5wYXJzZShleHApO1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VyLmV2YWx1YXRlKGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQW5ndWxhciBwYXJzZXIgdG8gcGFyc2UgdGhlIGV4cHJlc3Npb24gaW5zaWRlIHRoZSBpbnRlcnBvbGF0aW9uXG4gICAgZnVuY3Rpb24gY29tcGlsZShzY3JpcHQpIHtcbiAgICAgICAgY29uc3QgdEFyciA9IFtdO1xuICAgICAgICBsZXQgbWF0Y2g7XG5cbiAgICAgICAgJHBhcnNlID0gJHBhcnNlIHx8IGdldFBhcnNlU2VydmljZSgpO1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHNjcmlwdCkpIHtcbiAgICAgICAgICAgIHJldHVybiBzY3JpcHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoJHBhcnNlKSB7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gZXhwcmVzc2lvblJlZ2V4LmV4ZWMoc2NyaXB0KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsZXQgZXhwcmVzc2lvbiA9IG1hdGNoWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IHNjcmlwdC5zdWJzdHJpbmcoMCwgbWF0Y2guaW5kZXgpO1xuICAgICAgICAgICAgICAgIHNjcmlwdCA9IHNjcmlwdC5zdWJzdHJpbmcobWF0Y2guaW5kZXggKyBleHByZXNzaW9uLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24uc3Vic3RyaW5nKDMsIGV4cHJlc3Npb24ubGVuZ3RoIC0gMik7XG4gICAgICAgICAgICAgICAgdEFyci5wdXNoKHByZWZpeCk7XG4gICAgICAgICAgICAgICAgdEFyci5wdXNoKCRwYXJzZShleHByZXNzaW9uKS5iaW5kKHt9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0QXJyLnB1c2goc2NyaXB0KTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5tYXAodEFyciwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2KSA/IHYuYXBwbHkodW5kZWZpbmVkLCBhcmdzKSA6IHY7XG4gICAgICAgICAgICAgICAgfSkuam9pbignJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRPYmplY3Qob2JqLCAkZWxlLCBhcmdzPykge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmouYXBwbHkoJGVsZSwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBWZWxvY2l0eUNvbXB1dGF0b3IoKSB7XG4gICAgICAgIGxldCBsYXN0RGlzdGFuY2UgPSAwO1xuICAgICAgICBsZXQgbGFzdFRpbWUgPSAwO1xuICAgICAgICBsZXQgdiA9IDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhZGREaXN0YW5jZTogZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGQgLSBsYXN0RGlzdGFuY2UpID4gMTAgJiYgY3VycmVudFRpbWUgIT09IGxhc3RUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHYgPSAoZCAtIGxhc3REaXN0YW5jZSkgLyAoY3VycmVudFRpbWUgLSBsYXN0VGltZSk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3REaXN0YW5jZSA9IGQ7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh2IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB2ID0gTWF0aC5taW4odiwgLTEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHYgPSBNYXRoLm1heCh2LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0VmVsb2NpdHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRUaW1lOiBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyhkIC8gdik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbG93ZXIgYW5kIHVwcGVyIGJvdW5kcyBhcmUgcmVsYXRpdmUgZGlzdGFuY2UgZnJvbSB0aGUgY2VudGVyLlxuICAgICAqIENhbGN1bGF0ZXMgdGhlIGxvd2VyIGFuZCB1cHBlciBib3VuZHMgYmFzZWQgb24gcmVsYXRpdmUgcG9zaXRpb24gZnJvbSBjZW50ZXJcbiAgICAgKiBAcGFyYW0gJGVsXG4gICAgICogQHBhcmFtIHNldHRpbmdzXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlQm91bmRzKCRlbCwgc2V0dGluZ3MsIGFyZ3M/KSB7XG4gICAgICAgIGxldCBjZW50ZXJWYWwgPSAwO1xuICAgICAgICBjb25zdCBib3VuZHMgPSBnZXRPYmplY3Qoc2V0dGluZ3MuYm91bmRzLCAkZWwsIGFyZ3MpO1xuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChib3VuZHMuY2VudGVyKSkge1xuICAgICAgICAgICAgY2VudGVyVmFsID0gYm91bmRzLmNlbnRlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYm91bmRzLmxvd2VyKSkge1xuICAgICAgICAgICAgYm91bmRzLmxvd2VyID0gYm91bmRzLmxvd2VyICsgY2VudGVyVmFsO1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChib3VuZHMudXBwZXIpKSB7XG4gICAgICAgICAgICBib3VuZHMudXBwZXIgPSBib3VuZHMudXBwZXIgKyBjZW50ZXJWYWw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGlmIHRhcmdldCBpcyBhIGZ1bmN0aW9uIG9yIGFuIGVsZW1lbnQgYW5kIGdldHMgdGhlIHRhcmdldCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSBzZXR0aW5nc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJldHJpZXZlVGFyZ2V0cyhzZXR0aW5ncykge1xuICAgICAgICBfLmZvckVhY2goc2V0dGluZ3MuYW5pbWF0aW9uLCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihhLnRhcmdldCkgfHwgYS50YXJnZXRGbikge1xuICAgICAgICAgICAgICAgIGEudGFyZ2V0Rm4gPSBfLmlzVW5kZWZpbmVkKGEudGFyZ2V0Rm4pID8gYS50YXJnZXQgOiBhLnRhcmdldEZuO1xuICAgICAgICAgICAgICAgIGEudGFyZ2V0ID0gYS50YXJnZXRGbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXR0ZXIgYW5kIHNldHRlciBmb3Igc2V0dGluZ3Mgb2JqZWN0XG4gICAgICovXG4gICAgZnVuY3Rpb24gU2V0dGluZ3NQcm9wZXJ0eSgpIHtcbiAgICAgICAgdGhpcy5zZXRTZXR0aW5ncyA9IGZ1bmN0aW9uIChzZXR0aW5ncywgJGVsKSB7XG4gICAgICAgICAgICAkZWwuZGF0YSgnc3dpcGVBbmltYXRpb25EZWZhdWx0cycsIHNldHRpbmdzKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRTZXR0aW5ncyA9IGZ1bmN0aW9uICgkZWwpIHtcbiAgICAgICAgICAgIHJldHVybiAkZWwuZGF0YSgnc3dpcGVBbmltYXRpb25EZWZhdWx0cycpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gaGFuZGxlcyB0aGUgYW5pbWF0aW9uIG9uIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3MgLCBtZXRhZGF0YSByZWxhdGVkIHRvIGFuaW1hdGlvblxuICAgICAqIEBwYXJhbSBtZXRhRGF0YSAsIGNvbnRhaW5zIHRoZSBkaXN0YW5jZSBtb3ZlZCBpLmUuICRkIGFuZCBjdXJyZW50IHBvc2l0aW9uICRELCBhbmQgYWxzbyBib3VuZHMgZGV0YWlsc1xuICAgICAqIEBwYXJhbSB0aW1lICwgdGltZSB0byBwZXJzaXN0IHRyYW5zaXRpb25cbiAgICAgKiBAcGFyYW0gJGVsICwgZWxlbWVudCBvbiB3aGljaCBzd2lwZSBpcyBhcHBsaWVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gYW5pbWF0ZShzZXR0aW5ncywgbWV0YURhdGEsIHRpbWUsICRlbCwgZGlzdGFuY2VNb3ZlZD8sIGU/KSB7XG4gICAgICAgIF8uZm9yRWFjaChzZXR0aW5ncy5hbmltYXRpb24sIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICBpZiAoIWEudGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGEudGFyZ2V0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBhLnRhcmdldC5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGFEYXRhLiRpID0gaTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoXy5tYXBWYWx1ZXMoYS5jc3MsIGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdihtZXRhRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWV0YURhdGEuJGkgPSAwO1xuICAgICAgICAgICAgICAgIGEudGFyZ2V0LmNzcyhfLm1hcFZhbHVlcyhhLmNzcywgZnVuY3Rpb24gKHYsIGspIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHYobWV0YURhdGEpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGEudGFyZ2V0LmNzcyh7XG4gICAgICAgICAgICAgICAgJ3RyYW5zaXRpb24nOiAnYWxsIGVhc2Utb3V0ICcgKyB0aW1lICsgJ21zJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhLnRhcmdldC5vbmUoJ3dlYmtpdFRyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBhLnRhcmdldC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAndHJhbnNpdGlvbic6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1ldGFEYXRhLiREID09PSBtZXRhRGF0YS5ib3VuZHMubG93ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3Mub25Mb3dlci5jYWxsKCRlbCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRhRGF0YS4kRCA9PT0gbWV0YURhdGEuYm91bmRzLnVwcGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLm9uVXBwZXIuY2FsbCgkZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5vbkFuaW1hdGlvbihlLCBkaXN0YW5jZU1vdmVkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aW1lKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRob2RzID0ge1xuICAgICAgICAnZ290b1VwcGVyJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc3dpcGVUb0VuZCh0aGlzLCAndXBwZXInLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICB9LFxuICAgICAgICAnZ290b0xvd2VyJzogZnVuY3Rpb24gKHRpbWUpIHtcbiAgICAgICAgICAgIHN3aXBlVG9FbmQodGhpcywgJ2xvd2VyJywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGFuaW1hdGVzIHRvIHRoZSB1cHBlciBvciBsb3dlciBib3VuZC5cbiAgICBmdW5jdGlvbiBzd2lwZVRvRW5kKCRlbGUsIG1vdmVUbywgdGltZSkge1xuICAgICAgICBjb25zdCBzZXR0aW5nc09iaiA9IG5ldyBTZXR0aW5nc1Byb3BlcnR5KCk7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gc2V0dGluZ3NPYmouZ2V0U2V0dGluZ3MoJGVsZSk7XG4gICAgICAgIGxldCBtZXRhRGF0YTogYW55ID0ge307XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGNhbGN1bGF0ZUJvdW5kcygkZWxlLCBzZXR0aW5ncyk7XG4gICAgICAgIGxldCBjb250ZXh0O1xuXG4gICAgICAgIHJldHJpZXZlVGFyZ2V0cyhzZXR0aW5ncyk7XG5cbiAgICAgICAgdGltZSA9IHRpbWUgfHwgMzAwO1xuXG4gICAgICAgIGNvbnRleHQgPSBnZXRPYmplY3Qoc2V0dGluZ3MuY29udGV4dCwgJGVsZSk7XG4gICAgICAgIG1ldGFEYXRhID0gXy5leHRlbmQoe30sIGNvbnRleHQpO1xuICAgICAgICBtZXRhRGF0YS4kZCA9IDA7XG4gICAgICAgIG1ldGFEYXRhLiREID0gbW92ZVRvID09PSAnbG93ZXInID8gYm91bmRzLmxvd2VyIDogYm91bmRzLnVwcGVyO1xuICAgICAgICBtZXRhRGF0YS5ib3VuZHMgPSBib3VuZHM7XG5cbiAgICAgICAgYW5pbWF0ZShzZXR0aW5ncywgbWV0YURhdGEsIHRpbWUsICRlbGUpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gYWRkcyBzd2lwZSBmdW5jdGlvbmFsaXR5IG9uIHRoZSBlbGVtZW50LlxuICAgIGZ1bmN0aW9uIGFkZFN3aXBleSgkZWxlLCBzZXR0aW5ncykge1xuICAgICAgICBjb25zdCBzdGF0ZTogYW55ID0geyAnJEQnOiAwIH07XG4gICAgICAgIGNvbnN0IGJhc2VDb250ZXh0ID0ge1xuICAgICAgICAgICAgJ21heCc6IE1hdGgubWF4LFxuICAgICAgICAgICAgJ21pbic6IE1hdGgubWluLFxuICAgICAgICAgICAgJ2Ficyc6IE1hdGguYWJzXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCFfLmlzQXJyYXkoc2V0dGluZ3MuYW5pbWF0aW9uKSkge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gc2V0dGluZ3MuYW5pbWF0aW9uLnRhcmdldCB8fCAkZWxlO1xuICAgICAgICAgICAgY29uc3QgY3NzID0gc2V0dGluZ3MuYW5pbWF0aW9uLmNzcyB8fCBzZXR0aW5ncy5hbmltYXRpb247XG4gICAgICAgICAgICBkZWxldGUgY3NzWyRlbGVdO1xuICAgICAgICAgICAgc2V0dGluZ3MuYW5pbWF0aW9uID0gW3tcbiAgICAgICAgICAgICAgICAndGFyZ2V0JzogdGFyZ2V0LFxuICAgICAgICAgICAgICAgICdjc3MnOiBjc3NcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9XG4gICAgICAgIF8uZm9yRWFjaChzZXR0aW5ncy5hbmltYXRpb24sIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICBhLmNzcyA9IF8ubWFwVmFsdWVzKGEuY3NzLCBmdW5jdGlvbiAodiwgaykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlKHYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzZXR0aW5nc09iaiA9IG5ldyBTZXR0aW5nc1Byb3BlcnR5KCk7XG4gICAgICAgIHNldHRpbmdzT2JqLnNldFNldHRpbmdzKHNldHRpbmdzLCAkZWxlKTtcbiAgICAgICAgJGVsZS5zd2lwZXkoe1xuICAgICAgICAgICAgJ2RpcmVjdGlvbic6IHNldHRpbmdzLmRpcmVjdGlvbixcbiAgICAgICAgICAgICd0aHJlc2hvbGQnOiBzZXR0aW5ncy50aHJlc2hvbGQsXG4gICAgICAgICAgICAnYmluZEV2ZW50cyc6IHNldHRpbmdzLmJpbmRFdmVudHMsXG4gICAgICAgICAgICAndGFyZ2V0Jzogc2V0dGluZ3MudGFyZ2V0LFxuICAgICAgICAgICAgJ29uU3dpcGVTdGFydCc6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNkO1xuICAgICAgICAgICAgICAgIHN0YXRlLiRkID0gMDtcblxuICAgICAgICAgICAgICAgIHN0YXRlLmJvdW5kcyA9IGNhbGN1bGF0ZUJvdW5kcyh0aGlzLCBzZXR0aW5ncywgW2UsIGRhdGEubGVuZ3RoXSk7XG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHN0YXRlLmJvdW5kcy5jZW50ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLiREID0gc3RhdGUuYm91bmRzLmNlbnRlcjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS4kRCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2QgPSBzdGF0ZS4kRCArIGRhdGEubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgLy8gYnkgZGVmYXVsdCBzdHJpY3QgaXMgdHJ1ZVxuICAgICAgICAgICAgICAgIHN0YXRlLmJvdW5kcy5zdHJpY3RMb3dlciA9ICEoc3RhdGUuYm91bmRzLnN0cmljdCA9PT0gZmFsc2UgfHwgc3RhdGUuYm91bmRzLnN0cmljdExvd2VyID09PSBmYWxzZSk7XG4gICAgICAgICAgICAgICAgc3RhdGUuYm91bmRzLnN0cmljdFVwcGVyID0gIShzdGF0ZS5ib3VuZHMuc3RyaWN0ID09PSBmYWxzZSB8fCBzdGF0ZS5ib3VuZHMuc3RyaWN0VXBwZXIgPT09IGZhbHNlKTtcblxuICAgICAgICAgICAgICAgIGlmICghc2V0dGluZ3MuZW5hYmxlR2VzdHVyZXMoKSB8fFxuICAgICAgICAgICAgICAgICAgICAoc3RhdGUuYm91bmRzLnN0cmljdExvd2VyICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAoKF8uaXNVbmRlZmluZWQoc3RhdGUuYm91bmRzLmxvd2VyKSAmJiBkYXRhLmxlbmd0aCA8IDApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFfLmlzVW5kZWZpbmVkKHN0YXRlLmJvdW5kcy5sb3dlcikgJiYgc3RhdGUuYm91bmRzLmxvd2VyID4gY2QpKSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKHN0YXRlLmJvdW5kcy5zdHJpY3RVcHBlciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKChfLmlzVW5kZWZpbmVkKHN0YXRlLmJvdW5kcy51cHBlcikgJiYgZGF0YS5sZW5ndGggPiAwKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghXy5pc1VuZGVmaW5lZChzdGF0ZS5ib3VuZHMudXBwZXIpICYmIHN0YXRlLmJvdW5kcy51cHBlciA8IGNkKSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RhdGUudmMgPSBWZWxvY2l0eUNvbXB1dGF0b3IoKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5jb250ZXh0ID0gXy5leHRlbmQoYmFzZUNvbnRleHQsIGdldE9iamVjdChzZXR0aW5ncy5jb250ZXh0LCAkZWxlKSk7XG4gICAgICAgICAgICAgICAgc3RhdGUubG9jYWxTdGF0ZSA9IF8uZXh0ZW5kKHt9LCBzdGF0ZS5jb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIHJldHJpZXZlVGFyZ2V0cyhzZXR0aW5ncyk7XG5cbiAgICAgICAgICAgICAgICBfLmZvckVhY2goc2V0dGluZ3MuYW5pbWF0aW9uLCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYS50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEudGFyZ2V0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RyYW5zaXRpb24nOiAnbm9uZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ29uU3dpcGUnOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsU3RhdGUgPSBzdGF0ZS5sb2NhbFN0YXRlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkID0gc3RhdGUuJEQgKyBkYXRhLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIGxvY2FsU3RhdGUuJGQgPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsb2NhbFN0YXRlLiREID0gc3RhdGUuJEQ7XG5cbiAgICAgICAgICAgICAgICAvLyBvbmx5IGluIHN0cmljdCBtb2RlLCByZXN0cmljdCB0aGUgJGQgdmFsdWUgdG8gZ28gYmV5b25kIHRoZSBib3VuZHMuXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmJvdW5kcy5zdHJpY3RMb3dlciAmJiAhXy5pc1VuZGVmaW5lZChzdGF0ZS5ib3VuZHMubG93ZXIpICYmIHN0YXRlLmJvdW5kcy5sb3dlciA+IGNkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RhdGUuJGQgPSAoc3RhdGUuYm91bmRzLmxvd2VyIC0gc3RhdGUuJEQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGUuYm91bmRzLnN0cmljdFVwcGVyICYmICFfLmlzVW5kZWZpbmVkKHN0YXRlLmJvdW5kcy51cHBlcikgJiYgc3RhdGUuYm91bmRzLnVwcGVyIDwgY2QpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdGF0ZS4kZCA9IChzdGF0ZS5ib3VuZHMudXBwZXIgLSBzdGF0ZS4kRCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3RhdGUudmMuYWRkRGlzdGFuY2UoZGF0YS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChzZXR0aW5ncy5hbmltYXRpb24sIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhLnRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGEudGFyZ2V0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhLnRhcmdldC5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RhdGUuJGkgPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhfLm1hcFZhbHVlcyhhLmNzcywgZnVuY3Rpb24gKHYsIGspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2KGxvY2FsU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RhdGUuJGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEudGFyZ2V0LmNzcyhfLm1hcFZhbHVlcyhhLmNzcywgZnVuY3Rpb24gKHYsIGspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHYobG9jYWxTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ29uU3dpcGVFbmQnOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsU3RhdGUgPSBzdGF0ZS5sb2NhbFN0YXRlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkID0gc3RhdGUuJEQgKyBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gc3RhdGUudmMuZ2V0VmVsb2NpdHkoKTtcbiAgICAgICAgICAgICAgICBsZXQgdGltZTtcblxuICAgICAgICAgICAgICAgIGxvY2FsU3RhdGUuJGQgPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsb2NhbFN0YXRlLiREID0gc3RhdGUuJEQ7XG5cbiAgICAgICAgICAgICAgICAvLyBhc3NpZ25zIHVwcGVyIG9yIGxvd2VyIGJvdW5kcyB0byAkRFxuICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChzdGF0ZS5ib3VuZHMubG93ZXIpICYmIHYgPD0gMCAmJiBzdGF0ZS4kRCA+IGNkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RhdGUuJEQgPSBzdGF0ZS5ib3VuZHMubG93ZXI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghXy5pc1VuZGVmaW5lZChzdGF0ZS5ib3VuZHMudXBwZXIpICYmIHYgPj0gMCAmJiBzdGF0ZS4kRCA8IGNkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RhdGUuJEQgPSBzdGF0ZS5ib3VuZHMudXBwZXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbG9jYWxTdGF0ZS4kZCA9IDA7XG4gICAgICAgICAgICAgICAgbG9jYWxTdGF0ZS5ib3VuZHMgPSBzdGF0ZS5ib3VuZHM7XG4gICAgICAgICAgICAgICAgc3RhdGUuJEQgPSBsb2NhbFN0YXRlLiREO1xuICAgICAgICAgICAgICAgIHRpbWUgPSBzdGF0ZS52Yy5nZXRUaW1lKGxvY2FsU3RhdGUuJEQgLSBjZCk7XG5cbiAgICAgICAgICAgICAgICBhbmltYXRlKHNldHRpbmdzLCBsb2NhbFN0YXRlLCB0aW1lLCAkZWxlLCBjZCwgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZHMgdGhlIHN3aXBlIGZ1bmN0aW9uYWxpdHkgb24gdGhlIGVsZW1lbnRcbiAgICAkLmZuLnN3aXBlQW5pbWF0aW9uID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgICAgIGlmIChtZXRob2RzW3NldHRpbmdzXSkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHNbc2V0dGluZ3NdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFkZFN3aXBleSgkKHRoaXMpLCAkLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgJ2RpcmVjdGlvbic6ICQuZm4uc3dpcGV5LkRJUkVDVElPTlMuSE9SSVpPTlRBTCxcbiAgICAgICAgICAgICAgICAndGFyZ2V0JzogJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAvLyAnc3RlcCc6IDEwLFxuICAgICAgICAgICAgICAgICd0aHJlc2hvbGQnOiAzMCxcbiAgICAgICAgICAgICAgICAnZW5hYmxlR2VzdHVyZXMnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2JpbmRFdmVudHMnOiBbJ3RvdWNoJ10sXG4gICAgICAgICAgICAgICAgJ2JvdW5kcyc6IHt9LFxuICAgICAgICAgICAgICAgICdjb250ZXh0Jzoge30sXG4gICAgICAgICAgICAgICAgJ2FuaW1hdGlvbic6IHt9LFxuICAgICAgICAgICAgICAgICdvbkxvd2VyJzogJC5ub29wLFxuICAgICAgICAgICAgICAgICdvblVwcGVyJzogJC5ub29wLFxuICAgICAgICAgICAgICAgICdvbkFuaW1hdGlvbic6ICQubm9vcFxuICAgICAgICAgICAgfSwgc2V0dGluZ3MpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG59KShqUXVlcnkpO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==
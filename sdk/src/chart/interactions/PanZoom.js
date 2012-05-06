/**
 * @class Ext.chart.interactions.PanZoom
 * @extends Ext.chart.interactions.Abstract
 *
 * The PanZoom interaction allows the user to navigate the data for one or more chart
 * axes by panning and/or zooming. Navigation can be limited to particular axes. Zooming is
 * performed by pinching on the chart or axis area; panning is performed by single-touch dragging.
 *
 * For devices which do not support multiple-touch events, zooming can not be done via pinch
 * gestures; in this case the interaction will allow the user to perform both zooming and
 * panning using the same single-touch drag gesture. Tapping the chart will switch between
 * the two modes, {@link #modeIndicatorDuration briefly displaying a graphical indicator}
 * showing whether it is in zoom or pan mode.
 *
 * You can attach this interaction to a chart by including an entry in the chart's
 * {@link Ext.chart.Chart#interactions interactions} config with the `panzoom` type:
 *
 *     new Ext.chart.Chart({
 *         renderTo: Ext.getBody(),
 *         width: 800,
 *         height: 600,
 *         store: store1,
 *         axes: [ ...some axes options... ],
 *         series: [ ...some series options... ],
 *         interactions: [{
 *             type: 'panzoom',
 *             axes: {
 *                 left: {
 *                     maxZoom: 5,
 *                     startZoom: 2
 *                 },
 *                 bottom: {
 *                     maxZoom: 2
 *                 }
 *             }
 *         }]
 *     });
 *
 * The configuration object for the `panzoom` interaction type should specify which axes
 * will be made navigable via the `axes` config. See the {@link #axes} config documentation
 * for details on the allowed formats. If the `axes` config is not specified, it will default
 * to making all axes navigable with the default axis options.
 *
 * @author Jason Johnston <jason@sencha.com>
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.chart.interactions.PanZoom = Ext.extend(Ext.chart.interactions.Abstract, {

    /**
     * @cfg {Object/Array} axes
     * Specifies which axes should be made navigable. The config value can take the following formats:
     *
     * - An Object whose keys correspond to the {@link Ext.chart.axis.Axis#position position} of each
     *   axis that should be made navigable. Each key's value can either be an Object with further
     *   configuration options for each axis or simply `true` for a default set of options.
     *       {
     *           type: 'panzoom',
     *           axes: {
     *               left: {
     *                   maxZoom: 5,
     *                   allowPan: false
     *               },
     *               bottom: true
     *           }
     *       }
     *
     *   If using the full Object form, the following options can be specified for each axis:
     *
     *   - minZoom (Number) A minimum zoom level for the axis. Defaults to `1` which is its natural size.
     *   - maxZoom (Number) A maximum zoom level for the axis. Defaults to `10`.
     *   - startZoom (Number) A starting zoom level for the axis. Defaults to `1`.
     *   - allowZoom (Boolean) Whether zooming is allowed for the axis. Defaults to `true`.
     *   - allowPan (Boolean) Whether panning is allowed for the axis. Defaults to `true`.
     *   - startPan (Boolean) A starting panning offset for the axis. Defaults to `0`.
     *
     * - An Array of strings, each one corresponding to the {@link Ext.chart.axis.Axis#position position}
     *   of an axis that should be made navigable. The default options will be used for each named axis.
     *
     *       {
     *           type: 'panzoom',
     *           axes: ['left', 'bottom']
     *       }
     *
     * If the `axes` config is not specified, it will default to making all axes navigable with the
     * default axis options.
     */
    axes: {
        top: {},
        right: {},
        bottom: {},
        left: {}
    },

    /**
     * @cfg {Boolean} showOverflowArrows
     * If `true`, arrows will be conditionally shown at either end of each axis to indicate that the
     * axis is overflowing and can therefore be panned in that direction. Set this to `false` to
     * prevent the arrows from being displayed. Defaults to `true`.
     */
    showOverflowArrows: true,

    /**
     * @cfg {Object} overflowArrowOptions
     * A set of optional overrides for the overflow arrow sprites' options. Only relevant when
     * {@link #showOverflowArrows} is `true`.
     */

    gesture: 'pinch',
    panGesture: 'drag',

    constructor: function(config) {
        var me = this,
            interactionsNS = Ext.chart.interactions,
            zoomModeCls = Ext.baseCSSPrefix + 'zooming',
            axesConfig;

        interactionsNS.PanZoom.superclass.constructor.call(me, config);
        interactionsNS.DelayedSync.prototype.constructor.call(me, config);

        if (me.showOverflowArrows) {
            me.chart.on('redraw', me.updateAllOverflowArrows, me);
        }

        // Normalize the `axes` config
        axesConfig = me.axes;
        if (Ext.isArray(axesConfig)) {
            // array of axis names - translate to full object form
            me.axes = {};
            Ext.each(axesConfig, function(axis) {
                me.axes[axis] = {};
            });
        } else if (Ext.isObject(axesConfig)) {
            Ext.iterate(axesConfig, function(key, val) {
                // axis name with `true` value -> translate to object
                if (val === true) {
                    axesConfig[key] = {};
                }
            });
        }
        //<debug>
        else {
            Ext.Error.raise("Invalid value for panzoom interaction 'axes' config: '" + axesConfig + "'");
        }
        //</debug>
        
        // Add pan/zoom toggle button to toolbar if needed
        if (!me.isMultiTouch()) {
            me.zoomOnPanGesture = true; //default to zooming
            me.modeToggleButton = me.chart.getToolbar().add({
                cls: Ext.baseCSSPrefix + 'panzoom-toggle ' + zoomModeCls,
                iconCls: Ext.baseCSSPrefix + 'panzoom-toggle-icon',
                iconMask: true,
                handler: function() {
                    var button = this,
                        zoom = me.zoomOnPanGesture = !me.zoomOnPanGesture;
                    if (zoom) {
                        button.addCls(zoomModeCls);
                    } else {
                        button.removeCls(zoomModeCls);
                    }
                }
            });
        }
    },

    initEvents: function() {
        var me = this;
        Ext.chart.interactions.PanZoom.superclass.initEvents.call(me, arguments);
        me.addChartListener(me.gesture + 'start', me.onGestureStart, me);
        me.addChartListener(me.gesture + 'end', me.onGestureEnd, me);
        me.addChartListener(me.panGesture + 'start', me.onPanGestureStart, me);
        me.addChartListener(me.panGesture, me.onPanGesture, me);
        me.addChartListener(me.panGesture + 'end', me.onPanGestureEnd, me);
    },

    initializeDefaults: function(opt) {
        var me = this;

        if (!opt || opt.type == 'beforerender') {
            me.onGestureStart();
            me.onPanGestureStart();

            me.chart.axes.each(function(axis) {
                if (!me.axes[axis.position]) {
                    return;
                }

                var config = me.axes[axis.position],
                    startPan = config.startPan || 0,
                    startZoom = config.startZoom || 1;

                if (startPan != 0 || startZoom != 1) {
                    me.transformAxisBy(axis, startPan, startPan, startZoom, startZoom);
                }
            });
        }

        if (!opt || opt.type == 'afterrender') {
            me.onGestureEnd();
            me.onPanGestureEnd();
        }
    },

    getInteractiveAxes: function() {
        var me = this,
            axisConfigs = me.axes;
        return me.chart.axes.filterBy(function(axis) {
            return !!axisConfigs[axis.position];
        });
    },

    isEventOnAxis: function(e, axis) {
        // TODO right now this uses the current event position but really we want to only
        // use the gesture's start event. Pinch does not give that to us though.
        var util = Ext.util;
        return !util.Region.getRegion(axis.getSurface().el).isOutOfBound(util.Point.fromEvent(e));
    },

    sync: function() {
        var me = this,
            chart = me.chart,
            anim = chart.animate,
            axes = me.getInteractiveAxes();

        chart.animate = false;
        chart.endsLocked = true;

        axes.each(function(axis) {
            if (axis.hasFastTransform()) {
                axis.syncToFastTransform();

                // redraw the axis
                axis.drawAxis();
                axis.renderFrame();
            }
        });

        // sync all series bound to this axis
        me.getSeriesForAxes(axes).each(function(series) {
            if (series.hasFastTransform()) {
                series.syncToFastTransform();

                // redraw the series
                series.drawSeries();
                series.getSurface().renderFrame();
            }
        });

        chart.endsLocked = false;
        chart.animate = anim;
    },

    needsSync: function() {
        return !!this.getInteractiveAxes().findBy(function(axis) {
            return axis.hasFastTransform();
        });
    },

    transformAxisBy: function(axis, panX, panY, zoomX, zoomY) {
        var me = this,
            config = me.axes[axis.position],
            minZoom = config.minZoom || 1,
            maxZoom = config.maxZoom || 4,
            isNumber = Ext.isNumber,
            length = axis.length,
            isSide = axis.isSide(),
            pan = isSide ? panY : panX,
        zoom = isSide ? zoomY : zoomX;

        function doTransform(target) {
            var matrix = target.getTransformMatrix().clone(),
                currentZoom, inverse, inset;

            if (pan !== 0) {
                matrix.translate(isSide ? 0 : pan, isSide ? pan : 0);
            }

            if (zoom !== 1) {
                // constrain to minZoom/maxZoom zoom
                currentZoom = matrix.get(+isSide, +isSide);
                if (isNumber(minZoom)) {
                    zoom = Math.max(zoom, minZoom / currentZoom);
                }
                if (isNumber(maxZoom)) {
                    zoom = Math.min(zoom, maxZoom / currentZoom);
                }

                // use the matrix's inverse to find the scale origin that lines up with the middle of the axis
                inverse = matrix.invert();
                matrix.scale(
                isSide ? 1 : zoom, isSide ? zoom : 1, inverse.x(length / 2, 0), inverse.y(0, length / 2));
            }

            // constrain pan
            inset = matrix[isSide ? 'y' : 'x'](0, 0);
            if (inset > 0) {
                matrix.translate(isSide ? 0 : -inset, isSide ? -inset : 0);
            }
            inset = length - matrix[isSide ? 'y' : 'x'](length, length);
            if (inset > 0) {
                matrix.translate(isSide ? 0 : inset, isSide ? inset : 0);
            }

            target.setTransformMatrixFast(matrix);
        }

        doTransform(axis);
        axis.getBoundSeries().each(doTransform);

        if (me.showOverflowArrows) {
            me.updateAxisOverflowArrows(axis);
        }
    },

    getPannableAxes: function(e) {
        var me = this,
            axisConfigs = me.axes,
            config;
        return me.chart.axes.filterBy(function(axis) {
            config = axisConfigs[axis.position];
            return config && config.allowPan !== false && me.isEventOnAxis(e, axis);
        });
    },

    panBy: function(axes, x, y) {
        axes.each(function(axis) {
            this.transformAxisBy(axis, x, y, 1, 1);
        },
        this);
    },

    onPanGestureStart: function(e) {
        if (!e || !e.touches || e.touches.length < 2) { //Limit drags to single touch
            var me = this;
            me.cancelSync();
            if (me.zoomOnPanGesture) {
                me.onGestureStart(e);
            }
        }
    },

    onPanGesture: function(e) {
        if (!e.touches || e.touches.length < 2) { //Limit drags to single touch
            var me = this;
            if (me.zoomOnPanGesture) {
                me.zoomBy(
                me.getZoomableAxes(e), (e.previousX + e.previousDeltaX) / e.previousX, e.previousY / (e.previousY + e.previousDeltaY));
            } else {
                me.panBy(me.getPannableAxes(e), e.previousDeltaX, e.previousDeltaY);
            }
        }
    },

    onPanGestureEnd: function(e) {
        var me = this;
        if (me.zoomOnPanGesture) {
            me.onGestureEnd(e);
        } else {
            me.delaySync();
        }
    },

    getSeriesForAxes: function(axes) {
        var series = new Ext.util.MixedCollection(false, function(s) {
            return s.seriesId;
        });
        axes.each(function(axis) {
            series.addAll(axis.getBoundSeries().items);
        });
        return series;
    },

    getZoomableAxes: function(e) {
        var me = this,
            axisConfigs = me.axes,
            config;
        return me.chart.axes.filterBy(function(axis) {
            config = axisConfigs[axis.position];
            return config && config.allowZoom !== false && (!e || me.isEventOnAxis(e, axis));
        });
    },

    zoomBy: function(axes, zoomX, zoomY) {
        axes.each(function(axis) {
            this.transformAxisBy(axis, 0, 0, zoomX, zoomY);
        },
        this);
    },

    onGestureStart: function(e) {
        var me = this;
        me.cancelSync();

        // Hide axis labels while zooming
        me.getZoomableAxes(e).each(function(axis) {
            axis.hideLabels();
            axis.getLabelSurface().renderFrame();
        });
    },

    onGesture: function(e) {
        var me = this,
            abs = Math.abs,
            xDistance = abs(e.secondPageX - e.firstPageX),
            yDistance = abs(e.secondPageY - e.firstPageY),
            lastDistances = me.lastZoomDistances || [xDistance, yDistance],
            zoomX = xDistance < 30 ? 1 : xDistance / (lastDistances[0] || xDistance),
        zoomY = yDistance < 30 ? 1 : yDistance / (lastDistances[1] || yDistance);
        me.zoomBy(me.getZoomableAxes(e), zoomX, zoomY);
        me.lastZoomDistances = [xDistance, yDistance];
    },

    onGestureEnd: function(e) {
        var me = this;

        // If there is no transform, unhide the axis tick labels
        me.getZoomableAxes(e).each(function(axis) {
            if (!axis.hasFastTransform()) {
                axis.drawLabel();
                axis.getLabelSurface().renderFrame();
            }
        });

        me.delaySync();
        delete me.lastZoomDistances;
    },

    getOverflowArrow: function(axis, direction, opts) {
        var me = this,
            axisPos = axis.position,
            allIndicators = me.overflowIndicators || (me.overflowIndicators = {}),
            axisIndicators = allIndicators[axisPos] || (allIndicators[axisPos] = {});
        return axisIndicators[direction] || (
        axisIndicators[direction] = Ext.chart.Shape.arrow(me.chart.getEventsSurface(), opts));
    },

    updateAxisOverflowArrows: function(axis) {
        var me = this,
            isSide = axis.isSide(),
            axisPos = axis.position,
            allowPan = me.axes[axisPos].allowPan !== false,
            length = axis.length,
            chart = me.chart,
            bbox = chart.chartBBox,
            matrix = axis.getTransformMatrix(),
            spriteOpts = Ext.apply({
                hidden: true,
                radius: 5,
                opacity: 0.3,
                fill: axis.style.stroke
            }, me.overflowArrowOptions),
            math = Math,
            ceil = math.ceil,
            floor = math.floor,
            upSprite = me.getOverflowArrow(axis, 'up', spriteOpts),
            downSprite = me.getOverflowArrow(axis, 'down', spriteOpts),
            path;

        if (allowPan && (isSide ? ceil(matrix.y(0, 0)) < 0 : floor(matrix.x(length, 0)) > length)) {
            // Top
            if (isSide) {
                path = ['M', bbox.x, bbox.y, 'l', bbox.width / 2, 0, 0, 5, -10, 10, 20, 0, -10, -10, 0, -5, bbox.width / 2, 0, 0, 20, -bbox.width, 0, 'z'].join(',');
            }
            // Right
            else {
                path = ['M', bbox.x + bbox.width, bbox.y, 'l', 0, bbox.height / 2, -5, 0, -10, -10, 0, 20, 10, -10, 5, 0, 0, bbox.height / 2, -20, 0, 0, -bbox.height, 'z'].join(',');
            }
            upSprite.setAttributes({
                hidden: false,
                path: path
            });
        } else {
            upSprite.hide();
        }

        if (allowPan && (isSide ? floor(matrix.y(0, length)) > length : ceil(matrix.x(0, 0)) < 0)) {
            // Bottom
            if (isSide) {
                path = ['M', bbox.x, bbox.y + bbox.height, 'l', bbox.width / 2, 0, 0, -5, -10, -10, 20, 0, -10, 10, 0, 5, bbox.width / 2, 0, 0, -20, -bbox.width, 0, 'z'].join(',');
            }
            // Left
            else {
                path = ['M', bbox.x, bbox.y, 'l', 0, bbox.height/ 2, 5, 0, 10, -10, 0, 20, -10, -10, -5, 0, 0, bbox.height / 2, 20, 0, 0, -bbox.height, 'z'].join(',');
            }
            downSprite.setAttributes({
                hidden: false,
                path: path
            });
        } else {
            downSprite.hide();
        }

        if (upSprite.dirtyTransform || upSprite.dirtyHidden || downSprite.dirtyTransform || downSprite.dirtyHidden) {
            me.chart.getEventsSurface().renderFrame();
        }
    },

    updateAllOverflowArrows: function() {
        var me = this;
        me.getInteractiveAxes().each(me.updateAxisOverflowArrows, me);
    }
});

Ext.applyIf(Ext.chart.interactions.PanZoom.prototype, Ext.chart.interactions.DelayedSync.prototype);

Ext.chart.interactions.Manager.registerType('panzoom', Ext.chart.interactions.PanZoom);

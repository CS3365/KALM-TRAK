/**
 * @class Ext.chart.Legend
 *
 * Defines a legend for a chart's series.
 * The 'chart' member must be set prior to rendering.
 * The legend class displays a list of legend items each of them related with a
 * series being rendered. In order to render the legend item of the proper series
 * the series configuration object must have {@link Ext.chart.Series#showInLegend showInLegend}
 * set to true.
 *
 * The legend configuration object accepts a {@link #position} as parameter, which allows
 * control over where the legend appears in relation to the chart. The position can be
 * confiured with different values for portrait vs. landscape orientations. Also, the {@link #dock}
 * config can be used to hide the legend in a sheet docked to one of the sides.
 *
 * Full example:
    <pre><code>
    var store = new Ext.data.JsonStore({
        fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5'],
        data: [
            {'name':'metric one', 'data1':10, 'data2':12, 'data3':14, 'data4':8, 'data5':13},
            {'name':'metric two', 'data1':7, 'data2':8, 'data3':16, 'data4':10, 'data5':3},
            {'name':'metric three', 'data1':5, 'data2':2, 'data3':14, 'data4':12, 'data5':7},
            {'name':'metric four', 'data1':2, 'data2':14, 'data3':6, 'data4':1, 'data5':23},
            {'name':'metric five', 'data1':27, 'data2':38, 'data3':36, 'data4':13, 'data5':33}
        ]
    });

    new Ext.chart.Chart({
        renderTo: Ext.getBody(),
        width: 500,
        height: 300,
        animate: true,
        store: store,
        shadow: true,
        theme: 'Category1',
        legend: {
            position: 'top'
        },
         axes: [{
                type: 'Numeric',
                grid: true,
                position: 'left',
                fields: ['data1', 'data2', 'data3', 'data4', 'data5'],
                title: 'Sample Values',
                grid: {
                    odd: {
                        opacity: 1,
                        fill: '#ddd',
                        stroke: '#bbb',
                        'stroke-width': 1
                    }
                },
                minimum: 0,
                adjustMinimumByMajorUnit: 0
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['name'],
                title: 'Sample Metrics',
                grid: true,
                label: {
                    rotate: {
                        degrees: 315
                    }
                }
        }],
        series: [{
            type: 'area',
            highlight: false,
            axis: 'left',
            xField: 'name',
            yField: ['data1', 'data2', 'data3', 'data4', 'data5'],
            style: {
                opacity: 0.93
            }
        }]
    });
    </code></pre>
 *
 * @constructor
 */
Ext.chart.Legend = Ext.extend(Ext.util.Observable, {

    /**
     * @cfg {Boolean} visible
     * Whether or not the legend should be displayed.
     */
    visible: true,

    /**
     * @cfg {String} position
     * The position of the legend in relation to the chart. Can be one of:
     *
     * -  "top" - positions the legend centered at the top of the chart
     * -  "bottom" - positions the legend centered at the bottom of the chart
     * -  "left" - positions the legend centered on the left side of the chart
     * -  "right" - positions the legend centered on the right side of the chart
     * -  an Object with numeric properties `x` and `y`, and boolean property `vertical` - displays the legend
     *    floating on top of the chart at the given x/y coordinates. If `vertical:true` the legend items will
     *    be arranged stacked vertically, otherwise they will be arranged side-by-side. If {@link #dock} is
     *    set to `true` then this position config will be ignored and will dock to the bottom.
     *
     * In addition, you can specify different legend alignments based on the orientation of the browser viewport,
     * for instance you might want to put the legend on the right in landscape orientation but on the bottom in
     * portrait orientation. To achieve this, you can set the `position` config to an Object with `portrait` and
     * `landscape` properties, and set the value of those properties to one of the recognized value types described
     * above. For example, the following config will put the legend on the right in landscape but float it on top
     * of the chart at position 10,10 in portrait:
     *
     *     legend: {
     *         position: {
     *             landscape: 'right',
     *             portrait: {
     *                 x: 10,
     *                 y: 10,
     *                 vertical: true
     *             }
     *         }
     *     }
     */
    position: 'bottom',

    /**
     * @cfg {Boolean} dock
     * If set to `true`, then rather than rendering within the chart area the legend will be docked to the
     * {@link #position configured edge position} within a {@link Ext.Sheet}. The sheet will be initially
     * hidden and can be opened by tapping on a tab along the configured edge. This prevents screen real
     * estate from being taken up by the legend, which is especially important on small screen devices.
     *
     * Defaults to `true` for phone-sized screens, `false` for larger screens.
     */
    dock: Ext.is.Phone,

    /**
     * @cfg {Number} doubleTapThreshold
     * The duration in milliseconds in which two consecutive taps will be considered a doubletap.
     * Defaults to `250`.
     */
    doubleTapThreshold: 250,

    /**
     * @constructor
     * @param {Object} config
     */
    constructor: function(config) {
        var me = this,
            chart = config.chart,
            chartEl = chart.el,
            button, sheet, view, transitions, sheetAnim;

        me.addEvents(
            /**
             * @event combine
             * Fired when two legend items are combined together via drag-drop.
             * @param {Ext.chart.Legend} legend
             * @param {Ext.chart.series.Series} series The series owning the items being combined
             * @param {Number} index1 The index of the first legend item
             * @param {Number} index2 The index of the second legend item
             */
            'combine',

            /**
             * @event split
             * Fired when a previously-combined legend item is split into its original constituent items.
             * @param {Ext.chart.Legend} legend
             * @param {Ext.chart.series.Series} series The series owning the item being split
             * @param {Number} index The index of the legend item being split
             */
            'split'
        );

        Ext.chart.Legend.superclass.constructor.call(me, config);

        view = me.getView();
        if (me.dock) {
            // Legend is docked; create the sheet and trigger button
            button = me.button = chart.getToolbar().add({
                showAnimation: 'fade',
                cls: Ext.baseCSSPrefix + 'legend-button',
                iconCls: Ext.baseCSSPrefix + 'legend-button-icon',
                iconMask: true,
                handler: function() {
                    me.sheet.show();
                }
            });
            button.show();

            transitions = {
                bottom : 'up',
                top    : 'down',
                right  : 'left',
                left   : 'right'
            };

            sheetAnim = {
                type: 'slide',
                duration: 150,
                direction: transitions[me.getPosition()]
            };

            sheet = me.sheet = new Ext.Sheet({
                enter: me.getPosition(),
                stretchY: true,
                stretchX: true,
                ui: 'legend',
                hideOnMaskTap: true,
                enterAnimation: sheetAnim,
                exitAnimation: sheetAnim,
                width: 200,
                height: 260,
                renderTo: chartEl,
                layout: 'fit',
                items: view,
                listeners: {
                    // If user swipes in direction sheet came from, close it
                    // Only works for side-positioned labels (otherwise could just be scrolling legend list)
                    swipe: {
                        element: 'el',
                        fn: function(gesture){
                            if (gesture.direction == me.getPosition()) {
                                me.sheet.hide();
                            }
                        }
                    }
                }
            });
        } else {
            // Not docked; render view directly into chart container
            view.render(chartEl);
        }

        if (me.isDisplayed()) {
            me.show();
        }
    },

    /**
     * Retrieves the view component for this legend, creating it first if needed.
     * @return {@link Ext.chart.Legend.View}
     */
    getView: function() {
        var me = this;
        return me.view || (me.view = new Ext.chart.Legend.View({
            legend: me,
            floating: !me.dock
        }));
    },

    /**
     * @private Determine whether the legend should be displayed. Looks at the legend's 'visible' config,
     * and also the 'showInLegend' config for each of the series.
     * @return {Boolean}
     */
    isDisplayed: function() {
        return this.visible && this.chart.series.findIndex('showInLegend', true) !== -1;
    },

    /**
     * Returns whether the legend is configured with orientation-specific positions.
     * @return {Boolean}
     */
    isOrientationSpecific: function() {
        var position = this.position;
        return (Ext.isObject(position) && 'portrait' in position);
    },

    /**
     * Get the target position of the legend, after resolving any orientation-specific configs.
     * In most cases this method should be used rather than reading the `position` property directly.
     * @return {String/Object} The position config value
     */
    getPosition: function() {
        var me = this,
            position = me.position;
        // Grab orientation-specific config if specified
        if (me.isOrientationSpecific()) {
            position = position[Ext.getOrientation()];
        }
        // If legend is docked, default non-String values to 'bottom'
        if (me.dock && !Ext.isString(position)) {
            position = 'bottom';
        }
        return position;
    },

    /**
     * Returns whether the orientation of the legend items is vertical.
     * @return {Boolean} `true` if the legend items are to be arranged stacked vertically, `false` if they
     * are to be arranged side-by-side.
     */
    isVertical: function() {
        var position = this.getPosition();
        return this.dock || (Ext.isObject(position) ? position.vertical : "left|right|float".indexOf('' + position) !== -1);
    },

    /**
     * Update the legend component to match the current viewport orientation.
     */
    orient: function() {
        var me = this,
            sheet = me.sheet,
            position = me.getPosition(),
            orientation = Ext.getOrientation(),
            auto = 'auto';

        me.getView().orient();

        if (me.lastOrientation !== orientation) {
            if (sheet) {
                sheet.hide();
                sheet.enter = sheet.exit = position;
                sheet.setSize(null, null);
                sheet.orient();
            }

            me.lastOrientation = orientation;
        }
    },

    /**
     * @private Update the position of the legend if it is displayed and not docked.
     */
    updatePosition: function() {
        if (!this.dock) {
            var me = this,
                chart = me.chart,
                chartBBox = chart.chartBBox,
                insets = chart.insetPadding,
                isObject = Ext.isObject(insets),
                insetLeft = (isObject ? insets.left : insets) || 0,
                insetRight = (isObject ? insets.right : insets) || 0,
                insetBottom = (isObject ? insets.bottom : insets) || 0,
                insetTop = (isObject ? insets.top : insets) || 0,
                chartWidth = chart.curWidth,
                chartHeight = chart.curHeight,
                seriesWidth = chartBBox.width - (insetLeft + insetRight),
                seriesHeight = chartBBox.height - (insetTop + insetBottom),
                chartX = chartBBox.x + insetLeft,
                chartY = chartBBox.y + insetTop,
                isVertical = me.isVertical(),
                view = me.getView(),
                math = Math,
                mfloor = math.floor,
                mmin = math.min,
                mmax = math.max,
                x, y, legendWidth, legendHeight, maxWidth, maxHeight, position, undef;

            if (me.sheet) {
                return; //only set position if view is directly floated
            }

            if (me.isDisplayed()) {
                // Calculate the natural size
                view.show();
                view.setCalculatedSize(isVertical ? undef : null, isVertical ? null : undef); //clear fixed scroller length
                legendWidth = view.getWidth();
                legendHeight = view.getHeight();

                position = me.getPosition();
                if (Ext.isObject(position)) {
                    // Object with x/y properties: use them directly
                    x = position.x;
                    y = position.y;
                } else {
                    // Named positions - calculate x/y based on chart dimensions
                    switch(position) {
                        case "left":
                            x = insetLeft;
                            y = mfloor(chartY + seriesHeight / 2 - legendHeight / 2);
                            break;
                        case "right":
                            x = mfloor(chartWidth - legendWidth) - insetRight;
                            y = mfloor(chartY + seriesHeight / 2 - legendHeight / 2);
                            break;
                        case "top":
                            x = mfloor(chartX + seriesWidth / 2 - legendWidth / 2);
                            y = insetTop;
                            break;
                        default:
                            x = mfloor(chartX + seriesWidth / 2 - legendWidth / 2);
                            y = mfloor(chartHeight - legendHeight) - insetBottom;
                    }
                    x = mmax(x, insetLeft);
                    y = mmax(y, insetTop);
                }

                maxWidth = chartWidth - x - insetRight;
                maxHeight = chartHeight - y - insetBottom;

                view.setPosition(x, y);
                if (legendWidth > maxWidth || legendHeight > maxHeight) {
                    view.setCalculatedSize(mmin(legendWidth, maxWidth), mmin(legendHeight, maxHeight));
                }
            } else {
                view.hide();
            }
        }
    },

    /**
     * Calculate and return the number of pixels that should be reserved for the legend along
     * its edge. Only returns a non-zero value if the legend is positioned to one of the four
     * named edges, and if it is not {@link #dock docked}.
     */
    getInsetSize: function() {
        var me = this,
            pos = me.getPosition(),
            chartPadding = me.chart.insets,
            left = chartPadding.left,
            bottom = chartPadding.bottom,
            top = chartPadding.top,
            right = chartPadding.right,
            size = 0,
            view;

        if (!me.dock && me.isDisplayed()) {
            view = me.getView();
            view.show();
            if (pos === 'left' || pos === 'right') {
                size = view.getWidth() + left;
            }
            else if (pos === 'top' || pos === 'bottom') {
                size = view.getHeight() + top;
            }
        }
        return size;
    },

    /**
     * Shows the legend if it is currently hidden.
     */
    show: function() {
        (this.sheet || this.getView()).show();
    },

    /**
     * Hides the legend if it is currently shown.
     */
    hide: function() {
        (this.sheet || this.getView()).hide();
    },

    /**
     * @protected Fired when two legend items are combined via drag-drop in the legend view.
     * @param {Ext.chart.series.Series} series The series for the combined items
     * @param {Ext.chart.series.Series} index1 The series for the combined items
     * @param {Ext.chart.series.Series} index2 The series for the combined items
     */
    onCombine: function(series, index1, index2) {
        var me = this;
        series.combine(index1, index2);
        me.getView().updateStore();
        me.fireEvent('combine', me, series, index1, index2);
    },

    onSplit: function(series, index) {
        var me = this;
        series.split(index);
        me.getView().updateStore();
        me.fireEvent('split', me, series, index);
    },

    /**
     * Reset the legend back to its initial state before any user interactions.
     */
    reset: function() {
        this.getView().reset();
    }
});


/**
 * @class Ext.chart.Legend.View
 * @extends Ext.DataView
 *
 * A DataView specialized for displaying the legend items for a chart. This class is only
 * used internally by {@link Ext.chart.Legend} and should not need to be instantiated directly.
 */
Ext.chart.Legend.View = Ext.extend(Ext.DataView, {
    tpl: [
        '<ul class="' + Ext.baseCSSPrefix + 'legend-items">',
            '<tpl for=".">',
                '<li class="' + Ext.baseCSSPrefix + 'legend-item <tpl if="disabled">' + Ext.baseCSSPrefix + 'legend-inactive' + '</tpl>">',
                    '<span class="' + Ext.baseCSSPrefix + 'legend-item-marker" style="background-color:{markerColor};"></span>{label}',
                '</li>',
            '</tpl>',
        '</ul>'
    ],

    disableSelection: true,
    componentCls: Ext.baseCSSPrefix + 'legend',
    horizontalCls: Ext.baseCSSPrefix + 'legend-horizontal',
    inactiveItemCls: Ext.baseCSSPrefix + 'legend-inactive',
    itemSelector: '.' + Ext.baseCSSPrefix + 'legend-item',
    hideOnMaskTap: false,
    triggerEvent: 'tap',

    initComponent: function() {
        var me = this;
        me.createStore();
        Ext.chart.Legend.View.superclass.initComponent.call(me);
        me.on('refresh', me.updateDroppables, me);
    },

    initEvents: function() {
        var me = this;
        Ext.chart.Legend.View.superclass.initEvents.call(me);
        me.el.on('taphold', me.onTapHold, me, {delegate: me.itemSelector});
},

    /**
     * @private Fired when a legend item is tap-held. Initializes a draggable for the
     * held item.
     */
    onTapHold: function(e, target) {
        var me = this,
            draggable, record, seriesId, combinable;

        if (!Ext.fly(target).hasCls(me.inactiveItemCls)) {
            record = me.getRecord(target);
            seriesId = record.get('seriesId');
            combinable = me.store.findBy(function(record2) {
                return record2 !== record && record2.get('seriesId') === seriesId;
            });
            if (combinable > -1) {
                draggable = new Ext.util.Draggable(target, {
                    threshold: 0,
                    revert: true,
                    direction: me.legend.isVertical() ? 'vertical' : 'horizontal',
                    group: seriesId
                });

                draggable.on('dragend', me.onDragEnd, me);

                if (!draggable.dragging) {
                    draggable.onStart(e);
                }
            }
        }
    },

    /**
     * @private Updates the droppable objects for each list item. Should be called whenever
     * the list view is re-rendered.
     */
    updateDroppables: function() {
        var me = this,
            droppables = me.droppables,
            droppable;

        Ext.destroy(droppables);

        droppables = me.droppables = [];
        me.store.each(function(record) {
            droppable = new Ext.chart.Legend.Droppable(me.getNode(record), {
                group: record.get('seriesId'),
                disabled: record.get('disabled')
            });

            droppable.on('drop', me.onDrop, me);

            droppables.push(droppable);
        });
    },

    /**
     * @private Handles dropping one legend item on another.
     */
    onDrop: function(droppable, draggable) {
        var me = this,
            dragRecord = me.getRecord(draggable.el.dom),
            dropRecord = me.getRecord(droppable.el.dom);
        me.legend.onCombine(dragRecord.get('series'), dragRecord.get('index'), dropRecord.get('index'));
    },

    onDragEnd : function(draggable, e) {
        draggable.destroy();
    },

    /**
     * @private Create the internal data store for the view
     */
    createStore: function() {
        var me = this;

        me.store = new Ext.data.Store({
            fields: ['markerColor', 'label', 'series', 'seriesId', 'index', 'disabled'],
            data: me.getStoreData()
        });

        me.legend.chart.series.each(function(series) {
            series.on('titlechange', me.updateStore, me);
        });
    },

    /**
     * @private Create and return the JSON data for the legend's internal data store
     */
    getStoreData: function() {
        var data = [];

        this.legend.chart.series.each(function(series) {
            if (series.showInLegend) {
                Ext.each(series.getLegendLabels(), function(label, i) {
                    data.push({
                        label: label,
                        markerColor: series.getLegendColor(i),
                        series: series,
                        seriesId: Ext.id(series, 'legend-series-'),
                        index: i,
                        disabled: !series.visibleInLegend(i)
                    });
                });
            }
        });

        return data;
    },

    /**
     * Updates the internal store to match the current legend info supplied by all the series.
     */
    updateStore: function() {
        var store = this.store;
        store.suspendEvents(true);
        store.removeAll();
        store.add(this.getStoreData());
        store.resumeEvents();
    },

    /**
     * Update the legend component to match its current vertical/horizontal orientation
     */
    orient: function() {
        var me = this,
            legend = me.legend,
            horizontalCls = me.horizontalCls,
            isVertical = legend.isVertical(),
            orientation = Ext.getOrientation();

        if (isVertical) {
            me.removeCls(horizontalCls);
        } else {
            me.addCls(horizontalCls);
        }

        if (me.lastOrientation !== orientation) {
            me.setCalculatedSize(null, null);

            // Clean up things set by previous scroller -- Component#setScrollable should be fixed to do this
            me.scrollEl.setStyle({
                width: '',
                height: '',
                minWidth: '',
                minHeight: ''
            });
            Ext.iterate(me.scroller.scrollView.indicators, function(axis, indicator) {
                clearTimeout(indicator.hideTimer);
                Ext.destroy(indicator.el);
                delete indicator.el;
            }, this);
            me.scroller.destroy();

            // Re-init scrolling in the correct direction
            me.setScrollable(isVertical ? 'vertical' : 'horizontal');

            if (isVertical) {
                // Fix to the initial natural width so it doesn't expand when items are combined
                me.setCalculatedSize(me.getWidth());
            }
            if (me.scroller) {
                me.scroller.scrollTo({x: 0, y: 0});
            }
            me.lastOrientation = orientation;
        }
    },

    afterComponentLayout: function() {
        var me = this,
            scroller = me.scroller,
            innerSize, outerSize;

        Ext.chart.Legend.View.superclass.afterComponentLayout.apply(me, arguments);

        // Enable or disable scrolling depending on if the legend needs to be scrollable
        if (scroller) {
            innerSize = scroller.size;
            outerSize = scroller.containerBox;
            if (innerSize.width > outerSize.width || innerSize.height > outerSize.height) {
                scroller.enable();
            } else {
                scroller.disable();
            }
        }
    },

    refresh: function() {
        Ext.chart.Legend.View.superclass.refresh.apply(this, arguments);

        // Refresh may decrease the size of the scrollable content; we need to clear minWidth/Height
        // on the scrollEl so it doesn't force the floated view el to keep its old size.
        this.scrollEl.setStyle({
            minWidth: '',
            minHeight: ''
        });
    },

    onItemTap: function(item, i, e) {
        Ext.chart.Legend.View.superclass.onItemTap.apply(this, arguments);

        var me = this,
            record = me.store.getAt(i),
            series = record.get('series'),
            index = record.get('index'),
            threshold = me.legend.doubleTapThreshold,
            tapTask = me.tapTask || (me.tapTask = new Ext.util.DelayedTask()),
            now = +new Date();
        tapTask.cancel();

        // If the tapped item is a combined item, we need to distinguish between single and
        // double taps by waiting a bit; otherwise trigger the single tap handler immediately.
        if (series.isCombinedItem(index)) {
            if (now - (me.lastTapTime || 0) < threshold) {
                me.doItemDoubleTap(item, i);
            }
            else {
                tapTask.delay(threshold, me.doItemTap, me, [item, i]);
            }
            me.lastTapTime = now;
        } else {
            me.doItemTap(item, i);
        }
    },

    /**
     * @private
     * Handle single taps on legend items; toggles the corresponding series items on and off.
     */
    doItemTap: function(item, i) {
        var me = this,
            record = me.store.getAt(i),
            series = record.get('series'),
            index = record.get('index'),
            active = series.visibleInLegend(index),
            droppable = me.droppables[i],
            inactiveCls = me.inactiveItemCls;

        // Set the _index property on the series, this is used by the hideAll and
        // showAll methods for some series to know which legend item to hide/show.
        // This would be cleaner if it were just a passed argument.
        series._index = index;
        if (active) {
            series.hideAll();
            Ext.fly(item).addCls(inactiveCls);
            droppable.disable();
        } else {
            series.showAll();
            Ext.fly(item).removeCls(inactiveCls);
            droppable.enable();
        }

        // Flush rendering of affected surfaces
        series.getSurface().renderFrame();
        series.getOverlaySurface().renderFrame();
        me.legend.chart.axes.each(function(axis) {
            axis.renderFrame();
        });
    },

    /**
     * @private
     * Handle double-taps on legend items; splits items that are a result of item combination
     */
    doItemDoubleTap: function(item, i) {
        var me = this,
            record = me.getRecord(item);
        if (record) {
            me.legend.onSplit(record.get('series'), record.get('index'));
        }
    },

    /**
     * Reset the legend view back to its initial state before any user interactions.
     */
    reset: function() {
        var me = this;
        me.store.each(function(record) {
            var series = record.get('series');
            series._index = record.get('index');
            series.showAll();
            Ext.fly(me.getNode(record)).removeCls(me.inactiveItemCls);
            series.clearCombinations();
        });

        me.updateStore();
    }

});


/**
 * @private
 * @class Ext.chart.Legend.Droppable
 * @extends Ext.util.Droppable
 * Custom Droppable implementation for legend items. Only lets one legend item be active as a
 * drop target at once, using the center point of the draggable.
 */
Ext.chart.Legend.Droppable = Ext.extend(Ext.util.Droppable, {
    isDragOver : function(draggable) {
        var draggableRegion = draggable.region,
            round = Math.round,
            draggableCenter = {
                x: round((draggableRegion.right - draggableRegion.left) / 2 + draggableRegion.left) + 0.5,
                y: round((draggableRegion.bottom - draggableRegion.top) / 2 + draggableRegion.top) + 0.5
            };

        return draggable.el !== this.el && !this.region.isOutOfBound(draggableCenter);
    }
});

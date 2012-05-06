/**
 * @class Ext.chart.Chart
 * @extends Ext.draw.Component
 *
 * The Ext.chart package provides the capability to visualize data.
 * Each chart binds directly to an Ext.data.Store enabling automatic updates of the chart.
 * A chart configuration object has some overall styling options as well as an array of axes
 * and series. A chart instance example could look like:
 *
  <pre><code>
    new Ext.chart.Chart({
        renderTo: Ext.getBody(),
        width: 800,
        height: 600,
        animate: true,
        store: store1,
        shadow: true,
        theme: 'Category1',
        legend: {
            position: 'right'
        },
        axes: [ ...some axes options... ],
        series: [ ...some series options... ]
    });
  </code></pre>
 *
 * In this example we set the `width` and `height` of the chart, we decide whether our series are
 * animated or not and we select a store to be bound to the chart. We also turn on shadows for all series,
 * select a color theme `Category1` for coloring the series, set the legend to the right part of the chart and
 * then tell the chart to render itself in the body element of the document. For more information about the axes and
 * series configurations please check the documentation of each series (Line, Bar, Pie, etc).
 *
 * @xtype chart
 */

Ext.chart.Chart = Ext.extend(Ext.draw.Component, {

    /**
     * @property version Current Version of Touch Charts
     * @type {String}
     */
    version : '1.0.0',

    // @private
    viewBox: false,

    /**
     * @cfg {String} theme (optional) The name of the theme to be used. A theme defines the colors and
     * other visual displays of tick marks on axis, text, title text, line colors, marker colors and styles, etc.
     * Possible theme values are 'Base', 'Green', 'Sky', 'Red', 'Purple', 'Blue', 'Yellow' and also six category themes
     * 'Category1' to 'Category6'. Default value is 'Base'.
     */

    /**
     * @cfg {Boolean/Object} shadow (optional) true for the default shadow configuration (shadowOffsetX: 2, shadowOffsetY: 2, shadowBlur: 3, shadowColor: '#444')
     * or a standard shadow config object to be used for default chart shadows. Defaults to false.
     */

    /**
     * @cfg {Boolean/Object} animate (optional) true for the default animation (easing: 'ease' and duration: 500)
     * or a standard animation config object to be used for default chart animations. Defaults to false.
     */
    animate: false,

    /**
     * @cfg {Boolean/Object} legend (optional) true for the default legend display or a legend config object. Defaults to false.
     */
    legend: false,

    /**
     * @cfg {integer} insetPadding (optional) Set the amount of inset padding in pixels for the chart. Defaults to 10.
     */

    /**
     * @cfg {Object|Boolean} background (optional) Set the chart background. This can be a gradient object, image, or color.
     * Defaults to false for no background.
     *
     * For example, if `background` were to be a color we could set the object as
     *
     <pre><code>
        background: {
            //color string
            fill: '#ccc'
        }
     </code></pre>

     You can specify an image by using:

     <pre><code>
        background: {
            image: 'http://path.to.image/'
        }
     </code></pre>

     Also you can specify a gradient by using the gradient object syntax:

     <pre><code>
        background: {
            gradient: {
                id: 'gradientId',
                angle: 45,
                stops: {
                    0: {
                        color: '#555'
                    }
                    100: {
                        color: '#ddd'
                    }
                }
            }
        }
     </code></pre>
     */
    background: false,


    /**
     * @cfg {Array} interactions
     * Interactions are optional modules that can be plugged in to a chart to allow the user to interact
     * with the chart and its data in special ways. The `interactions` config takes an Array of Object
     * configurations, each one corresponding to a particular interaction class identified by a `type` property:
     *
     *     new Ext.chart.Chart({
     *         renderTo: Ext.getBody(),
     *         width: 800,
     *         height: 600,
     *         store: store1,
     *         axes: [ ...some axes options... ],
     *         series: [ ...some series options... ],
     *         interactions: [{
     *             type: 'interactiontype'
     *             // ...additional configs for the interaction...
     *         }]
     *     });
     *
     * When adding an interaction which uses only its default configuration (no extra properties other than `type`),
     * you can alternately specify only the type as a String rather than the full Object:
     *
     *     interactions: ['reset', 'rotate']
     *
     * The current supported interaction types include:
     *
     * - {@link Ext.chart.interactions.PanZoom panzoom} - allows pan and zoom of axes
     * - {@link Ext.chart.interactions.ItemCompare itemcompare} - allows selection and comparison of two data points
     * - {@link Ext.chart.interactions.ItemHighlight itemhighlight} - allows highlighting of series data points
     * - {@link Ext.chart.interactions.ItemInfo iteminfo} - allows displaying details of a data point in a popup panel
     * - {@link Ext.chart.interactions.PieGrouping piegrouping} - allows selection of multiple consecutive pie slices
     * - {@link Ext.chart.interactions.Rotate rotate} - allows rotation of pie and radar series
     * - {@link Ext.chart.interactions.Reset reset} - allows resetting of all user interactions to the default state
     * - {@link Ext.chart.interactions.ToggleStacked togglestacked} - allows toggling a multi-yField bar/column chart between stacked and grouped
     *
     * See the documentation for each of those interaction classes to see how they can be configured.
     *
     * Additional custom interactions can be registered with the {@link Ext.chart.interactions.Manager interaction manager}.
     */



    /**
     * @cfg {Object} toolbar
     * Optional configuration for this chart's toolbar. The toolbar docks itself to one side of the chart
     * and can contain buttons for handling certain actions. For example, if the chart legend is configured
     * with {@link Ext.chart.Legend#dock dock:true} then a button for bringing up the legend will be placed
     * in this toolbar. Custom may also be added to the toolbar if desired.
     *
     * See the {@link Ext.chart.Toolbar} docs for the recognized config properties.
     */

    /**
     * @private The z-indexes to use for the various surfaces
     */
    surfaceZIndexes: {
        main: 0,
        axis: 10,
        series: 20,
        overlay: 30,
        events: 40
    },

    /**
     * @cfg {Ext.data.Store} store
     * The store that supplies data to this chart.
     */

    /**
     * @cfg {[Ext.chart.series.Series]} series
     * Array of {@link Ext.chart.series.Series Series} instances or config objects. For example:
     *
     * series: [{
     *      type: 'column',
     *      axis: 'left',
     *      listeners: {
     *          'afterrender': function() {
     *              console('afterrender');
     *          }
     *      },
     *      xField: 'category',
     *      yField: 'data1'
     * }]
     */

    /**
     * @cfg {[Ext.chart.axis.Axis]} axes
     * Array of {@link Ext.chart.axis.Axis Axis} instances or config objects. For example:
     *
     * axes: [{
     *      type: 'Numeric',
     *      position: 'left',
     *      fields: ['data1'],
     *      title: 'Number of Hits',
     *      minimum: 0,
     *      //one minor tick between two major ticks
     *      minorTickSteps: 1
     * }, {
     *      type: 'Category',
     *      position: 'bottom',
     *      fields: ['name'],
     *      title: 'Month of the Year'
     * }]
     */


    constructor: function(config) {
        var me = this,
            defaultAnim;

        config = Ext.apply({}, config);
        if (me.gradients) {
            Ext.apply(config, { gradients: me.gradients });
        }
        if (me.background) {
            Ext.apply(config, { background: me.background });
        }
        if (config.animate) {
            defaultAnim = {
                easing: 'ease',
                duration: 500
            };
            if (Ext.isObject(config.animate)) {
                config.animate = Ext.applyIf(config.animate, defaultAnim);
            }
            else {
                config.animate = defaultAnim;
            }
        }
        Ext.chart.Chart.superclass.constructor.apply(this, [config]);
    },

    initComponent: function() {
        var me = this,
            axes, series, interactions;

        delete me.legend; //remove legend config from chart

        Ext.chart.Chart.superclass.initComponent.call(this);

        me.addEvents(
            /**
             * @event beforerefresh
             * Fires before a refresh to the chart data is called.  If the beforerefresh handler returns
             * <tt>false</tt> the {@link #refresh} action will be cancelled.
             * @param {Ext.chart.Chart} this
             */
            'beforerefresh',
            /**
             * @event refresh
             * Fires after the chart data has been refreshed.
             * @param {Ext.chart.Chart} this
             */
            'refresh',
            /**
             * @event redraw
             * Fires after the chart is redrawn
             * @param {Ext.chart.Chart} this
             */
            'redraw'

            /**
             * @event itemmousemove
             * Fires when the mouse is moved on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemmouseup
             * Fires when a mouseup event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemmousedown
             * Fires when a mousedown event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemmouseover
             * Fires when the mouse enters a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemmouseout
             * Fires when the mouse exits a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemclick
             * Fires when a click event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemdoubleclick
             * Fires when a doubleclick event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemtap
             * Fires when a tap event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemtapstart
             * Fires when a tapstart event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemtapend
             * Fires when a tapend event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemtapcancel
             * Fires when a tapcancel event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemtaphold
             * Fires when a taphold event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemdoubletap
             * Fires when a doubletap event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemsingletap
             * Fires when a singletap event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemtouchstart
             * Fires when a touchstart event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemtouchmove
             * Fires when a touchmove event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemtouchend
             * Fires when a touchend event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemdragstart
             * Fires when a dragstart event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemdrag
             * Fires when a drag event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemdragend
             * Fires when a dragend event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itempinchstart
             * Fires when a pinchstart event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itempinch
             * Fires when a pinch event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itempinchend
             * Fires when a pinchend event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
            /**
             * @event itemswipe
             * Fires when a swipe event occurs on a series item.
             * @param {Ext.chart.series.Series} series
             * @param {Object} item
             * @param {Event} event
             */
        );

        // Borrow events from Series/ItemEvents so they can bubble up to the chart (doc'd above):
        me.addEvents.apply(me, Ext.chart.series.ItemEvents.itemEventNames);

        Ext.applyIf(me, {
            zoom: {
                width: 1,
                height: 1,
                x: 0,
                y: 0
            }
        });
        me.maxGutter = [0, 0];
        axes = me.axes;
        me.on('activate', me.onActivate, me);
        me.axes = new Ext.util.MixedCollection(false, function(a) { return a.position; });
        if (axes) {
            me.axes.addAll(axes);
        }
        series = me.series;
        me.series = new Ext.util.MixedCollection(false, function(a) { return a.seriesId || (a.seriesId = Ext.id(null, 'ext-chart-series-')); });
        if (series) {
            me.series.addAll(series);
        }
        interactions = me.interactions;
        me.interactions = new Ext.util.MixedCollection(false, function(a) { return a.type; });
        if (interactions) {
            Ext.each(interactions, me.addInteraction, me);
        }
    },

    onActivate: function() {
        if (this.dirtyStore) {
            this.redraw();
        }
    },

    getEventsSurface: function() {
        return this.getSurface('events');
    },

    initEvents: function() {
        Ext.chart.Chart.superclass.initEvents.call(this);
        this.interactions.each(function(interaction) {
            interaction.initEvents();
        });
    },

    getSurface: function(name) {
        var me = this,
            surfaces = me.surfaces || (me.surfaces = {main: me.surface}),
            surface = surfaces[name],
            zIndexes = me.surfaceZIndexes,
            el;
        if (!surface) {
            surface = surfaces[name] = me.createSurface({
                background: null,
                initEvents: (name == 'events')
            });
            el = surface.el;
            el.setStyle('position', 'absolute');
            el.setStyle('zIndex', 10);

            // Apply z-index if surface name is in the surfaceZIndexes mapping
            if (name in zIndexes) {
                el.setStyle('zIndex', zIndexes[name]);
            }
        }
        return surface;
    },

    /**
     * Retrieves a reference to the {@link Ext.chart.Toolbar} for this chart, creating it first
     * if necessary.
     * @return {Ext.chart.Toolbar}
     */
    getToolbar: function() {
        var me = this,
            toolbar = me.toolbar;
        if (!toolbar || !toolbar.isChartToolbar) {
            toolbar = me.toolbar = new Ext.chart.Toolbar(Ext.applyIf({chart: me}, toolbar));
        }
        return toolbar;
    },

    // @private overrides the component method to set the correct dimensions to the chart.
    doComponentLayout: function(width, height) {
        var me = this,
            eventSurface;
        if (Ext.isNumber(width) && Ext.isNumber(height) && (me.dirtyStore ||
            (width !== me.curWidth || height !== me.curHeight))) {
            // Layouts in Touch 1.x aren't optimal, cache the previous size so we don't redraw so much.
            me.curWidth = width;
            me.curHeight = height;

            // Update surfaces to match size
            me.getSurface('main').setSize(width, height);
            eventSurface = me.getEventsSurface();
            eventSurface.setSize(width, height);
            eventSurface.el.setTopLeft(0, 0);

            if (me.store) {
                me.redraw(true);
            }
        }
        Ext.chart.Chart.superclass.doComponentLayout.apply(this, arguments);
    },

    /**
     * Redraw the chart. If animations are set this will animate the chart too.
     * @param {Boolean} resize (optional) flag which changes the default origin points of the chart for animations.
     */
    redraw: function(resize) {
        var me = this,
            p, legend, toolbar, i, l, colors, color, colorArrayStyle, callback;

        me.dirtyStore = false;
        me.chartBBox = {
            x: 0,
            y: 0,
            height: me.curHeight,
            width: me.curWidth
        };
        me.colorArrayStyle = me.colorArrayStyle || [];

        me.series.each(me.initializeSeries, me);
        me.axes.each(me.initializeAxis, me);

        if (!me.themeInitialized) {
            // Apply styles from stylesheet.
            me.applyStyles();
            if (me.style && me.style.colors) {
                colors = me.style.colors;
                colorArrayStyle = me.colorArrayStyle;
                for (i = 0, l = colors.length; i < l; ++i) {
                    color = colors[i];
                    if (Ext.isObject(color)) {
                        for (p in me.surfaces) {
                            me.surfaces[p].addGradient(color);
                        }
                        colorArrayStyle.push('url(#' + color.id + ')');
                    } else {
                        colorArrayStyle.push(color);
                    }
                }
            } else {
                me.series.each(function(series, idx) {
                    me.colorArrayStyle[idx] = (series.style.fill || series.style.stroke || '#000');
                });
            }
            me.series.each(function(series) {
                series.colorArrayStyle = me.colorArrayStyle;
            });
            if (me.style && me.style.background) {
                colors = me.style.background;
                //a gradient object
                if (Ext.isObject(colors)) {
                    me.background = { gradient: colors };
                    me.surfaces.main.addGradient(colors);
                } else {
                    //an image
                    if (colors.indexOf('url') > -1) {
                        me.background = { image: colors };
                    //just a color
                    } else {
                        me.background = { fill: colors };
                    }
                }
                me.surfaces.main.initBackground(me.background);
            }
        }

        me.initializeLegend();
        legend = me.legend;
        if (legend) {
            legend.orient();
        }

        toolbar = me.toolbar;
        if (toolbar && toolbar.isChartToolbar) {
            toolbar.orient();
        }

        //process all views (aggregated data etc) on stores before rendering.
        me.axes.each(function(axis) {
            axis.processView();
        });
        me.axes.each(function(axis) {
            axis.drawAxis(true);
        });

        // Place axes properly, including influence from each other
        me.alignAxes();

        // Reposition legend based on new axis alignment
        if (legend) {
            legend.updatePosition();
        }

        // Find the max gutter
        me.getMaxGutter();

        // Draw axes and series
        me.resizing = !!resize;

        me.axes.each(me.drawAxis, me);
        me.series.each(me.drawCharts, me);

        Ext.iterate(me.surfaces, function(name, surface) {
            surface.renderFrame();
        });

        me.resizing = false;

        if (Ext.is.iPad) {
            Ext.repaint();
        }

        if (!me.interactionsInitialized) {
            me.interactionsInitialized = true;
            if (me.animate) {
                me.interactions.each(function(interaction) {
                    interaction.initializeDefaults({
                        type: 'beforerender'
                    });
                });

                //on after render callback should remove itself since it's
                //only called once.
                callback = function() {
                    me.interactions.each(function(interaction) {
                        interaction.initializeDefaults({
                            type: 'afterrender'
                        });
                    });
                    me.series.get(0).removeListener('afterrender', callback);
                };

                me.series.get(0).addListener('afterrender', callback);
            } else {
                me.interactions.each(function(interaction) {
                    interaction.initializeDefaults();
                });
            }
        }

        me.fireEvent('redraw', me);
    },

    // @private set the store after rendering the chart.
    afterRender: function() {
        var ref,
            me = this;
        Ext.chart.Chart.superclass.afterRender.call(this);

        if (me.categoryNames) {
            me.setCategoryNames(me.categoryNames);
        }

        if (me.tipRenderer) {
            ref = me.getFunctionRef(me.tipRenderer);
            me.setTipRenderer(ref.fn, ref.scope);
        }

        me.bindStore(me.store);
        me.refresh();
    },

    /**
     * @private
     * Return the x and y position of the given event relative to the chart's series area.
     */
    getEventXY: function(e) {
        e = (e.changedTouches && e.changedTouches[0]) || e.event || e.browserEvent || e;

        var me = this,
            chartXY = me.el.getXY(),
            chartBBox = me.chartBBox,
            x = e.pageX - chartXY[0] - chartBBox.x,
            y = e.pageY - chartXY[1] - chartBBox.y;

        return [x, y];
    },

    /**
     * Given an x/y point relative to the chart, find and return the first series item that
     * matches that point.
     * @param {Number} x
     * @param {Number} y
     * @return {Object} an object with `series` and `item` properties, or `false` if no item found
     */
    getItemForPoint: function(x, y) {
        var me = this,
            i = 0,
            items = me.series.items,
            l = items.length,
            series, item;

        for (; i < l; i++) {
            series = items[i];
            item = series.getItemForPoint(x, y);
            if (item) {
                return item;
            }
        }

        return false;
    },

    /**
     * Given an x/y point relative to the chart, find and return all series items that match that point.
     * @param {Number} x
     * @param {Number} y
     * @return {Array} an array of objects with `series` and `item` properties
     */
    getItemsForPoint: function(x, y) {
        var me = this,
            items = [];

        me.series.each(function(series) {
            var item = series.getItemForPoint(x, y);
            if (item) {
                items.push(item);
            }
        });

        return items;
    },

    capitalize: function(string) {
        return string.charAt(0).toUpperCase() + string.substr(1);
    },

    // @private buffered refresh for when we update the store
    delayRefresh: function() {
        var me = this;
        if (!me.refreshTask) {
            me.refreshTask = new Ext.util.DelayedTask(me.refresh, me);
        }
        me.refreshTask.delay(10);
    },

    // @private
    refresh: function() {
        var me = this,
            undef;

        me.dirtyStore = true;
        if (me.rendered && me.curWidth != undef && me.curHeight != undef && me.fireEvent('beforerefresh', me) !== false) {
            me.redraw();
            me.fireEvent('refresh', me);
        }
    },

    /**
     * Changes the data store bound to this chart and refreshes it.
     * @param {Ext.data.Store} store The store to bind to this chart
     */
    bindStore: function(store) {
        var me = this,
            currentStore = me.store,
            initial = !me.storeIsBound;

        store = Ext.StoreMgr.lookup(store);
        if (!initial && currentStore && store !== currentStore) {
            if (currentStore.autoDestroy) {
                currentStore.destroy();
            }
            else {
                currentStore.un({
                    scope: me,
                    datachanged: me.refresh,
                    add: me.delayRefresh,
                    remove: me.delayRefresh,
                    update: me.delayRefresh
                    //clear: me.refresh
                });
            }
        }
        if (store && (initial || store !== currentStore)) {
            store.on({
                scope: me,
                datachanged: me.refresh,
                add: me.delayRefresh,
                remove: me.delayRefresh,
                update: me.delayRefresh
                //clear: me.refresh
            });
        }
        me.store = store;
        me.storeIsBound = true;
        if (store && !initial) {
            me.refresh();
        }
    },

    /**
     * Adds an interaction to the chart.
     * @param {Object/String} interaction Either an instantiated {@link Ext.chart.interactions.Abstract}
     * instance, a configuration object for an interaction, or the interaction type as a String.
     */
    addInteraction: function(interaction) {
        if (Ext.isString(interaction)) {
            interaction = {type: interaction};
        }
        if (!interaction.chart) {
            interaction.chart = this;
            interaction = Ext.chart.interactions.Manager.create(interaction);
        }
        this.interactions.add(interaction);
    },

    // @private initialize the series.
    initializeLegend: function() {
        var me = this,
            legend = me.legend,
            legendConfig = me.initialConfig.legend;
        if (!legend && legendConfig) {
            legend = me.legend = new Ext.chart.Legend(Ext.apply({chart: me}, legendConfig));
            legend.on('combine', me.redraw, me);
            legend.on('split', me.redraw, me);
        }
    },

    // @private Create Axis
    initializeAxis: function(axis) {
        var me = this,
            chartBBox = me.chartBBox,
            w = chartBBox.width,
            h = chartBBox.height,
            x = chartBBox.x,
            y = chartBBox.y,
            config = {
                chart: me,
                ownerCt: me,
                x: 0,
                y: 0
            };

        switch (axis.position) {
            case 'top':
                Ext.apply(config, {
                    length: w,
                    width: h,
                    startX: x,
                    startY: y
                });
            break;
            case 'bottom':
                Ext.apply(config, {
                    length: w,
                    width: h,
                    startX: x,
                    startY: h
                });
            break;
            case 'left':
                Ext.apply(config, {
                    length: h,
                    width: w,
                    startX: x,
                    startY: h
                });
            break;
            case 'right':
                Ext.apply(config, {
                    length: h,
                    width: w,
                    startX: w,
                    startY: h
                });
            break;
        }
        if (!axis.chart) {
            Ext.apply(config, axis);
            axis = me.axes.replace(new Ext.chart.axis[this.capitalize(axis.type)](config));
        }
        else {
            Ext.apply(axis, config);
        }
    },


    /**
     * @private Adjust the dimensions and positions of each axis and the chart body area after accounting
     * for the space taken up on each side by the axes and legend.
     */
    alignAxes: function() {
        var me = this,
            axes = me.axes,
            legend = me.legend,
            edges = ['top', 'right', 'bottom', 'left'],
            chartBBox,
            //get padding from sass styling or property setting.
            insetPadding = me.insetPadding || +me.style.padding || 10,
            insets;

        //store the original configuration for insetPadding.
        if (Ext.isObject(insetPadding)) {
            me.insetPadding = Ext.apply({} ,insetPadding);
            insets = {
                top: insetPadding.top || 0,
                right: insetPadding.right || 0,
                bottom: insetPadding.bottom || 0,
                left: insetPadding.left || 0
            };
        } else {
            me.insetPadding = insetPadding;
            insets = {
                top: insetPadding,
                right: insetPadding,
                bottom: insetPadding,
                left: insetPadding
            };
        }

        me.insets = insets;

        function getAxis(edge) {
            var i = axes.findIndex('position', edge);
            return (i < 0) ? null : axes.getAt(i);
        }

        // Find the space needed by axes and legend as a positive inset from each edge
        Ext.each(edges, function(edge) {
            var isVertical = (edge === 'left' || edge === 'right'),
                axis = getAxis(edge),
                bbox;

            // Add legend size if it's on this edge
            if (legend !== false) {
                if (legend.getPosition() === edge) {
                    insets[edge] += legend.getInsetSize();
                }
            }

            // Add axis size if there's one on this edge only if it has been
            //drawn before.
            if (axis && axis.bbox) {
                bbox = axis.bbox;
                insets[edge] += (isVertical ? bbox.width : bbox.height);
            }
        });
        // Build the chart bbox based on the collected inset values
        chartBBox = {
            x: insets.left,
            y: insets.top,
            width: me.curWidth - insets.left - insets.right,
            height: me.curHeight - insets.top - insets.bottom
        };
        me.chartBBox = chartBBox;

        // Go back through each axis and set its size, position, and relative start point based on the
        // corresponding edge of the chartBBox
        axes.each(function(axis) {
            var pos = axis.position,
                axisBBox = axis.bbox || {width: 0, height: 0},
                isVertical = (pos === 'left' || pos === 'right');

            axis.x = (pos === 'left' ? chartBBox.x - axisBBox.width : chartBBox.x);
            axis.y = (pos === 'top' ? chartBBox.y - axisBBox.height : chartBBox.y);
            axis.width = (isVertical ? axisBBox.width + chartBBox.width: axisBBox.height + chartBBox.height);
            axis.length = (isVertical ? chartBBox.height : chartBBox.width);
            axis.startX = (isVertical ? (pos === 'left' ? axisBBox.width : chartBBox.width) : 0);
            axis.startY = (pos === 'top' ? axisBBox.height : chartBBox.height);
        });
    },

    // @private initialize the series.
    initializeSeries: function(series, idx) {
        var me = this,
            config = {
                chart: me,
                ownerCt: me,
                seriesId: series.seriesId,
                index: idx
            };

        if (series instanceof Ext.chart.series.Series) {
            Ext.apply(series, config);
        } else {
            Ext.applyIf(config, series);
            series = me.series.replace(new Ext.chart.series[me.capitalize(series.type)](config));
        }
        if (series.initialize) {
            series.initialize();
        }
    },

    // @private
    getMaxGutter: function() {
        var me = this,
            maxGutter = [0, 0];
        me.series.each(function(s) {
            var gutter = s.getGutters && s.getGutters() || [0, 0];
            maxGutter[0] = Math.max(maxGutter[0], gutter[0]);
            maxGutter[1] = Math.max(maxGutter[1], gutter[1]);
        });
        me.maxGutter = maxGutter;
    },

    // @private draw axis.
    drawAxis: function(axis) {
        axis.drawAxis();
    },

    // @private draw series.
    drawCharts: function(series) {
        series.drawSeries();
        if (!this.animate) {
            series.fireEvent('afterrender');
        }
    },

    /**
     * Reset the chart back to its initial state, before any user interaction.
     * @param {Boolean} skipRedraw if `true`, redrawing of the chart will be skipped.
     */
    reset: function(skipRedraw) {
        var me = this,
            legend = me.legend;

        me.axes.each(function(axis) {
            if (axis.reset) {
                axis.reset();
            }
        });

        me.series.each(function(series) {
            if (series.reset) {
                series.reset();
            }
        });

        if (legend && legend.reset) {
            legend.reset();
        }

        if (!skipRedraw) {
            me.redraw();
        }
    },

    // @private remove gently.
    destroy: function() {
        Ext.iterate(this.surfaces, function(name, surface) {
            surface.destroy();
        });
        this.bindStore(null);
        Ext.chart.Chart.superclass.destroy.apply(this, arguments);
    },

    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/

    ownerCt: null,

    getItemId: function() {
        return this.el && this.el.id || this.id || null;
    },

    initCls: function() {
        return (this.cls || '').split(' ');
    },

    isXType: function(xtype) {
        return xtype === 'chart';
    },

    getRefItems: function(deep) {
        var me = this,
            ans = [];

        me.series.each(function(series) {
            ans.push(series);
            if (deep) {
                if (series.markerStyle) {
                    ans.push(series.markerStyle);
                }
                if (series.labelStyle) {
                    ans.push(series.labelStyle);
                }
                if (series.calloutStyle) {
                    ans.push(series.calloutStyle);
                }
            }
        });

        me.axes.each(function(axis) {
            ans.push(axis);
            if (deep && axis.labelStyle) {
                ans.push(axis.labelStyle);
            }
            if (deep && axis.gridStyle) {
                ans.push(axis.gridStyle);
                ans.push(axis.gridStyle.oddStyle);
                ans.push(axis.gridStyle.evenStyle);
            }
        });

        me.interactions.each(function(interaction) {
            ans.push(interaction);
            if (deep) {
                ans = ans.concat(interaction.getRefItems(deep));
            }
        });

        return ans;
    }
});
Ext.applyIf(Ext.chart.Chart.prototype, Ext.chart.theme.Theme.prototype);
Ext.reg('chart', Ext.chart.Chart);

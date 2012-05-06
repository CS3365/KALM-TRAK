/**
 * @class Ext.chart.series.Series
 *
 * Series is the abstract class containing the common logic to all chart series. Series includes
 * methods from Labels, Highlights, Tips and Callouts mixins. This class implements the logic of
 * animating, hiding, showing all elements and returning the color of the series to be used as a legend item.
 *
 * ## Listeners
 *
 * The series class supports listeners via the Observable syntax. Some of these listeners are:
 *
 *  - `itemmouseup` When the user interacts with a marker.
 *  - `itemmousedown` When the user interacts with a marker.
 *  - `itemmousemove` When the user iteracts with a marker.
 *  - (similar `item*` events occur for many raw mouse and touch events)
 *  - `afterrender` Will be triggered when the animation ends or when the series has been rendered completely.
 *
 * For example:
 *
 *     series: [{
 *             type: 'column',
 *             axis: 'left',
 *             listeners: {
 *                     'afterrender': function() {
 *                             console('afterrender');
 *                     }
 *             },
 *             xField: 'category',
 *             yField: 'data1'
 *     }]
 *
 */
Ext.ns('Ext.chart.series');
Ext.chart.series.Series = Ext.extend(Ext.util.Observable, {

    // TODO make into interaction:
    /**
     * @cfg {Object} tips
     * Add tooltips to the visualization's markers. The options for the tips are the
     * same configuration used with {@link Ext.tip.ToolTip}. For example:
     *
     *     tips: {
     *       trackMouse: true,
     *       width: 140,
     *       height: 28,
     *       renderer: function(storeItem, item) {
     *         this.setTitle(storeItem.get('name') + ': ' + storeItem.get('data1') + ' views');
     *       }
     *     },
     */

    /**
     * @protected {String} type
     * The type of series. Set in subclasses.
     */
    type: null,

    /**
     * @cfg {String} title
     * The human-readable name of the series.
     */
    title: null,

    /**
     * @cfg {Boolean} showInLegend
     * Whether to show this series in the legend.
     */
    showInLegend: true,

    /**
     * @cfg {Function} renderer
     * A function that can be overridden to set custom styling properties to each rendered element.
     * Passes in (sprite, record, attributes, index, store) to the function.
     */
    renderer: function(sprite, record, attributes, index, store) {
        return attributes;
    },

    /**
     * @cfg {Array} shadowAttributes
     * An array with shadow attributes
     */
    shadowAttributes: null,

    //@private triggerdrawlistener flag
    triggerAfterDraw: false,

    constructor: function(config) {
        var me = this;

        //new fresh object as own property.
        me.style = {};
        me.themeStyle = {};

        if (config) {
            Ext.apply(me, config);
        }

        me.shadowGroups = [];
        me.markerStyle = new Ext.chart.theme.MarkerStyle();
        me.labelStyle = new Ext.chart.theme.LabelStyle();

        Ext.chart.Label.prototype.constructor.call(me, config);
        Ext.chart.Highlight.prototype.constructor.call(me, config);
        Ext.chart.Callout.prototype.constructor.call(me, config);
        Ext.chart.Transformable.prototype.constructor.call(me);
        Ext.chart.series.ItemEvents.prototype.constructor.call(me);

        me.addEvents({
            beforedraw: true,
            draw: true,
            afterdraw: true,

            /**
             * @event titlechange
             * Fires when the series title is changed via {@link #setTitle}.
             * @param {String} title The new title value
             * @param {Number} index The index in the collection of titles
             */
            titlechange: true
        });

        me.initEvents();

        Ext.chart.series.Series.superclass.constructor.call(me, config);

    },

    /**
     * @private get the surface for drawing the series sprites
     */
    getSurface: function() {
        var me = this,
            surface = me.surface;
        if (!surface) {
            surface = me.surface = me.chart.getSurface('series' + me.index);
            surface.el.setStyle('zIndex', me.chart.surfaceZIndexes.series);
        }
        return surface;
    },

    /**
     * @private get the surface for drawing the series overlay sprites
     */
    getOverlaySurface: function() {
        var me = this,
            surface = me.overlaySurface;
        if (!surface) {
            surface = me.overlaySurface = me.chart.getSurface('seriesOverlay' + me.index);
            surface.el.setStyle('zIndex', me.chart.surfaceZIndexes.overlay);
        }
        return surface;
    },

    // @private set the bbox and clipBox for the series
    setBBox: function(noGutter) {
        var me = this,
            chart = me.chart,
            chartBBox = chart.chartBBox,
            gutterX = noGutter ? 0 : chart.maxGutter[0],
            gutterY = noGutter ? 0 : chart.maxGutter[1],
            clipBox, bbox;

        clipBox = {
            x: 0,
            y: 0,
            width: chartBBox.width,
            height: chartBBox.height
        };
        me.clipBox = clipBox;

        bbox = {
            x: ((clipBox.x + gutterX) - (chart.zoom.x * chart.zoom.width)) * me.zoomX,
            y: ((clipBox.y + gutterY) - (chart.zoom.y * chart.zoom.height)) * me.zoomY,
            width: (clipBox.width - (gutterX * 2)) * chart.zoom.width * me.zoomX,
            height: (clipBox.height - (gutterY * 2)) * chart.zoom.height * me.zoomY
        };
        me.bbox = bbox;
    },

    // @private set the animation for the sprite
    onAnimate: function(sprite, attr) {
        var me = this;
        sprite.stopAnimation();
        if (me.triggerAfterDraw) {
            return sprite.animate(Ext.applyIf(attr, me.chart.animate));
        } else {
            me.triggerAfterDraw = true;
            return sprite.animate(Ext.apply(Ext.applyIf(attr, me.chart.animate), {
                listeners: {
                    'afteranimate': function() {
                        me.triggerAfterDraw = false;
                        me.fireEvent('afterrender');
                    }
                }
            }));
        }
    },

    // @private return the gutter.
    getGutters: function() {
        return [0, 0];
    },

    /**
     * For a given x/y point relative to the Surface, find a corresponding item from this
     * series, if any.
     * @param {Number} x
     * @param {Number} y
     * @return {Object} An object describing the item, or null if there is no matching item. The exact contents of
     *                  this object will vary by series type, but should always contain at least the following:
     *                  <ul>
     *                    <li>{Ext.chart.series.Series} series - the Series object to which the item belongs</li>
     *                    <li>{Object} value - the value(s) of the item's data point</li>
     *                    <li>{Array} point - the x/y coordinates relative to the chart box of a single point
     *                        for this data item, which can be used as e.g. a tooltip anchor point.</li>
     *                    <li>{Ext.draw.Sprite} sprite - the item's rendering Sprite.
     *                  </ul>
     */
    getItemForPoint: function(x, y) {
        var me = this,
            items = me.items,
            bbox = me.bbox,
            i, ln;

        if (items && items.length && !me.seriesIsHidden && Ext.draw.Draw.withinBox(x, y, bbox)) {
            // Adjust for series pan
            x -= me.panX;
            y -= me.panY;

            // Check bounds
            for (i = 0, ln = items.length; i < ln; i++) {
                if (items[i] && me.isItemInPoint(x, y, items[i], i)) {
                    return items[i];
                }
            }
        }

        return null;
    },

    isItemInPoint: function() {
        return false;
    },

    /**
     * Hides all the elements in the series.
     */
    hideAll: function() {
        var me = this,
            items = me.items,
            item, len, i, j, l, sprite, shadows;

        me.seriesIsHidden = true;
        me._prevShowMarkers = me.showMarkers;

        me.showMarkers = false;
        //hide all labels
        me.hideLabels(0);
        //hide all sprites
        for (i = 0, len = items.length; i < len; i++) {
            item = items[i];
            sprite = item.sprite;
            if (sprite) {
                sprite.setAttributes({
                    hidden: true
                }, true);
                
                if (sprite.shadows) {
                    shadows = sprite.shadows;
                    for (j = 0, l = shadows.length; j < l; ++j) {
                        shadows[j].hide(true);
                    }
                }
            }

        }
    },

    /**
     * Shows all the elements in the series.
     */
    showAll: function() {
        var me = this,
            prevAnimate = me.chart.animate;
        me.chart.animate = false;
        me.seriesIsHidden = false;
        me.showMarkers = me._prevShowMarkers;
        me.drawSeries();
        me.chart.animate = prevAnimate;
    },

    /**
     * Performs drawing of this series.
     */
    drawSeries: function() {
        this.updateSurfaceBox();
    },

    /**
     * Returns an array of labels to be displayed as items in the legend. Only relevant if
     * {@link #showInLegend} is true.
     */
    getLegendLabels: function() {
        var title = this.title;
        return title ? [title] : [];
    },

    getColorFromStyle: function(style) {
        if (Ext.isObject(style)) {
            return style.stops[0].color;
        }
        //if it's a gradient just return the first color stop.
        return style.indexOf('url') == -1 ? style : me.getSurface('main')._gradients[style.match(/url\(#([^\)]+)\)/)[1]].stops[0].color;
    },

    /**
     * Returns a string with the color to be used for the series legend item.
     */
    getLegendColor: function(index) {
        var me = this, fill, stroke;

        if (me.style) {
            fill = me.style.fill;
            stroke = me.style.stroke;
            if (fill && fill != 'none') {
                return me.getColorFromStyle(fill);
            }
            return me.getColorFromStyle(stroke);
        }

        return '#000';
    },

    /**
     * Checks whether the data field should be visible in the legend
     * @private
     * @param {Number} index The index of the current item
     */
    visibleInLegend: function(index){
        return !this.seriesIsHidden && !this.isExcluded(index);
    },

    /**
     * Changes the value of the {@link #title} for the series.
     * Arguments can take two forms:
     * <ul>
     * <li>A single String value: this will be used as the new single title for the series (applies
     * to series with only one yField)</li>
     * <li>A numeric index and a String value: this will set the title for a single indexed yField.</li>
     * </ul>
     * @param {Number} index
     * @param {String} title
     */
    setTitle: function(index, title) {
        var me = this,
            oldTitle = me.title;

        if (Ext.isString(index)) {
            title = index;
            index = 0;
        }

        if (Ext.isArray(oldTitle)) {
            oldTitle[index] = title;
        } else {
            me.title = title;
        }

        me.fireEvent('titlechange', title, index);
    },

    /**
     * @private update the position/size of the series surface
     */
    updateSurfaceBox: function() {
        var me = this,
            surface = me.getSurface(),
            overlaySurface = me.getOverlaySurface(),
            chartBBox = me.chart.chartBBox;

        surface.el.setTopLeft(chartBBox.y, chartBBox.x);
        surface.setSize(chartBBox.width, chartBBox.height);

        overlaySurface.el.setTopLeft(chartBBox.y, chartBBox.x);
        overlaySurface.setSize(chartBBox.width, chartBBox.height);
    },

    getTransformableSurfaces: function() {
        // Need to transform the overlay surface along with the normal surface
        // TODO might be good to skip transforming the overlay surface if there is nothing in it
        return [this.getSurface(), this.getOverlaySurface()];
    },

    /**
     * Iterate over each of the records for this series. The default implementation simply iterates
     * through the entire data store, but individual series implementations can override this to
     * provide custom handling, e.g. adding/removing records.
     * @param {Function} fn The function to execute for each record.
     * @param {Object} scope Scope for the fn.
     */
    eachRecord: function(fn, scope) {
        var chart = this.chart;
        (chart.substore || chart.store).each(fn, scope);
    },

    /**
     * Return the number of records being displayed in this series. Defaults to the number of
     * records in the store; individual series implementations can override to provide custom handling.
     */
    getRecordCount: function() {
        var chart = this.chart,
            store = chart.substore || chart.store;
        return store ? store.getCount() : 0;
    },

    /**
     * Determines whether the series item at the given index has been excluded, i.e. toggled off in the legend.
     * @param index
     */
    isExcluded: function(index) {
        var excludes = this.__excludes;
        return !!(excludes && excludes[index]);
    },

    /**
     * Combine two of this series's indexed items into one. This is done via drag-drop on the
     * legend for series that render more than one legend item. The data store is not modified,
     * but the series uses the cumulative list of combinations in its rendering.
     * @param {Number} index1 Index of the first item
     * @param {Number} index2 Index of the second item
     */
    combine: function(index1, index2) {
        var me = this,
            combinations = me.combinations || (me.combinations = []),
            excludes = me.__excludes;
        combinations.push([index1, index2]);
        if (excludes && index1 < excludes.length) {
            excludes.splice(index1, 1);
        }
    },

    /**
     * Determines whether the item at the given index is the result of item combination.
     * @param {Number} index
     * @return {Boolean}
     */
    isCombinedItem: function(index) {
        return this.getCombinationIndexesForItem(index).length > 0;
    },

    getCombinationIndexesForItem: function(index) {
        var me = this,
            combinations = me.combinations,
            provenances = [],
            i, len, combo, comboIndexA, comboIndexB;
        if (combinations) {
            // Step through the combinations to determine which combination step(s) contribute
            // to the item at the given index, if any
            for (i = 0, len = combinations.length; i < len; i++) {
                combo = combinations[i];
                comboIndexA = combo[0];
                comboIndexB = combo[1];
                if (!provenances[comboIndexB]) {
                    provenances[comboIndexB] = [];
                }
                if (provenances[comboIndexA]) {
                    provenances[comboIndexB] = provenances[comboIndexB].concat(provenances[comboIndexA]);
                }
                provenances[comboIndexB].push(i);
                provenances.splice(comboIndexA, 1);
            }
        }
        return provenances[index] || [];
    },

    split: function(index) {
        var me = this,
            combinations = me.combinations,
            excludes = me.__excludes,
            i, j, len, comboIndexes, combo, movedItemIndex;

        if (combinations) {
            comboIndexes = me.getCombinationIndexesForItem(index);

            // For each contributing combination, remove it from the list and adjust the indexes
            // of all subsequent combinations and excludes to account for it
            if (comboIndexes) {
                for (i = comboIndexes.length; i--;) {
                    movedItemIndex = combinations[comboIndexes[i]][0];
                    for (j = comboIndexes[i] + 1, len = combinations.length; j < len; j++) {
                        if (movedItemIndex <= combinations[j][0]) {
                            combinations[j][0]++;
                        }
                        if (movedItemIndex <= combinations[j][1]) {
                            combinations[j][1]++;
                        }
                    }
                    combinations.splice(comboIndexes[i], 1);

                    if (excludes) {
                        excludes.splice(movedItemIndex, 0, false);
                    }
                }
            }

            // Now that the combinations list is updated, reset and replay them all
            me.clearCombinations();
            for (i = 0, len = combinations.length; i < len; i++) {
                combo = combinations[i];
                me.combine(combo[0], combo[1]);
            }
        }
    },

    /**
     * Split any series items that were combined via {@link #combine} into their original items.
     */
    clearCombinations: function() {
        delete this.combinations;
    },

    /**
     * Reset the series to its original state, before any user interaction.
     */
    reset: function() {
        var me = this;
        me.unHighlightItem();
        me.cleanHighlights();
        me.clearTransform();
    },

    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/

    //filled by the constructor.
    ownerCt: null,

    getItemId: function() {
        return this.el && this.el.id || this.id || null;
    },

    initCls: function() {
        return (this.cls || '').split(' ');
    },

    isXType: function(xtype) {
        return xtype === 'series';
    },

    getRefItems: function(deep) {
        var me = this,
            ans = [];

        if (me.markerStyle) {
            ans.push(me.markerStyle);
        }

        if (me.labelStyle) {
            ans.push(me.labelStyle);
        }

        if (me.calloutStyle) {
            ans.push(me.calloutStyle);
        }
        
        if (me.highlightStyle) {
            ans.push(me.highlightStyle);
        }

        return ans;
    }
});

Ext.applyIf(Ext.chart.series.Series.prototype, Ext.chart.Label.prototype);
Ext.applyIf(Ext.chart.series.Series.prototype, Ext.chart.Highlight.prototype);
Ext.applyIf(Ext.chart.series.Series.prototype, Ext.chart.Callout.prototype);
Ext.applyIf(Ext.chart.series.Series.prototype, Ext.chart.Transformable.prototype);
Ext.applyIf(Ext.chart.series.Series.prototype, Ext.chart.series.ItemEvents.prototype);

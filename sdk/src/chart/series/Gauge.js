/**
 * @class Ext.chart.series.Gauge
 * @extends Ext.chart.series.Series
 *
 * Creates a Gauge Chart. Gauge Charts are used to show progress in a certain variable. There are two ways of using the Gauge chart.
 * One is setting a store element into the Gauge and selecting the field to be used from that store. Another one is instanciating the
 * visualization and using the `setValue` method to adjust the value you want.
 *
 * A chart/series configuration for the Gauge visualization could look like this:
 *
 *     {
 *         xtype: 'chart',
 *         store: store,
 *         axes: [{
 *             type: 'gauge',
 *             position: 'gauge',
 *             minimum: 0,
 *             maximum: 100,
 *             steps: 10,
 *             margin: -10
 *         }],
 *         series: [{
 *             type: 'gauge',
 *             angleField: 'data1',
 *             donut: false,
 *             colorSet: ['#F49D10', '#ddd']
 *         }]
 *     }
 *
 * In this configuration we create a special Gauge axis to be used with the gauge visualization (describing half-circle markers), and also we're
 * setting a maximum, minimum and steps configuration options into the axis. The Gauge series configuration contains the store field to be bound to
 * the visual display and the color set to be used with the visualization.
 *
 * @xtype gauge
 */
Ext.chart.series.Gauge = Ext.extend(Ext.chart.series.Series, {

    type: "gauge",

    rad: Math.PI / 180,

    /**
     * @cfg {String} angleField
     * The store record field name to be used for the gauge angles.
     * The values bound to this field name must be positive real numbers.
     * This parameter is required.
     */
    angleField: false,

    /**
     * @cfg {Boolean} needle
     * Use the Gauge Series as an area series or add a needle to it. Default's false.
     */
    needle: false,

    /**
     * @cfg {Boolean|Number} donut
     * Use the entire disk or just a fraction of it for the gauge. Default's false.
     */
    donut: false,

    /**
     * @cfg {Boolean} showInLegend
     * Whether to add the gauge chart elements as legend items. Default's false.
     */
    showInLegend: false,

    /**
     * @cfg {Object} style
     * An object containing styles for overriding series styles from Theming.
     */

    constructor: function(config) {
        Ext.chart.series.Gauge.superclass.constructor.apply(this, arguments);
        var me = this,
            chart = me.chart,
            surface = me.getSurface(),
            shadow = chart.shadow, i, l;
        Ext.apply(me, config, {
            shadowAttributes: surface.getShadowAttributesArray(),
            shadowOptions: surface.getShadowOptions()
        });
        me.group = surface.getGroup(me.seriesId);
        if (shadow) {
            for (i = 0, l = me.shadowAttributes.length; i < l; i++) {
                me.shadowGroups.push(surface.getGroup(me.seriesId + '-shadows' + i));
            }
        }
        surface.customAttributes.segment = function(opt) {
            return me.getSegment(opt);
        };
    },

    //@private updates some onbefore render parameters.
    initialize: function() {
        var me = this;
        //Add yFields to be used in Legend.js
        me.yField = [];
        if (me.label.field) {
            me.eachRecord(function(rec) {
                me.yField.push(rec.get(me.label.field));
            });
        }
    },

    // @private returns an object with properties for a PieSlice.
    getSegment: function(opt) {
        var me = this,
            rad = me.rad,
            cos = Math.cos,
            sin = Math.sin,
            abs = Math.abs,
            x = me.centerX,
            y = me.centerY,
            x1 = 0, x2 = 0, x3 = 0, x4 = 0,
            y1 = 0, y2 = 0, y3 = 0, y4 = 0,
            delta = 1e-2,
            startAngle = opt.startAngle,
            endAngle = opt.endAngle,
            midAngle = (startAngle + endAngle) / 2 * rad,
            margin = opt.margin || 0,
            flag = abs(endAngle - startAngle) > 180,
            auxValue = abs(endAngle % 360),
            flag2 = auxValue > 90  && auxValue < 270,
            a1 = Math.min(startAngle, endAngle) * rad,
            a2 = Math.max(startAngle, endAngle) * rad,
            singleSlice = false,
            fullCircle = false;

        x += margin * cos(midAngle);
        y += margin * sin(midAngle);

        x1 = x + opt.startRho * cos(a1);
        y1 = y + opt.startRho * sin(a1);

        x2 = x + opt.endRho * cos(a1);
        y2 = y + opt.endRho * sin(a1);

        x3 = x + opt.startRho * cos(a2);
        y3 = y + opt.startRho * sin(a2);

        x4 = x + opt.endRho * cos(a2);
        y4 = y + opt.endRho * sin(a2);

        if (abs(x1 - x3) <= delta && abs(y1 - y3) <= delta) {
            singleSlice = true;
        }

        fullCircle = singleSlice && (abs(x2 - x4) <= delta && abs(y2 - y4) <= delta);
        //Solves mysterious clipping bug with IE
        if (fullCircle) {
            return {
                path: [
                ["M", x4, y4 - 1e-4],
                ["A", opt.endRho, opt.endRho, 0, +flag, +flag2, x4, y4],
                ["Z"]]
            };
        } else if (singleSlice) {
            return {
                path: [
                ["M", x1, y1],
                ["L", x2, y2],
                ["A", opt.endRho, opt.endRho, 0, +flag, 1, x4, y4],
                ["Z"]]
            };
        } else {
            return {
                path: [
                ["M", x1, y1],
                ["L", x2, y2],
                ["A", opt.endRho, opt.endRho, 0, +flag, 1, x4, y4],
                ["M", x4, y4],
                ["L", x3, y3],
                ["A", opt.startRho, opt.startRho, 0, +flag, 0, x1, y1],
                ["Z"]]
            };
        }
    },

    // @private utility function to calculate the middle point of a pie slice.
    calcMiddle: function(item) {
        var me = this,
            rad = me.rad,
            slice = item.slice,
            x = me.centerX,
            y = me.centerY,
            startAngle = slice.startAngle,
            endAngle = slice.endAngle,
            a1 = Math.min(startAngle, endAngle) * rad,
            a2 = Math.max(startAngle, endAngle) * rad,
            midAngle = -(a1 + (a2 - a1) / 2),
            xm = x + (item.endRho + item.startRho) / 2 * Math.cos(midAngle),
            ym = y - (item.endRho + item.startRho) / 2 * Math.sin(midAngle);

        item.middle = {
            x: xm,
            y: ym
        };
    },

    /**
     * Draws the series for the current chart.
     */
    drawSeries: function() {
        var me = this,
            chart = me.chart,
            store = chart.substore || chart.store,
            group = me.group,
            animate = me.chart.animate,
            axis = me.chart.axes.get(0),
            minimum = axis && axis.minimum || me.minimum || 0,
            maximum = axis && axis.maximum || me.maximum || 0,
            field = me.angleField || me.field || me.xField,
            surface = me.getSurface(),
            chartBBox = chart.chartBBox,
            donut = +me.donut,
            items = [],
            seriesStyle = me.style,
            colorArrayStyle = me.colorArrayStyle,
            colorArrayLength = colorArrayStyle && colorArrayStyle.length || 0,
            cos = Math.cos,
            sin = Math.sin,
            enableShadows = !!chart.shadow,
            rendererAttributes, centerX, centerY, slice, slices, sprite, value,
            item, ln, record, i, path,
            p, spriteOptions, bbox, splitAngle, sliceA, sliceB;

        if (me.fireEvent('beforedraw', me) === false) {
            return;
        }

        Ext.chart.series.Gauge.superclass.drawSeries.call(this);

        me.setBBox();
        bbox = me.bbox;

        //override theme colors
        if (me.colorSet) {
            colorArrayStyle = me.colorSet;
            colorArrayLength = colorArrayStyle.length;
        }

        //if not store or store is empty then there's nothing to draw
        if (!me.getRecordCount()) {
            surface.items.hide(true);
            return;
        }

        centerX = me.centerX = (chartBBox.width / 2);
        centerY = me.centerY = chartBBox.height;
        me.radius = Math.min(centerX, centerY);
        me.slices = slices = [];
        me.items = items = [];

        if (!me.value) {
            record = store.getAt(0);
            me.value = record.get(field);
        }

        value = me.value;
        if (me.needle) {
            sliceA = {
                series: me,
                value: value,
                startAngle: -180,
                endAngle: 0,
                rho: me.radius
            };
            splitAngle = -180 * (1 - (value - minimum) / (maximum - minimum));
            slices.push(sliceA);
        } else {
            splitAngle = -180 * (1 - (value - minimum) / (maximum - minimum));
            sliceA = {
                series: me,
                value: value,
                startAngle: -180,
                endAngle: splitAngle,
                rho: me.radius
            };
            sliceB = {
                series: me,
                value: me.maximum - value,
                startAngle: splitAngle,
                endAngle: 0,
                rho: me.radius
            };
            slices.push(sliceA, sliceB);
        }

        //do pie slices after.
        for (i = 0, ln = slices.length; i < ln; i++) {
            slice = slices[i];
            sprite = group.getAt(i);
            //set pie slice properties
            rendererAttributes = Ext.apply({
                segment: {
                    startAngle: slice.startAngle,
                    endAngle: slice.endAngle,
                    margin: 0,
                    rho: slice.rho,
                    startRho: slice.rho * +donut / 100,
                    endRho: slice.rho
                }
            }, Ext.apply(seriesStyle, colorArrayStyle && { fill: colorArrayStyle[i % colorArrayLength] } || {}));

            item = Ext.apply({},
            rendererAttributes.segment, {
                slice: slice,
                series: me,
                storeItem: record,
                index: i
            });
            items[i] = item;
            // Create a new sprite if needed (no height)
            if (!sprite) {
                spriteOptions = Ext.apply({
                    type: "path",
                    group: group
                }, Ext.apply(seriesStyle, colorArrayStyle && { fill: colorArrayStyle[i % colorArrayLength] } || {}));

                if (enableShadows) {
                    Ext.apply(spriteOptions, me.shadowOptions);
                }

                sprite = surface.add(Ext.apply(spriteOptions, rendererAttributes));
            }
            slice.sprite = slice.sprite || [];
            item.sprite = sprite;
            slice.sprite.push(sprite);
            if (animate) {
                rendererAttributes = me.renderer(sprite, record, rendererAttributes, i, store);
                sprite._to = rendererAttributes;
                me.onAnimate(sprite, {
                    to: rendererAttributes
                });
            } else {
                rendererAttributes = me.renderer(sprite, record, Ext.apply(rendererAttributes, {
                    hidden: false
                }), i, store);
                sprite.setAttributes(rendererAttributes, true);
            }
        }

        if (me.needle) {
            splitAngle = splitAngle * Math.PI / 180;

            if (!me.needleSprite) {
                me.needleSprite = me.getSurface().add({
                    type: 'path',
                    path: ['M', centerX + (me.radius * +donut / 100) * cos(splitAngle),
                                centerY + -Math.abs((me.radius * +donut / 100) * sin(splitAngle)),
                           'L', centerX + me.radius * cos(splitAngle),
                                centerY + -Math.abs(me.radius * sin(splitAngle))],
                    'stroke-width': 4,
                    'stroke': '#222'
                });
            } else {
                if (animate) {
                    me.onAnimate(me.needleSprite, {
                        to: {
                        path: ['M', centerX + (me.radius * +donut / 100) * cos(splitAngle),
                                    centerY + -Math.abs((me.radius * +donut / 100) * sin(splitAngle)),
                               'L', centerX + me.radius * cos(splitAngle),
                                    centerY + -Math.abs(me.radius * sin(splitAngle))]
                        }
                    });
                } else {
                    me.needleSprite.setAttributes({
                        type: 'path',
                        path: ['M', centerX + (me.radius * +donut / 100) * cos(splitAngle),
                                    centerY + -Math.abs((me.radius * +donut / 100) * sin(splitAngle)),
                               'L', centerX + me.radius * cos(splitAngle),
                                    centerY + -Math.abs(me.radius * sin(splitAngle))]
                    });
                }
            }
            me.needleSprite.setAttributes({
                hidden: false
            }, true);
        }

        delete me.value;

        me.fireEvent('draw', me);
    },

    /**
     * Sets the Gauge chart to the current specified value.
    */
    setValue: function (value) {
        this.value = value;
        this.drawSeries();
    },

    // @private callback for when creating a label sprite.
    onCreateLabel: Ext.emptyFn,

    // @private callback for when placing a label sprite.
    onPlaceLabel: Ext.emptyFn,

    // @private callback for when placing a callout.
    onPlaceCallout: Ext.emptyFn,

    // @private handles sprite animation for the series.
    onAnimate: function(sprite, attr) {
        sprite.show();
        Ext.chart.series.Gauge.superclass.onAnimate.apply(this, arguments);
    },

    isItemInPoint: function() {
        return false;
    },

    // @private shows all elements in the series.
    showAll: function() {
        if (!isNaN(this._index)) {
            this.__excludes[this._index] = false;
            this.drawSeries();
        }
    },

    /**
     * Returns the color of the series (to be displayed as color for the series legend item).
     * @param index {Number} Info about the item; same format as returned by #getItemForPoint
     */
    getLegendColor: function(index) {
        var me = this,
            colorArrayStyle = me.colorArrayStyle;
        return me.getColorFromStyle(colorArrayStyle[index % colorArrayStyle.length]);
    }
});


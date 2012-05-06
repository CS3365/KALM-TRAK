/**
 * @class Ext.chart.interactions.Rotate
 * @extends Ext.chart.interactions.Abstract
 *
 * The Rotate interaction allows rotation of a Pie or Radar chart series. By default rotation
 * is performed via a single-finger drag around the center of the series, but can be configured
 * to use a two-finger pinch-rotate gesture by setting `gesture: 'pinch'`.
 *
 * To attach this interaction to a chart, include an entry in the chart's
 * {@link Ext.chart.Chart#interactions interactions} config with the `rotate` type:
 *
 *     new Ext.chart.Chart({
 *         renderTo: Ext.getBody(),
 *         width: 800,
 *         height: 600,
 *         store: store1,
 *         series: [ ...pie/radar series options... ],
 *         interactions: [{
 *             type: 'rotate'
 *         }]
 *     });
 *
 * @author Jason Johnston <jason@sencha.com>
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.chart.interactions.Rotate = Ext.extend(Ext.chart.interactions.Abstract, {
    /**
     * @cfg {String} gesture
     * Defines the gesture type that will be used to rotate the chart. Currently only
     * supports `pinch` for two-finger rotation and `drag` for single-finger rotation.
     * Defaults to `drag`.
     */
    gesture: 'drag',

    constructor: function(config) {
        var me = this,
            interactionsNS = Ext.chart.interactions;
        interactionsNS.Rotate.superclass.constructor.call(me, config);
        interactionsNS.DelayedSync.prototype.constructor.call(me, config);
    },

    initEvents: function() {
        Ext.chart.interactions.Rotate.superclass.initEvents.call(this, arguments);
        var me = this,
            gesture = me.gesture;
        me.addChartListener(gesture + 'start', me.onGestureStart, me);
        me.addChartListener(gesture + 'end', me.onGestureEnd, me);
    },

    onGestureStart: function() {
        var me = this,
            axis = me.getAxis();
        me.cancelSync();
        me.getSeries().each(function(series) {
            series.unHighlightItem();
            series.origHighlight = series.highlight;
            series.highlight = false;
            if (series.callouts) {
                series.hideCallouts(0);
                series.getSurface().renderFrame();
            }
        });
        if (axis && axis.position === 'radial') {
            axis.hideLabels();
            axis.renderFrame();
        }
    },

    onGesture: function(e) {
        var me = this,
            oldAngle = me.lastAngle,
            firstPageX, secondPageX, firstPageY, secondPageY,
            series, seriesXY, newAngle, undef;

        if (me.gesture === 'pinch') {
            // Multi-touch pinch event - use angle between two touches
            firstPageX = e.firstPageX;
            firstPageY = e.firstPageY;
            secondPageX = e.secondPageX;
            secondPageY = e.secondPageY;
        } else {
            // Single-touch event - use angle between touch point and series center
            series = me.getSeries().get(0);
            seriesXY = series.getSurface().el.getXY();
            firstPageX = series.centerX + seriesXY[0];
            firstPageY = series.centerY + seriesXY[1];
            secondPageX = e.pageX;
            secondPageY = e.pageY;
        }
        newAngle = Ext.draw.Draw.degrees(Math.atan2(secondPageY - firstPageY, secondPageX - firstPageX));

        if (oldAngle === undef) {
            oldAngle = newAngle;
        }

        if (oldAngle !== newAngle) {
            me.rotateBy(newAngle - oldAngle);
        }

        me.lastAngle = newAngle;
    },

    onGestureEnd: function() {
        var me = this;
        me.delaySync();
        me.getSeries().each(function(series) {
            series.highlight = series.origHighlight;
        });
        delete me.lastAngle;
    },

    rotateBy: function(angle) {
        var me = this,
            series = me.getSeries(),
            axis = me.getAxis(),
            matrix;

        me.rotation = (me.rotation || 0) + angle;

        series.each(function(series) {
            matrix = series.getFastTransformMatrix();
            matrix.rotate(angle, series.centerX, series.centerY);
            series.setFastTransformMatrix(matrix);
        });

        if (axis) {
            matrix = axis.getFastTransformMatrix();
            matrix.rotate(angle, axis.centerX, axis.centerY);
            axis.setFastTransformMatrix(matrix);
        }
    },

    seriesFilter: function(series) {
        return series.type === 'pie' || series.type === 'radar';
    },

    getSeries: function() {
        return this.chart.series.filter(this.seriesFilter);
    },

    axisFilter: function(axis) {
        return axis.position === 'radial';
    },

    getAxis: function() {
        return this.chart.axes.findBy(this.axisFilter);
    },

    sync: function() {
        var me = this,
            chart = me.chart,
            axis = me.getAxis(),
            anim = chart.animate;

        chart.animate = false;
        me.getSeries().each(function(series) {
            series.rotation -= me.rotation;
            series.drawSeries();
            series.getSurface().renderFrame();
            series.clearTransform();
        });
        if (axis) {
            axis.rotation -= me.rotation;
            axis.drawAxis();
            axis.renderFrame();
            axis.clearTransform();
        }
        chart.animate = anim;

        me.rotation = 0;
    },

    needsSync: function() {
        return !!this.rotation;
    }
});

Ext.applyIf(Ext.chart.interactions.Rotate.prototype, Ext.chart.interactions.DelayedSync.prototype);

Ext.chart.interactions.Manager.registerType('rotate', Ext.chart.interactions.Rotate);

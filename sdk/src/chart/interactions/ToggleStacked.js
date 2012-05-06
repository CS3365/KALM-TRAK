/**
 * @class Ext.chart.interactions.ToggleStacked
 * @extends Ext.chart.interactions.Abstract
 *
 * The ToggleStacked interaction allows toggling a {@link Ext.chart.series.Bar bar} or
 * {@link Ext.chart.series.Column column} series between stacked and grouped orientations
 * for multiple yField values. By default this is triggered via a `swipe` event; to customize
 * the trigger event modify the {@link #event} config.
 *
 * To attach this interaction to a chart, include an entry in the chart's
 * {@link Ext.chart.Chart#interactions interactions} config with the `togglestacked` type:
 *
 *     new Ext.chart.Chart({
 *         renderTo: Ext.getBody(),
 *         width: 800,
 *         height: 600,
 *         store: store1,
 *         axes: [ ...some axes options... ],
 *         series: [ ...bar or column series options... ],
 *         interactions: [{
 *             type: 'togglestacked',
 *             event: 'doubletap'
 *         }]
 *     });
 *
 * @author Jason Johnston <jason@sencha.com>
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.chart.interactions.ToggleStacked = Ext.extend(Ext.chart.interactions.Abstract, {

    /**
     * @cfg {String} gesture
     * Defines the gesture type that should trigger the toggle. Defaults to `swipe`.
     */
    gesture: 'swipe',

    /**
     * @cfg {Boolean} animateDirect
     * If set to `true`, then animation will skip the intermediate disjoint state and simply
     * animate directly from the stacked to grouped orientation. Only relevant if the chart
     * is configured to allow animation. Defaults to `false`.
     */

    onGesture: function(e) {
        var me = this,
            chart = me.chart,
            series = me.getSeries();

        if (series) {
            if (chart.animate && !me.animateDirect) {
                if (!me.locked) {
                    me.lock();
                    if (series.stacked) {
                        series.disjointStacked = true;
                        me.afterAnim(series, function() {
                            series.stacked = series.disjointStacked = false;
                            me.afterAnim(series, me.unlock);
                            chart.redraw();
                        });
                        series.drawSeries();
                    }
                    else {
                        series.stacked = series.disjointStacked = true;
                        me.afterAnim(series, function() {
                            series.disjointStacked = false;
                            me.afterAnim(series, me.unlock);
                            series.drawSeries();
                        });
                        chart.redraw();
                    }
                }
            } else {
                series.stacked = !series.stacked;
                chart.redraw();
            }
        }
    },

    lock: function() {
        this.locked = true;
    },

    unlock: function() {
        this.locked = false;
    },

    afterAnim: function(series, fn) {
        // TODO this fires too soon if the series is configured with bar labels
        series.on('afterrender', fn, this, {
            single: true,
            // must delay slightly so the handler can set another afterrender
            // listener without it getting called immediately:
            delay: 1
        });
    },

    getSeries: function() {
        return this.chart.series.findBy(function(series) {
            return series.type === 'bar' || series.type === 'column';
        });
    }
});

Ext.chart.interactions.Manager.registerType('togglestacked', Ext.chart.interactions.ToggleStacked);

/**
 * @class Ext.chart.interactions.ItemHighlight
 * @extends Ext.chart.interactions.Abstract
 *
 * The ItemHighlight interaction allows highlighting of series data items on the chart.
 * This interaction enables triggering and clearing the highlight on certain events, but
 * does not control how the highlighting is implemented or styled; that is handled by
 * each individual Series type and the {@link Ext.chart.Highlight} mixin. See the documentation
 * for that mixin for how to customize the highlighting effect.
 *
 * To attach this interaction to a chart, include an entry in the chart's
 * {@link Ext.chart.Chart#interactions interactions} config with the `itemhighlight` type:
 *
 *     new Ext.chart.Chart({
 *         renderTo: Ext.getBody(),
 *         width: 800,
 *         height: 600,
 *         store: store1,
 *         axes: [ ...some axes options... ],
 *         series: [ ...some series options... ],
 *         interactions: [{
 *             type: 'itemhighlight'
 *         }]
 *     });

 *
 * @author Jason Johnston <jason@sencha.com>
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.chart.interactions.ItemHighlight = Ext.extend(Ext.chart.interactions.Abstract, {

    gesture: 'tap',
    unHighlightEvent: 'touchstart',

    initEvents: function() {
        var me = this;
        Ext.chart.interactions.ItemHighlight.superclass.initEvents.call(me, arguments);
        me.addChartListener(me.unHighlightEvent, me.onUnHighlightEvent, me);
    },

    onGesture: function(e) {
        var me = this,
            items = me.getItemsForEvent(e),
            item, highlightedItem, series,
            i, len;

        for(i = 0, len = items.length; i < len; i++) {
            item = items[i];
            series = item.series;
            highlightedItem = series.highlightedItem;
            if (highlightedItem !== item) {
                if (highlightedItem) {
                    highlightedItem.series.unHighlightItem();
                }
                series.highlightItem(item);
                series.highlightedItem = item;
            }
        }
    },

    onUnHighlightEvent: function(e) {
        var me = this,
            chart = me.chart,
            xy = chart.getEventXY(e),
            highlightedItem;
        chart.series.each(function(series) {
            highlightedItem = series.highlightedItem;
            if (highlightedItem && highlightedItem !== series.getItemForPoint(xy[0], xy[1])) {
                series.unHighlightItem();
                delete series.highlightedItem;
            }
        });
    }

});

Ext.chart.interactions.Manager.registerType('itemhighlight', Ext.chart.interactions.ItemHighlight);

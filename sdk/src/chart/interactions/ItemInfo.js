/**
 * @class Ext.chart.interactions.ItemInfo
 * @extends Ext.util.Observable
 *
 * The ItemInfo interaction allows displaying detailed information about a series data
 * point in a popup panel.
 *
 * To attach this interaction to a chart, include an entry in the chart's
 * {@link Ext.chart.Chart#interactions interactions} config with the `iteminfo` type:
 *
 *     new Ext.chart.Chart({
 *         renderTo: Ext.getBody(),
 *         width: 800,
 *         height: 600,
 *         store: store1,
 *         axes: [ ...some axes options... ],
 *         series: [ ...some series options... ],
 *         interactions: [{
 *             type: 'iteminfo',
 *             listeners: {
 *                 show: function(me, item, panel) {
 *                     panel.update('Stock Price: $' + item.storeItem.get('price'));
 *                 }
 *             }
 *         }]
 *     });

 * @author Nicolas Garcia Belmonte <nicolas@sencha.com>
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.chart.interactions.ItemInfo = Ext.extend(Ext.chart.interactions.Abstract, {

    /**
     * @cfg {String} gesture
     * Defines the gesture type that should trigger the item info panel to be displayed.
     * Defaults to `tap`.
     */
    gesture: 'tap',

    /**
     * @cfg {Object} panel
     * An optional set of configuration overrides for the {@link Ext.Panel} that gets
     * displayed. This object will be merged with the default panel configuration.
     */

    constructor: function(config) {
        var me = this;

        me.addEvents(
            /**
             * @event show
             * Fires when the info panel is shown.
             * @param {Ext.chart.interactions.ItemInfo} this The interaction instance
             * @param {Object} item The item whose info is being displayed
             * @param {Ext.Panel} panel The panel for displaying the info
             */
            'show'
        );

        Ext.chart.interactions.ItemInfo.superclass.constructor.call(me, config);
    },

    getPanel: function() {
        var me = this,
            panel = me.infoPanel;
        if (!panel) {
            panel = me.infoPanel = new Ext.Panel(Ext.apply({
                floating: true,
                modal: true,
                centered: true,
                width: 250,
                styleHtmlContent: true,
                scroll: 'vertical',
                dockedItems: [{
                    dock: 'top',
                    xtype: 'toolbar',
                    title: 'Item Detail'
                }],
                stopMaskTapEvent: false,
                fullscreen: false,
                listeners: {
                    hide: me.reset,
                    scope: me
                }
            },
            me.panel));
        }
        return panel;
    },

    onGesture: function(e) {
        var me = this,
            item = me.getItemForEvent(e),
            panel;
        if (item) {
            me.item = item;
            item.series.highlightItem(item);
            panel = me.getPanel();
            me.fireEvent('show', me, item, panel);
            panel.show('pop');
        }
    },

    reset: function() {
        var me = this,
            item = me.item;
        if (item) {
            item.series.unHighlightItem(item);
            delete me.item;
        }
    }

});

Ext.chart.interactions.Manager.registerType('iteminfo', Ext.chart.interactions.ItemInfo);

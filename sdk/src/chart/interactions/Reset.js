/**
 * @class Ext.chart.interactions.Reset
 * @extends Ext.chart.interactions.Abstract
 *
 * The Reset interaction allows resetting of all previous user interactions with
 * the chart. By default the reset is triggered by a double-tap on the empty chart
 * area; to customize the event use the {@link #event} config.
 *
 * To attach this interaction to a chart, include an entry in the chart's
 * {@link Ext.chart.Chart#interactions interactions} config with the `reset` type:
 *
 *     new Ext.chart.Chart({
 *         renderTo: Ext.getBody(),
 *         width: 800,
 *         height: 600,
 *         store: store1,
 *         axes: [ ...some axes options... ],
 *         series: [ ...some series options... ],
 *         interactions: [{
 *             type: 'reset'
 *         }]
 *     });

 * @author Nicolas Garcia Belmonte <nicolas@sencha.com>
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.chart.interactions.Reset = Ext.extend(Ext.chart.interactions.Abstract, {

    /**
     * @cfg {String} gesture
     * Defines the gesture type that should trigger the chart reset. Gestures that occur on a series
     * item will be ignored. Defaults to `doubletap`.
     */
    gesture: 'doubletap',

    /**
     * @cfg {Boolean} confirm
     * If set to `true`, a dialog will be presented to the user to confirm that they want to reset
     * the chart. Defaults to `false`.
     */

    /**
     * @cfg {String} confirmTitle
     * Specifies the title displayed in the confirmation dialog, if {@link #confirm} is `true`.
     * Defaults to `'Reset'`
     */
    confirmTitle: 'Reset',

    /**
     * @cfg {String} confirmText
     * Specifies the text displayed in the confirmation dialog, if {@link #confirm} is `true`.
     * Defaults to `'Reset the chart?'`
     */
    confirmText: 'Reset the chart?',

    onGesture: function(e) {
        var me = this,
            chart = me.chart;
        if (!me.getItemForEvent(e)) {
            if (me.confirm) {
                Ext.Msg.confirm(me.confirmTitle, me.confirmText, function(button) {
                    if (button === 'yes') {
                        chart.reset();
                    }
                });
            } else {
                chart.reset();
            }
        }
    }
});

Ext.chart.interactions.Manager.registerType('reset', Ext.chart.interactions.Reset);

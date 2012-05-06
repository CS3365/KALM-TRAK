/**
 * @class Ext.chart.interactions.Abstract
 * @extends Ext.util.Observable
 *
 * Defines a common abstract parent class for all interactions.
 *
 * @author Jason Johnston <jason@sencha.com>
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.chart.interactions.Abstract = Ext.extend(Ext.util.Observable, {

    /**
     * @cfg {String} gesture
     * Specifies which gesture type should be used for starting the interaction.
     * Defaults to `tap`.
     */
    gesture: 'tap',

    constructor: function(config) {
        var me = this;
        Ext.chart.interactions.Abstract.superclass.constructor.call(me, config);
        me.ownerCt = me.chart;
    },

    /**
     * @protected
     * A method to be implemented by subclasses where all event attachment should occur.
     */
    initEvents: function() {
        var me = this;
        
        //check whether we're using drag events then initialize them in the surface.
        if (me.gesture && me.gesture == 'drag' || me.panGesture && me.panGesture == 'drag') {
            me.chart.getSurface('events').initializeDragEvents();
        }
        
        me.addChartListener(me.gesture, me.onGesture, me);
    },

    /**
     * @protected
     * Placeholder method.
     */
    onGesture: Ext.emptyFn,

    /**
     * @protected Find and return a single series item corresponding to the given event,
     * or null if no matching item is found.
     * @param {Event} e
     * @return {Object} the item object or null if none found.
     */
    getItemForEvent: function(e) {
        var me = this,
            chart = me.chart,
            chartXY = chart.getEventXY(e);
        return chart.getItemForPoint(chartXY[0], chartXY[1]);
    },

    /**
     * @protected Find and return all series items corresponding to the given event.
     * @param {Event} e
     * @return {Array} array of matching item objects
     */
    getItemsForEvent: function(e) {
        var me = this,
            chart = me.chart,
            chartXY = chart.getEventXY(e);
        return chart.getItemsForPoint(chartXY[0], chartXY[1]);
    },

    /**
     * @protected Add an event listener to this interaction's chart. All ineteraction event listeners
     * should be attached using this method, since it adds logic for honoring event locks.
     * @param name
     * @param fn
     * @param scope
     * @param opts
     */
    addChartListener: function(name, fn, scope, opts) {
        var me = this,
            locks = me.getLocks();
        me.chart.on(
            name,
            // wrap the handler so it does not fire if the event is locked by another interaction
            function() {
                if (!(name in locks) || locks[name] === me) {
                    fn.apply(this, arguments);
                }
            },
            scope,
            opts
        );
    },

    lockEvents: function() {
        var me = this,
            locks = me.getLocks(),
            args = arguments,
            i = args.length;
        while (i--) {
            locks[args[i]] = me;
        }
    },

    unlockEvents: function() {
        var locks = this.getLocks(),
            args = arguments,
            i = args.length;
        while (i--) {
            delete locks[args[i]];
        }
    },

    getLocks: function() {
        var chart = this.chart;
        return chart.lockedEvents || (chart.lockedEvents = {});
    },

    isMultiTouch: function() {
        return !(Ext.is.MultiTouch === false || (Ext.is.Android && !Ext.is.hasOwnProperty('MultiTouch')) || Ext.is.Desktop);
    },

    initializeDefaults: Ext.emptyFn,

    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/

    //filled by the constructor.
    ownerCt: null,

    getItemId: function() {
        return this.id || (this.id = Ext.id());
    },

    initCls: function() {
        return (this.cls || '').split(' ');
    },

    isXType: function(xtype) {
        return xtype === 'interaction';
    },

    getRefItems: function(deep) {
        return [];
    }
});

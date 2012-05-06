Ext.ns('Ext.chart.series');

/**
 * @class Ext.chart.series.ItemEvents
 *
 * This series mixin defines events that occur on a particular series item, and adds default
 * event handlers for detecting and firing those item interaction events.
 *
 * @author Jason Johnston <jason@sencha.com>
 * @docauthor Jason Johnston <jason@sencha.com>
 */
(function() {
    function createEventRelayMethod(name) {
        return function(e) {
            var me = this,
                item = me.itemForEvent(e);
            if (item) {
                me.fireEvent(name, me, item, e);
            }
        }
    }

    Ext.chart.series.ItemEvents = Ext.extend(Object, {

        constructor: function() {
            var me = this,
                itemEventNames = Ext.chart.series.ItemEvents.itemEventNames;
            me.addEvents.apply(me, itemEventNames);
            me.enableBubble(itemEventNames);
        },

        initEvents: function() {
            var me = this;
            me.chart.on({
                scope: me,
                mousemove: me.onMouseMove,
                mouseup: me.onMouseUp,
                mousedown: me.onMouseDown,
                click: me.onClick,
                doubleclick: me.onDoubleClick,
                tap: me.onTap,
                tapstart: me.onTapStart,
                tapend: me.onTapEnd,
                tapcancel: me.onTapCancel,
                taphold: me.onTapHold,
                doubletap: me.onDoubleTap,
                singletap: me.onSingleTap,
                touchstart: me.onTouchStart,
                touchmove: me.onTouchMove,
                touchend: me.onTouchEnd,
                dragstart: me.onDragStart,
                drag: me.onDrag,
                dragend: me.onDragEnd,
                pinchstart: me.onPinchStart,
                pinch: me.onPinch,
                pinchend: me.onPinchEnd,
                swipe: me.onSwipe
            });
        },

        itemForEvent: function(e) {
            var me = this,
                chartXY = me.chart.getEventXY(e);
            return me.getItemForPoint(chartXY[0], chartXY[1]);
        },

        getBubbleTarget: function() {
            return this.chart;
        },

        onMouseMove: function(e) {
            var me = this,
                lastItem = me.lastOverItem,
                item = me.itemForEvent(e);
            if (lastItem && item !== lastItem) {
                me.fireEvent('itemmouseout', me, lastItem, e);
                delete me.lastOverItem;
            }
            if (item) {
                me.fireEvent('itemmousemove', me, item, e);
            }
            if (item && item !== lastItem) {
                me.fireEvent('itemmouseover', me, item, e);
                me.lastOverItem = item;
            }
        },

        // Events directly relayed when on an item:
        onMouseUp: createEventRelayMethod('itemmouseup'),
        onMouseDown: createEventRelayMethod('itemmousedown'),
        onClick: createEventRelayMethod('itemclick'),
        onDoubleClick: createEventRelayMethod('itemdoubleclick'),
        onTap: createEventRelayMethod('itemtap'),
        onTapStart: createEventRelayMethod('itemtapstart'),
        onTapEnd: createEventRelayMethod('itemtapend'),
        onTapCancel: createEventRelayMethod('itemtapcancel'),
        onTapHold: createEventRelayMethod('itemtaphold'),
        onDoubleTap: createEventRelayMethod('itemdoubletap'),
        onSingleTap: createEventRelayMethod('itemsingletap'),
        onTouchStart: createEventRelayMethod('itemtouchstart'),
        onTouchMove: createEventRelayMethod('itemtouchmove'),
        onTouchEnd: createEventRelayMethod('itemtouchend'),
        onDragStart: createEventRelayMethod('itemdragstart'),
        onDrag: createEventRelayMethod('itemdrag'),
        onDragEnd: createEventRelayMethod('itemdragend'),
        onPinchStart: createEventRelayMethod('itempinchstart'),
        onPinch: createEventRelayMethod('itempinch'),
        onPinchEnd: createEventRelayMethod('itempinchend'),
        onSwipe: createEventRelayMethod('itemswipe')

    });


    Ext.chart.series.ItemEvents.itemEventNames = [
        /**
         * @event itemmousemove
         * Fires when the mouse is moved on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemmousemove',
        /**
         * @event itemmouseup
         * Fires when a mouseup event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemmouseup',
        /**
         * @event itemmousedown
         * Fires when a mousedown event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemmousedown',
        /**
         * @event itemmouseover
         * Fires when the mouse enters a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemmouseover',
        /**
         * @event itemmouseout
         * Fires when the mouse exits a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemmouseout',
        /**
         * @event itemclick
         * Fires when a click event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemclick',
        /**
         * @event itemdoubleclick
         * Fires when a doubleclick event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemdoubleclick',
        /**
         * @event itemtap
         * Fires when a tap event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemtap',
        /**
         * @event itemtapstart
         * Fires when a tapstart event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemtapstart',
        /**
         * @event itemtapend
         * Fires when a tapend event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemtapend',
        /**
         * @event itemtapcancel
         * Fires when a tapcancel event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemtapcancel',
        /**
         * @event itemtaphold
         * Fires when a taphold event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemtaphold',
        /**
         * @event itemdoubletap
         * Fires when a doubletap event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemdoubletap',
        /**
         * @event itemsingletap
         * Fires when a singletap event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemsingletap',
        /**
         * @event itemtouchstart
         * Fires when a touchstart event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemtouchstart',
        /**
         * @event itemtouchmove
         * Fires when a touchmove event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemtouchmove',
        /**
         * @event itemtouchend
         * Fires when a touchend event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemtouchend',
        /**
         * @event itemdragstart
         * Fires when a dragstart event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemdragstart',
        /**
         * @event itemdrag
         * Fires when a drag event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemdrag',
        /**
         * @event itemdragend
         * Fires when a dragend event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemdragend',
        /**
         * @event itempinchstart
         * Fires when a pinchstart event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itempinchstart',
        /**
         * @event itempinch
         * Fires when a pinch event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itempinch',
        /**
         * @event itempinchend
         * Fires when a pinchend event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itempinchend',
        /**
         * @event itemswipe
         * Fires when a swipe event occurs on a series item.
         * @param {Ext.chart.series.Series} series
         * @param {Object} item
         * @param {Event} event
         */
        'itemswipe'

        // TODO itemtouchenter, itemtouchleave?
    ];

})();
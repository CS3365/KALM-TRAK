/**
 * @class Ext.fx.Manager
 * Animation Manager which keeps track of all current animations and manages them on a frame by frame basis.
 * @private
 * @singleton
 */

Ext.fx.Manager = {

    constructor: function() {
        var me = this;
        me.items = new Ext.util.MixedCollection();
        me.addEvents(
            /**
             * @event framebegin
             * Fires before the frame starts.
             */
            'framebegin',
             /**
              * @event frameend
              * Fires when the frame ends.
              */
            'frameend'
        );
        Ext.util.Observable.constructor.call(me);
        Ext.fx.Queue.constructor.call(me);
    },

    /**
     * @cfg {Number} interval Default interval in miliseconds to calculate each frame.  Defaults to 16ms (~60fps)
     */
    interval: 32,

    // @private Target factory
    createTarget: function(target) {
        var me = this,
            targetObj;

        if (Ext.isObject(target)) {
            // Draw Sprite
            if (target.isSprite) {
                targetObj = new Ext.fx.target.Sprite(target);
            }
            // Draw Sprite Composite
            else if (target.isCompositeSprite) {
                targetObj = new Ext.fx.target.CompositeSprite(target);
            }
            else if (target.isAnimTarget) {
                return target;
            }
            else {
                return null;
            }
            me.targets.add(targetObj);
            return targetObj;
        }
        else {
            return null;
        }
    },

    /**
     * Add an Anim to the manager. This is done automatically when an Anim instance is created.
     * @param {Ext.fx.Anim} anim
     */
    addAnim: function(anim) {
        var me = this,
            items = me.items,
            task = me.task;

        items.add(anim);

        // Start the timer if not already running
        if (!task && items.length) {
            me.task = setInterval(me.runner, me.interval);
        }
    },

    /**
     * Remove an Anim from the manager. This is done automatically when an Anim ends.
     * @param {Ext.fx.Anim} anim
     */
    removeAnim: function(anim) {
        var me = this,
            items = me.items,
            task = me.task;

        items.remove(anim);

        // Stop the timer if there are no more managed Anims
        if (task && !items.length) {
            clearInterval(task);
            delete me.task;
        }
    },

    /**
     * @private
     * Filter function to determine which animations need to be started
     */
    startingFilter: function(o) {
        return o.paused === false && o.running === false && o.iterations > 0;
    },

    /**
     * @private
     * Filter function to determine which animations are still running
     */
    runningFilter: function(o) {
        return o.paused === false && o.running === true && o.isAnimator !== true;
    },

    /**
     * @private
     * Runner function being called each frame
     */
    runner: function() {
        var me = Ext.fx.Manager,
            items = me.items;
        if (!me.running) {
            me.fireEvent('framebegin');
            me.running = true;
            me.targetData = {};
            me.targetArr = {};

            // Single timestamp for all animations this interval
            me.timestamp = new Date();

            // Start any items not current running
            items.filterBy(me.startingFilter).each(me.startAnim, me);

            // Build the new attributes to be applied for all targets in this frame
            items.filterBy(me.runningFilter).each(me.runAnim, me);

            // Apply all the pending changes to their targets
            me.applyPendingAttrs();
            me.fireEvent('frameend');
            me.running = false;
        }
    },

    /**
     * @private
     * Start the individual animation (initialization)
     */
    startAnim: function(anim) {
        anim.start(this.timestamp);
    },

    /**
     * @private
     * Run the individual animation for this frame
     */
    runAnim: function(anim) {
        if (!anim) {
            return;
        }
        var me = this,
            targetId = anim.target.getId(),
            elapsedTime = me.timestamp - anim.startTime;

        this.collectTargetData(anim, elapsedTime);

        // For JS animation, trigger the lastFrame handler if this is the final frame
        if (elapsedTime >= anim.duration) {
            me.applyPendingAttrs(true);
            delete me.targetData[targetId];
            delete me.targetArr[targetId];
            anim.lastFrame();
        }
    },

    /**
     * Collect target attributes for the given Anim object at the given timestamp
     * @param {Ext.fx.Anim} anim The Anim instance
     * @param {Number} elapsedTime Time after the anim's start time
     */
    collectTargetData: function(anim, elapsedTime) {
        var me = this,
            targetId = anim.target.getId(),
            targetData = me.targetData[targetId],
            data;

        if (!targetData) {
            targetData = me.targetData[targetId] = [];
            me.targetArr[targetId] = anim.target;
        }

        data = {
            duration: anim.duration,
            easing: anim.easing,
            attrs: {}
        };
        Ext.apply(data.attrs, anim.runAnim(elapsedTime));
        targetData.push(data);
    },

    /**
     * @private
     * Apply all pending attribute changes to their targets
     */
    applyPendingAttrs: function(isLastFrame) {
        var targetData = this.targetData,
            targetArr = this.targetArr,
            targetId;
        for (targetId in targetData) {
            if (targetData.hasOwnProperty(targetId)) {
                targetArr[targetId].setAttr(targetData[targetId], false, isLastFrame);
            }
        }
    }
};

Ext.applyIf(Ext.fx.Manager, Ext.fx.Queue);
Ext.applyIf(Ext.fx.Manager, Ext.util.Observable.prototype);
Ext.fx.Manager.constructor();

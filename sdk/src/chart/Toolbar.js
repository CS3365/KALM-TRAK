/**
 * @class Ext.chart.Toolbar
 * @extends Ext.Container
 *
 * The chart toolbar is a container that is docked to one side of the chart, that is intended
 * to hold buttons for performing user actions without taking up valuable screen real estate
 * from the chart. This is used internally for things like the button for showing the legend
 * when the legend is {@link Ext.chart.Legend#dock docked}, or the
 * {@link Ext.chart.interactions.PanZoom pan/zoom interaction}'s button for switching between
 * pan and zoom mode in non-multi-touch environments.
 *
 * An instance of this class is created automatically by the chart when it is needed; authors
 * should not need to instantiate it directly. To customize the configuration of the toolbar,
 * specify the chart's {@link Ext.chart.Chart#toolbar toolbar} config.
 *
 * @author Jason Johnston <jason@sencha.com>
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.chart.Toolbar = Ext.extend(Ext.Container, {
    isChartToolbar: true,

    defaultType: 'button',

    baseCls: Ext.baseCSSPrefix + 'chart-toolbar',

    /**
     * @cfg {String} position
     * The position at which the toolbar should be docked in relation to the chart. Can be one of:
     *
     * -  "top" - positions the legend centered at the top of the chart
     * -  "bottom" - positions the legend centered at the bottom of the chart
     * -  "left" - positions the legend centered on the left side of the chart
     * -  "right" - positions the legend centered on the right side of the chart
     *
     *     toolbar: {
     *         position: 'right'
     *     }
     *
     * In addition, you can specify different positionss based on the orientation of the browser viewport,
     * for instance you might want to put the toolbar on the right in landscape orientation but on the bottom in
     * portrait orientation. To achieve this, you can set the `position` config to an Object with `portrait` and
     * `landscape` properties, and set the value of those properties to one of the recognized value types described
     * above. For example, the following config will put the toolbar on the right in landscape and on the bottom
     * in portrait:
     *
     *     toolbar:
     *         position: {
     *             landscape: 'right',
     *             portrait: 'bottom'
     *         }
     *     }
     *
     * If not specified, the position will default to the configured position of the chart legend (if
     * a legend is configured), or 'bottom' otherwise.
     */


    /**
     * Returns whether the toolbar is configured with orientation-specific positions.
     * @return {Boolean}
     */
    isOrientationSpecific: function() {
        var position = this.position;
        return (position && Ext.isObject(position) && 'portrait' in position);
    },

    /**
     * Get the target position of the toolbar, after resolving any orientation-specific configs.
     * In most cases this method should be used rather than reading the `position` property directly.
     * @return {String} The position config value
     */
    getPosition: function() {
        var me = this,
            position = me.position,
            legend = me.chart.legend;

        if (!position && legend) {
            // Fall back to legend position if legend is present
            position = legend.getPosition();
        }
        else if (me.isOrientationSpecific()) {
            // Grab orientation-specific config if specified
            position = position[Ext.getOrientation()];
        }
        if (!position || !Ext.isString(position)) {
            // Catchall fallback
            position = 'bottom';
        }
        return position;
    },

    /**
     * @protected
     * Updates the toolbar to match the current viewport orientation.
     */
    orient: function() {
        var me = this,
            orientation = Ext.getOrientation();
        if (!me.rendered) {
            me.render(me.chart.el);
        }
        if (orientation !== me.lastOrientation) {
            me.el.dom.setAttribute('data-side', me.getPosition());
            me.lastOrientation = orientation;
        }
    }

});
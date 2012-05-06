/**
 * @class Ext.chart.axis.Abstract
 */
Ext.ns('Ext.chart.axis');
Ext.chart.axis.Abstract = Ext.extend(Ext.util.Observable, {

    constructor: function(config) {
        config = config || {};

        var me = this,
            pos = config.position || 'left';

        pos = pos.charAt(0).toUpperCase() + pos.substring(1);
        Ext.apply(me, config);
        me.fields = [].concat(me.fields);
        me.labels = [];
        me.getId();
        me.labelGroup = me.getSurface().getGroup(me.axisId + "-labels");

        me.titleStyle = new Ext.chart.theme.TitleStyle();
        Ext.apply(me.titleStyle.style, config.labelTitle || {});

        me.labelStyle = new Ext.chart.theme.LabelStyle();
        Ext.apply(me.labelStyle.style, config.label || {});

        me.gridStyle = new Ext.chart.theme.GridStyle();
        Ext.apply(me.gridStyle.style, config.grid || {});

        if (config.grid && config.grid.odd) {
            me.gridStyle.oddStyle.style = Ext.apply(me.gridStyle.oddStyle.style || {},
            config.grid.odd);
        }

        if (config.grid && config.grid.even) {
            me.gridStyle.evenStyle.style = Ext.apply(me.gridStyle.evenStyle.style || {},
            config.grid.even);
        }

        Ext.chart.Transformable.prototype.constructor.call(me);
    },

    grid: false,
    steps: 10,
    x: 0,
    y: 0,
    minValue: 0,
    maxValue: 0,

    getId: function() {
        return this.axisId || (this.axisId = Ext.id(null, 'ext-axis-'));
    },

    /*
      Called to process a view i.e to make aggregation and filtering over
      a store creating a substore to be used to render the axis. Since many axes
      may do different things on the data and we want the final result of all these
      operations to be rendered we need to call processView on all axes before drawing
      them.
    */
    processView: Ext.emptyFn,

    drawAxis: Ext.emptyFn,

    /**
     * Get the {@link Ext.draw.Surface} instance for this axis.
     * @return {Ext.draw.Surface}
     */
    getSurface: function() {
        var me = this,
            surface = me.surface,
            chart = me.chart;
        if (!surface) {
            surface = me.surface = chart.getSurface(me.position + 'Axis');
            surface.el.setStyle('zIndex', chart.surfaceZIndexes.axis);
        }
        return surface;
    },

    /**
     * Hides all axis labels.
     */
    hideLabels: function() {
        this.labelGroup.hide();
    },

    /**
     * @private update the position/size of the axis surface. By default we set it to the
     * full chart size; subclasses can change this for custom clipping size.
     */
    updateSurfaceBox: function() {
        var me = this,
            surface = me.getSurface(),
            chart = me.chart;
        surface.el.setTopLeft(0, 0);
        surface.setSize(chart.curWidth, chart.curHeight);
    },

    getTransformableSurfaces: function() {
        return [this.getSurface()];
    },

    /**
     * Reset the axis to its original state, before any user interaction.
     */
    reset: function() {
        this.clearTransform();
    },

    /**
     * Invokes renderFrame on this axis's surface(s)
     */
    renderFrame: function() {
        this.getSurface().renderFrame();
    },


    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/

    //filled by the constructor.
    ownerCt: null,

    getItemId: function() {
        return this.el && this.el.id || this.id || null;
    },

    initCls: function() {
        return (this.cls || '').split(' ');
    },

    isXType: function(xtype) {
        return xtype === 'axis';
    },

    getRefItems: function(deep) {
        var me = this,
            ans = [];

        if (me.labelStyle) {
            ans.push(me.labelStyle);
        }

        if (me.titleStyle) {
            ans.push(me.titleStyle);
        }

        if (me.gridStyle) {
            ans.push(me.gridStyle);
            ans.push(me.gridStyle.oddStyle);
            ans.push(me.gridStyle.evenStyle);
        }

        return ans;
    }
});

Ext.applyIf(Ext.chart.axis.Abstract.prototype, Ext.chart.Transformable.prototype);


/**
 * @class Ext.chart.theme.GridStyle
 * @ignore
 *
 * @xtype marker
 */
Ext.ns('Ext.chart.theme');

Ext.chart.theme.GridStyle = Ext.extend(Ext.chart.theme.Style, {
    
    constructor: function(config) {
        Ext.chart.theme.GridStyle.superclass.constructor.call(this, config);
        this.style  = false;
        this.oddStyle = new Ext.chart.theme.OddStyle();
        this.evenStyle = new Ext.chart.theme.EvenStyle();
    },
    
    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/
    
    isXType: function(xtype) {
        return xtype === 'grid';
    },
    
    getRefItems: function(deep) {
        return [ this.oddStyle, this.evenStyle ];
    }
});


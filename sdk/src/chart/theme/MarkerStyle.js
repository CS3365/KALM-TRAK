/**
 * @class Ext.chart.theme.MarkerStyle
 * @ignore
 *
 * @xtype marker
 */
Ext.ns('Ext.chart.theme');

Ext.chart.theme.MarkerStyle = Ext.extend(Ext.chart.theme.Style, {
    
    constructor: function(config) {
        Ext.chart.theme.MarkerStyle.superclass.constructor.call(this, config);    
    },
    
    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/
    
    isXType: function(xtype) {
        return xtype === 'marker';
    }
});

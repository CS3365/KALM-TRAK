/**
 * @class Ext.chart.theme.LabelStyle
 * @ignore
 *
 * @xtype label
 */
Ext.ns('Ext.chart.theme');

Ext.chart.theme.LabelStyle = Ext.extend(Ext.chart.theme.Style, {
    
    constructor: function(config) {
        Ext.chart.theme.LabelStyle.superclass.constructor.call(this, config);    
    },
    
    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/
    
    isXType: function(xtype) {
        return xtype === 'label';
    }
});

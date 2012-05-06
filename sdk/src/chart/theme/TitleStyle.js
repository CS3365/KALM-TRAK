/**
 * @class Ext.chart.theme.TitleStyle
 * @ignore
 *
 * @xtype title
 */
Ext.ns('Ext.chart.theme');

Ext.chart.theme.TitleStyle = Ext.extend(Ext.chart.theme.Style, {
    
    constructor: function(config) {
        Ext.chart.theme.TitleStyle.superclass.constructor.call(this, config);
    },
    
    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/
    
    isXType: function(xtype) {
        return xtype === 'title';
    }
});

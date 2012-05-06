/**
 * @class Ext.chart.theme.OddStyle
 * @ignore
 *
 * @xtype odd
 */
Ext.ns('Ext.chart.theme');

Ext.chart.theme.OddStyle = Ext.extend(Ext.chart.theme.Style, {
    
    constructor: function(config) {
        Ext.chart.theme.OddStyle.superclass.constructor.call(this, config);
        this.style = false;
    },
    
    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/
    
    isXType: function(xtype) {
        return xtype === 'odd';
    }
});


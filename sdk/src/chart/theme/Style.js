/**
 * @class Ext.chart.theme.Style
 * @ignore
 */
Ext.ns('Ext.chart.theme');

Ext.chart.theme.Style = Ext.extend(Object, {
    
    constructor: function(config) {
        this.style = {};
        this.themeStyle = {};
        
        Ext.apply(this.style, config); 
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
        return xtype === '';
    },
    
    getRefItems: function(deep) {
        return [];
    }    
});

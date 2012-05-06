/**
 * @class Ext.layout.component.Draw
 * @extends Ext.layout.component.Component
 * @private
 *
 */

Ext.layout.DrawLayout = Ext.extend(Ext.layout.AutoComponentLayout, {
    type: 'draw',

    onLayout : function(width, height) {
        this.owner.surface.setSize(width, height);
        Ext.layout.DrawLayout.superclass.onLayout.apply(this, arguments);
    }
});
Ext.regLayout('draw', Ext.layout.DrawLayout);

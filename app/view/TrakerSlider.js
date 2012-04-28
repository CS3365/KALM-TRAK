Ext.define('KALMTRAK.view.TrakerSlider', {
  extend: 'Ext.field.Slider',
  xtype: 'ktslider',
    items: [
        {
            xtype: 'sliderfield',
            label: 'ktSlider',
            value: 0,
            minValue: 0,
            maxValue: 100
        }
    ]
});
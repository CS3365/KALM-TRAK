Ext.define('KALMTRAK.view.ScheduledTrakers', {
  extend: 'Ext.form.Field',
  xtype: 'scheduledtrakerfield',

  requires: [
    'KALMTRAK.view.ScheduledTrakerStatus'
  ],

  config: {
    isField: false,
    label: 'Set TRAKers',
    component: {
      xtype: 'container',
      baseCls: 'x-form-field',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: [
        {
          xtype: 'button',
          ui: 'confirm',
          iconCls: 'add',
          iconMask: 'true',
          handler: function() {
            var pt = this.getParent();
            pt.insert(
              pt.getItems().length-1,
              {
                xtype: 'ktschedtrakerstatus'
              }
            );
          }
        }
      ]
    }
  }
});

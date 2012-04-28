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
        {xtype: 'ktschedtrakerstatus'},
        {xtype: 'ktschedtrakerstatus'},
        {xtype: 'ktschedtrakerstatus'},
        {
          xtype: 'button',
          ui: 'confirm',
          iconCls: 'add',
          iconMask: 'true'
        }
      ]
    }
  }
});

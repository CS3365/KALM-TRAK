Ext.define('KALMTRAK.view.ScheduledTrakers', {
  extend: 'Ext.form.Field',
  xtype: 'scheduledtrakerfield',

  requires: [
    'KALMTRAK.view.TrakerStatus'
  ],

  config: {
    isField: false,
    label: 'Set TRAKers',
    component: {
      xtype: 'container',
      baseCls: 'x-form-field',
      layout: {
        type: 'vbox',
        align: 'top'
      },
      items: [
        {xtype: 'ktstatus'},
        {xtype: 'ktstatus'},
        {xtype: 'ktstatus'}
      ]
    }
  }
});

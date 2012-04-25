Ext.define("KALMTRAK.view.ScheduledEvent", {
  extend: 'Ext.Container',
  xtype: 'scheduledevent',

  requires: [
    'KALMTRAK.view.ScheduledTrakers'
  ],

  config: {
    items: [
      {
        docked: 'top',
        baseCls: 'x-form-fieldset-title',
        layout: {
          type: 'hbox',
          align: 'center'
        },
        items: [
          {
            html: 'Scheduled Event Title'
          }, {
            xtype: 'spacer'
          }, {
            xtype: 'button',
            ui: 'action',
            iconCls: 'doc_delete',
            iconMask: true
          }
        ]
      },
      // field items
      {
        xtype: 'textfield',
        label: 'label'
      }, {
        xtype: 'scheduledtrakerfield'
      }
    ]
  }
});

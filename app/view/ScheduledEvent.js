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
            html: 'Scheduled Event'
          }, {
            xtype: 'spacer'
          }, {
            xtype: 'button',
            ui: 'decline',
            iconCls: 'doc_delete',
            iconMask: true,
            handler: function() {
              Ext.getCmp('ScheduledEventsList').remove(this.getParent().getParent());
            }
          }
        ]
      },
      // field items
      {
        xtype: 'datetimepickerfield',
        label: 'Event Time',
        name: 'evtTime',
        value: new Date(),
        dateTimeFormat: 'g:iA',
        picker: {
          minuteInterval: 1,
          ampm: true,
          slotOrder: ['hour','minute','ampm']
        }
      }, {
        xtype: 'scheduledtrakerfield'
      }
    ]
  }
});

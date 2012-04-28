Ext.define("KALMTRAK.view.Scheduler", {
  extend: "Ext.form.Panel",
  xtype: 'ktscheduler',
  requires: [
    'Ext.ux.field.DateTimePicker',
    'Ext.form.Panel',
    'KALMTRAK.view.WeekdayChooser',
    'KALMTRAK.view.ScheduledEventsList'
  ],
  config: {
    title: 'Scheduler',
    items: [
      {
        xtype: 'fieldset',
        title: 'Duration',
        items: [
          {
            xtype: 'datetimepickerfield',
            label: 'Begin',
            name: 'schedBegin',
            value: new Date(),
            dateTimeFormat: 'm/d/Y g:iA',
            picker: {
              yearFrom: 2010,
              yearTo: 2030,
              minuteInterval: 5,
              ampm: true,
              slotOrder: ['month', 'day', 'year','hour','minute','ampm']
            }
          }, {
            xtype: 'datetimepickerfield',
            label: 'End',
            name: 'schedEnd',
            value: new Date(),
            dateTimeFormat: 'm/d/Y g:iA',
            picker: {
              yearFrom: 2010,
              yearTo: 2030,
              minuteInterval: 5,
              ampm: true,
              slotOrder: ['month', 'day', 'year','hour','minute','ampm']
            }
          }, {
            xtype: 'weekdaychooserfield',
            label: 'Days of Week',
            name: 'dow'
          }
        ]
      }, {
        xtype: 'scheduledeventslist'
      }
    ]
  }
});

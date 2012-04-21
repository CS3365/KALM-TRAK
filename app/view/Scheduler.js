Ext.define("KALMTRAK.view.Scheduler", {
  extend: "Ext.Panel",
  xtype: 'ktscheduler',
  requires: [
    'KALMTRAK.view.TimePicker',
    'Ext.ux.field.DateTimePicker'
  ],

  config: {
    items: [
      {
        xtype: 'fieldset',
        title: 'Duration',
        instructions: 'duration instructions in app/view/scheduler.js',
        items: [
          {
            //xtype: 'kttimepicker',
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
            //xtype: 'kttimepicker',
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
          }
        ]
      }
    ]
  }
});

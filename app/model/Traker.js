Ext.define('KALMTRAK.model.Traker', {
  extend: 'Ext.data.Model',
  config: {
    fields: [ 'tid','aid','name','type','status','avgPowerUsage','avgHoursUsage','stdevHoursUsage','avgBlocks'],
    validations: [
            {type: 'presence',  field: 'tid'},
			{type: 'length',  field: 'tid', max:10},
            {type: 'presence',  field: 'aid'},
            {type: 'presence', field: 'name'},
            {type: 'presence', field: 'type'},
            {type: 'presence', field: 'status'},
			{type: 'presence',  field: 'avgPowerUsage'},
            {type: 'presence', field: 'avgHoursUsage'},
            {type: 'presence', field: 'stdevHoursUsage'},
            {type: 'presence', field: 'avgBlocks'}
        ]
  }
});

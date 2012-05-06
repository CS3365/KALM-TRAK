Ext.define('KALMTRAK.model.Power', {
  extend: 'Ext.data.Model',

  config: {
    fields: [
      {name: 'name', type: 'string'},
      {name: 'power', type: 'float'},
      {name: 'day', type: 'date'},
      {name: 'hour', type: 'int'}
    ]
  }
});

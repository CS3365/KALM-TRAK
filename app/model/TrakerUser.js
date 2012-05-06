Ext.define('KALMTRAK.model.User, {
  extend: 'Ext.data.Model',
  config: {
    fields: [
      {name: 'username', type: 'string'},
	  {name: 'password', type: 'string'}
    ],
	validations: [
		{type: 'format',  field: 'username', matcher: /[a-zA-Z0-9]+/},
		{type: 'format',  field: 'password', matcher: /[a-zA-Z0-9]+/},
		{type: 'length', field: 'username', min: 6},
		{type: 'length', field: 'password', min: 6}
	]
  }
});

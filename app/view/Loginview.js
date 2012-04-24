Ext.define("KALMTRAK.view.Loginview", {
  extend: "Ext.form.Panel",
  xtype: 'ktlogin',
  requires: [
    'Ext.form.Panel'
  ],
  config: {
    title: 'Login',
    items: [
		{
		 xtype: 'fieldset',
         title: 'KALMTRAK Login',
         items: [
              {
                xtype: 'textfield',
                name : 'name',
                label: 'Username:'
              },
              {
                xtype: 'passwordfield',
                name : 'password',
                label: 'Password:'
              }
            ]
		}
	]}
});
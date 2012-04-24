
Ext.define("KALMTRAK.view.Main", {
  extend: 'Ext.tab.Panel',
  requires: [
    'Ext.TitleBar',
    'KALMTRAK.view.Scheduler'
	'KALMTRAK.view.Loginview'
  ],

  config: {
    tabBarPosition: 'bottom',
    items: [
	  {
        title: 'Login',
        iconCls: 'star',
		layout: 'fit',
        items: {		 
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
      },
      {
        title: 'Scheduler',
        iconCls: 'calendar2',
        layout: 'fit',
        items: {xtype:'ktscheduler'}
      }
    ]
  }
});

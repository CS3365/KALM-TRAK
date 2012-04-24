
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
        items: {xtype:'ktlogin'}
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

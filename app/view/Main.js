
Ext.define("KALMTRAK.view.Main", {
  extend: 'Ext.tab.Panel',
  requires: [
    'Ext.TitleBar',
    'KALMTRAK.view.Scheduler'
  ],

  config: {
    tabBarPosition: 'bottom',
    items: [
      {
        title: 'Scheduler',
        iconCls: 'calendar2',
        layout: 'fit',
        items: {xtype:'ktscheduler'}
      },
      {
        title: 'Login',
        iconCls: 'star',
        xtype: 'formpanel',
        items: [
          {
            xtype: 'fieldset',
            title: 'Login',
            items: [
              {
                xtype: 'textfield',
                name : 'name',
                label: 'Name'
              },
              {
                xtype: 'passwordfield',
                name : 'password',
                label: 'Password'
              }
            ]
          }
        ]
      }
    ]
  }
});

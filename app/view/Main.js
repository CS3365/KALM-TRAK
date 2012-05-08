
Ext.define("KALMTRAK.view.Main", {
  extend: 'Ext.tab.Panel',
  requires: [
    'Ext.TitleBar',
    'KALMTRAK.view.Scheduler',
    'KALMTRAK.view.TrakerSelector',
    'KALMTRAK.view.BrilliantTrakerDescriptor'
  ],

  config: {
    tabBarPosition: 'bottom',
    fullscreen:true,
    zIndex:10,
    items: [
      {
        title: 'Welcome',
        iconCls: 'star',
        xtype: 'formpanel',
        items: [
          {
            html: [
              '<center><img height=340 src="http://acmttu.org/wp-content/uploads/2012/05/Kalmtrak-new.png" style="margin-top:20%"/></center>',
              ].join("")
          }
        ]
      },
      {
        title: 'Scheduler',
        iconCls: 'calendar2',
        layout: 'fit',
        items: {xtype:'ktscheduler'}
      },
      {
        title: 'Controller',
        iconCls: 'settings',
        layout: 'fit',
        items: {xtype:'ktselector'}
      },
      {
        title: '&nbsp;Brilliant TRAKer Details&nbsp;',
        iconCls: 'compose',
        layout: 'fit',
        items: {xtype:'ktbrilliantdescriptor'}
      }
    ]
  }
});

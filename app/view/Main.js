
Ext.define("KALMTRAK.view.Main", {
  extend: 'Ext.tab.Panel',
  requires: [
    'Ext.TitleBar',
    'KALMTRAK.view.Scheduler',
	'KALMTRAK.view.TrakerSelector'
  ],

  config: {
    tabBarPosition: 'bottom',
	z-index:1,
    items: [
	  {
        title: 'Login',
        iconCls: 'star',
        xtype: 'formpanel',
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
              },
			  {    xtype: 'toolbar',
					layout: { pack: 'center' },
					items: [
						{
							xtype: 'button',
							text: 'Submit',
							handler: function() {
								Ext.Msg.alert('Form Values', JSON.stringify(formPanel.getValues(), null, 2));
							}
						},
						{
							xtype: 'button',
							text: 'Remember Me',
							handler: function() {
								formPanel.reset();
							}
						}
					]
				}
            ]
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
      }
    ]
  }
});

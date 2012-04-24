
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
        /*items: {
          xtype: 'formpanel',
          items: [
            {
              xtype: 'fieldset',
              title: 'fstitle',
              items: [
                {
                  xtype: 'textfield',
                  label: 'Bla!',
                  name: 'bla'
                }
              ]
            }
          ]
        }//*/
      },
	  {
		title: 'Login',
		iconCls: 'star',
		layout: 'fit',
		items: [
			{
            xtype: 'textfield',
            name : 'name',
            label: 'Name'
			},
			{
            xtype: 'emailfield',
            name : 'email',
            label: 'Email'
			},
			{
            xtype: 'passwordfield',
            name : 'password',
            label: 'Password'
			}
		]}
    ]
  }
});

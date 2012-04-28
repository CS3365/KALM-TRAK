Ext.define('KALMTRAK.view.BrilliantTrakerDescriptor', {
  extend: 'Ext.Container',
  xtype: 'ktbrilliantdescriptor',
  requires: [
    'KALMTRAK.view.TrakerStatus',
	'KALMTRAK.view.TrakerSlider'
  ],
  config: {
	items: 
	[
		{
			xtype: 'ktstatus',
			label: 'Brilliant TRAKer - Stove',
			value: 0
		},
		{
			items:
			[
				{
					xtype: 'ktslider',
					label: 'Burner 1 Temperature'
					
				}
			]
		},
		{
			items:
			[
				{
					xtype: 'ktslider',
					label: 'Burner 2 Temperature'
					
				}
			]
		},
		{
			items:
			[
				{
					xtype: 'ktslider',
					label: 'Burner 3 Temperature'
					
				}
			]
		},
		{
			items:
			[
				{
					xtype: 'ktslider',
					label: 'Burner 4 Temperature'
					
				}
			]
		},
		{
			items:
			[
				{
					xtype: 'ktslider',
					label: 'Oven Temperature'
					
				}
			]
		}
    ]
  }
});
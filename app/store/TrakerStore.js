Ext.define('KALMTRAK.store.TrakerStore', {
  extend: 'Ext.data.TreeStore',
  requires: [
    'KALMTRAK.model.TrakerLocation'
  ],
  config: {
    model: 'KALMTRAK.model.Traker',
    defaultRootProperty: 'items',
    root: {
      text: 'KALMTRAK Trakers',
      items: [
        {
          text: 'Brilliant Trakers',
          items: [
            {
              text: 'Kitchen',
              items: [
                { text: 'Stove', leaf: true }
              ]
            },
			{ text: 'Air Conditioning', leaf:true } 
          ]
        },
        {
          text: 'SMART Trakers',
          items: [
            { text: 'Foyer',
				items:[
				{ text: 'Lamp 1', leaf:true },
				{ text: 'Lamp 2', leaf:true },
				{ text: 'Lamp 3', leaf:true },
				{ text: 'Lamp 4', leaf:true }
				]
			},
            { text: 'Living Room',
				items:[
				{ text: 'Lamp 5', leaf:true },
				{ text: 'Lamp 6', leaf:true },
				{ text: 'TV 1', leaf:true }
				]
			},
            { text: 'Kitchen',
				items:[
				{ text: 'Lamp 7', leaf:true }
				]
			},
			{ text: 'Dining Room' ,
				items:[
				{ text: 'Lamp 8', leaf:true },
				{ text: 'Lamp 9', leaf:true }
				]
			},
			{ text: 'Master Bedroom',
				items:[
				{ text: 'Lamp 10', leaf:true },
				{ text: 'Lamp 11', leaf:true },
				{ text: 'TV 2', leaf:true }
				]
			},
			{ text: 'Master Bathroom',
				items:[
				{ text: 'Lamp 12', leaf:true }
				]
			},
			{ text: 'Upstairs Hallway 1',
				items:[
				{ text: 'Lamp 13', leaf:true },
				{ text: 'Lamp 14', leaf:true }
				]
			},
			{ text: 'Bedroom 1',
				items:[
				{ text: 'Lamp 15', leaf:true },
				{ text: 'Lamp 16', leaf:true },
				{ text: 'TV 3', leaf:true }
				]
			},
            { text: 'Bedroom 2',
				items:[
				{ text: 'Lamp 17', leaf:true },
				{ text: 'TV 4', leaf:true }
				]
			},
			{ text: 'Games Room' ,
				items:[
				{ text: 'Lamp 18', leaf:true },
				{ text: 'Lamp 19', leaf:true },
				{ text: 'TV 5', leaf:true }
				]
			},
			{ text: 'Bedroom 3',
				items:[
				{ text: 'Lamp 20', leaf:true },
				{ text: 'Lamp 21', leaf:true },
				{ text: 'TV 5', leaf:true }
				]
			}
			]
        },
		{
          text: 'KALMTRAK Breaker Box',
          items: [
            { text: 'Foyer',
				items:[
				{ text: 'Power to all outlets', leaf:true },
				{ text: 'Outlet 1', leaf:true },
				{ text: 'Outlet 2', leaf:true },
				{ text: 'Outlet 3', leaf:true },
				{ text: 'Outlet 4', leaf:true },
				{ text: 'Outlet 5', leaf:true },
				{ text: 'Outlet 6', leaf:true }
				]
			},
            { text: 'Garage',
				items:[
				{ text: 'Power to all outlets', leaf:true },
				{ text: 'Outlet 7', leaf:true }
				]
			},
            { text: 'Kitchen',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet Fridge', leaf:true },
				{ text: 'Outlet 8', leaf:true },
				{ text: 'Outlet 9', leaf:true },
				{ text: 'Outlet 10', leaf:true },
				{ text: 'Outlet 11', leaf:true },
				{ text: 'Outlet 12', leaf:true },
				{ text: 'Outlet 13', leaf:true }
				]
			},
			{ text: 'Dining Room' ,
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 14', leaf:true },
				{ text: 'Outlet 15', leaf:true },
				{ text: 'Outlet 16', leaf:true },
				{ text: 'Outlet 17', leaf:true },
				{ text: 'Outlet 18', leaf:true }
				]
			},
			{ text: 'Living Room',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 19', leaf:true },
				{ text: 'Outlet 20', leaf:true },
				{ text: 'Outlet 21', leaf:true },
				{ text: 'Outlet 22', leaf:true },
				{ text: 'Outlet 23', leaf:true },
				{ text: 'Outlet 24', leaf:true }
				]
			},
			{ text: 'Master Bedroom',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 25', leaf:true },
				{ text: 'Outlet 26', leaf:true },
				{ text: 'Outlet 27', leaf:true },
				{ text: 'Outlet 28', leaf:true },
				{ text: 'Outlet 29', leaf:true },
				{ text: 'Outlet 30', leaf:true }
				]
			},
			{ text: 'Master Bathroom',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 31', leaf:true },
				{ text: 'Outlet 32', leaf:true },
				{ text: 'Outlet 33', leaf:true },
				{ text: 'Outlet 34', leaf:true }
				]
			},
			{ text: 'Master Closet',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true }
				]
			},
			{ text: 'Upstairs Hallway',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 35', leaf:true },
				{ text: 'Outlet 36', leaf:true },
				{ text: 'Outlet 37', leaf:true },
				{ text: 'Outlet 38', leaf:true },
				{ text: 'Outlet 39', leaf:true }
				]
			},
			{ text: 'Bedroom 1',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 40', leaf:true },
				{ text: 'Outlet 41', leaf:true },
				{ text: 'Outlet 42', leaf:true },
				{ text: 'Outlet 43', leaf:true },
				{ text: 'Outlet 44', leaf:true }
				]
			},
			{ text: 'Bedroom 1 Closet',
				items:[
				{ text: 'Power all outlets and lights', leaf:true },
				{ text: 'Outlet 45', leaf:true }
				]
			},
			{ text: 'Upstairs Bathroom 1' ,
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 46', leaf:true }
				]
			},
			{ text: 'Bedroom 2',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 47', leaf:true },
				{ text: 'Outlet 48', leaf:true },
				{ text: 'Outlet 49', leaf:true }
				]
			},
			{ text: 'Bedroom 2 Closet',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true }
				]
			},
			{ text: 'Games Room',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 50', leaf:true },
				{ text: 'Outlet 51', leaf:true },
				{ text: 'Outlet 52', leaf:true },
				{ text: 'Outlet 53', leaf:true },
				{ text: 'Outlet 54', leaf:true }
				]
			},
			{ text: 'Games Room Closet',
				items:[
				{ text: 'Power all outlets and lights', leaf:true }
				]
			},
			{ text: 'Upstairs Bathroom 2' ,
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 55', leaf:true }
				]
			},
			{ text: 'Bedroom 3',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 56', leaf:true },
				{ text: 'Outlet 57', leaf:true },
				{ text: 'Outlet 58', leaf:true }
				]
			},
			{ text: 'Bedroom 3 Closet' ,
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 59', leaf:true }
				]
			},
			{ text: 'Outside Outlets',
				items:[
				{ text: 'Power to all outlets and lights', leaf:true },
				{ text: 'Outlet 60', leaf:true },
				{ text: 'Outlet 61', leaf:true },
				{ text: 'Outlet 62', leaf:true },
				{ text: 'Outlet 63', leaf:true }
				]
			},
          ]
        }
      ]
    }
  }
});

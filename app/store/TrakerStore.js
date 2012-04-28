Ext.define('KALMTRAK.store.TrakerStore', {
  extend: 'Ext.data.TreeStore',
  requires: [
    'KALMTRAK.model.Traker'
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
            { text: 'KALMTRAK Lighting System', leaf:true },
			{ text: 'Air Conditioning', leaf:true } 
          ]
        },
        {
          text: 'Normal Trakers',
          items: [
            { text: 'Foyer',
				items:[
				{ text: 'Lamp 1', leaf:true },
				{ text: 'Lamp 2', leaf:true },
				{ text: 'Lamp 3', leaf:true }
				]
			},
            { text: 'Master Bedroom',
				items:[
				{ text: 'Lamp 1', leaf:true },
				{ text: 'Lamp 2', leaf:true },
				{ text: 'TV 1', leaf:true }
				]
			},
            { text: 'Living Room',
				items:[
				{ text: 'Lamp 1', leaf:true },
				{ text: 'Lamp 2', leaf:true },
				{ text: 'TV 1', leaf:true }
				]
			},
			{ text: 'Bedroom 1' ,
				items:[
				{ text: 'Lamp 1', leaf:true },
				{ text: 'Lamp 2', leaf:true },
				{ text: 'TV 1', leaf:true }
				]
			},
			{ text: 'Upstairs Hallway',
				items:[
				{ text: 'Lamp 1', leaf:true },
				{ text: 'Lamp 2', leaf:true }
				]
			},
			{ text: 'Games Room',
				items:[
				{ text: 'Lamp 1', leaf:true },
				{ text: 'Lamp 2', leaf:true },
				{ text: 'TV 1', leaf:true },
				{ text: 'XBox 360', leaf:true },
				{ text: 'Wii', leaf:true }
				]
			},
			{ text: 'Bedroom 2',
				items:[
				{ text: 'Lamp 1', leaf:true },
				{ text: 'Lamp 2', leaf:true },
				{ text: 'TV 1', leaf:true }
				]
			}
          ]
        }
      ]
    }
  }
});

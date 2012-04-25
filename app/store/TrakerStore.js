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
              text: 'Water',
              items: [
                { text: 'Still', leaf: true },
                { text: 'Sparkling', leaf: true }
              ]
            },
            { text: 'Soda', leaf: true }
          ]
        },
        {
          text: 'Normal Trakers',
          items: [
            { text: 'Nuts', leaf: true },
            { text: 'Pretzels', leaf: true },
            { text: 'Wasabi Peas', leaf: true  }
          ]
        }
      ]
    }
  }
});

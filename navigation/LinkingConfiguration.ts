import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Dashboard: {
            screens: {
              DashboardScreen: 'one',
            },
          },
          All: {
            screens: {
              AllScreen: 'two',
            },
          },
          Search: {
            screens: {
              SearchScreen: 'three',
            },
          },
        },
      },
      NotFound: '*',
    },
  },
};

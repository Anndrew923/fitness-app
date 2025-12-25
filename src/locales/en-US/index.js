import common from './common';
import ladder from './ladder';
import tests from './tests';
import pages from './pages';

export default {
  translation: {
    ...common,
    ...ladder,
    ...tests,
    ...pages,
  },
  skillTree: tests.skillTree,
  ladder: {
    title: ladder.ladder?.title || 'Global Leaderboard',
    zones: ladder.ladder?.zones,
    filter: ladder.ladder?.filter,
  },
};


import Ember from 'ember';
import { computed } from 'ember-decorators/object';
import { service } from 'ember-decorators/service';

export default Ember.Component.extend({
  @service router: null,
  @service permissions: null,
  @service externalLinks: null,
  @service flashes: null,

  tagName: 'li',
  classNameBindings: ['branch.lastBuild.state'],
  classNames: ['branch-row', 'row-li'],

  @computed('branch.repository.slug', 'branch.last_build.commit.sha')
  urlGithubCommit(slug, sha) {
    return this.get('externalLinks').githubCommit(slug, sha);
  },

  @computed('branch.recentBuilds')
  last5Builds(recentBuilds) {
    if (recentBuilds.length >= 5) {
      return recentBuilds.slice(0, 5);
    } else {
      return [...Array(5).keys()].map((item, index) => {
        if (!Ember.isEmpty(recentBuilds[index])) {
          return recentBuilds[index];
        } else {
          return item;
        }
      });
    }
  },

  actions: {
    viewAllBuilds() {
      return this.get('router').transitionTo('builds');
    }
  }
});

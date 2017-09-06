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

  @computed('branch.builds.[]', 'branch.builds.@each.id', 'branch.builds.@each.eventType')
  last5Builds(builds) {
    return builds.
      // when a build is pull request, it will have a branch set to target
      // branch (mostly master) - we want to display only actual branch builds
      // here
      filter( (build) => build.get('eventType') !== 'pull_request' ).
      sortBy('id').toArray().reverse().slice(0, 5);
  },

  actions: {
    viewAllBuilds() {
      return this.get('router').transitionTo('builds');
    }
  }
});

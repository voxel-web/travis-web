import Ember from 'ember';
import TravisRoute from 'travis/routes/basic';
import { service } from 'ember-decorators/service';

export default TravisRoute.extend({
  @service repositories: null,
  @service tabStates: null,

  model() {
    let repoId = this.modelFor('repo').get('id');
    return Ember.RSVP.hash({
      activeBranches: this.store.paginated('branch', {
        repository_id: repoId,
        exists_on_github: true,
        include: 'build.commit,branch.recent_builds',
        sort_by: 'last_build:desc'
      }, {
        filter: (branch) => branch.get('repoId') === repoId && branch.get('existsOnGithub'),
        sort: function (a, b) {
          return parseInt(b.get('lastBuild.id')) - parseInt(a.get('lastBuild.id'));
        },
        dependencies: ['repo.id', 'existsOnGithub', 'lastBuild.id'],
        forceReload: true
      }),
      deletedBranches: this.store.paginated('branch', {
        limit: 0,
        repository_id: repoId,
        exists_on_github: false
      })
    });
  },

  activate() {
    if (this.get('auth.signedIn')) {
      this.set('tabStates.sidebarTab', 'owned');
      this.set('tabStates.mainTab', 'branches');
    }
  }
});

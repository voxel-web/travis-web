import V3Adapter from 'travis/adapters/v3';

export default V3Adapter.extend({
  pathPrefix(modelName, id, snapshot, type, query) {
    if (type === 'query' && query.repository_id) {
      return `repo/${query.repository_id}`;
    }
  },

  findRecord(store, type, id) {
    return this.ajax(`${this.urlPrefix()}${id}?
include=last_build.commit,branch.recent_builds`, 'GET');
  }
});

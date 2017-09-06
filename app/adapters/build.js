import V3Adapter from 'travis/adapters/v3';

export default V3Adapter.extend({
  includes: 'build.commit,build.branch',

  pathPrefix(modelName, id, snapshot, type, query) {
    if (type === 'query' && query.repository_id) {
      let repoId = query.repository_id;
      delete query.repository_id;
      return `repo/${repoId}`;
    }
  }
});

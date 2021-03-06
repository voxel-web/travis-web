import Ember from 'ember';
import { alias } from 'ember-decorators/object/computed';
import { computed } from 'ember-decorators/object';
import limit from 'travis/utils/computed-limit';

// LivePaginatedCollection is an interface for a first page of paginated set of
// results.
let LivePaginatedCollection = Ember.ArrayProxy.extend({
  // TODO: this is copied from PaginatedCollection, ideally we should change the
  // pagination data when new records come in, but for the time being I think
  // it's fine to just leave this static
  @computed('paginationData')
  pagination(paginationData) {
    if (!paginationData) return;

    return {
      total: paginationData.count,
      perPage: paginationData.limit,
      offset: paginationData.offset,
      isFirst: paginationData.is_first,
      isLast: paginationData.is_last,
      prev: paginationData.prev,
      next: paginationData.next,
      first: paginationData.first,
      last: paginationData.last,
      currentPage: paginationData.offset / paginationData.limit + 1,
      numberOfPages: Math.ceil(paginationData.count / paginationData.limit)
    };
  },
  @alias('limited') arrangedContent: null,

  setPaginationData(queryResult) {
    this.set('paginationData', queryResult.get('meta.pagination'));
  }
});

LivePaginatedCollection.reopenClass({
  create(properties) {
    let instance = this._super(...arguments);
    instance.setPaginationData(properties.content.get('queryResult'));

    this.defineSortByFunction(instance, properties.store, properties.modelName, properties.sort, properties.dependencies);

    return instance;
  },

  defineSortByFunction(instance, store, modelName, sort = 'id:desc', dependencies) {
    let sortByFunction, sortKey, order;
    if (typeof sort === 'function') {
      sortByFunction = sort;
    } else {
      [sortKey, order] = sort.split(':');
      order = order || 'desc';
      // TODO: we need to deal with paths, like for example
      // defaultBranch.lastBuild

      if (store.modelFor(modelName).typeForRelationship(sortKey, store)) {
        // it's a relationship, so sort by id by default
        sortKey = `${sortKey}.id`;
      }

      sortByFunction = function (a, b) {
        let aValue = a.get(sortKey),
          bValue = b.get(sortKey);

        let result;
        // TODO: this should check types, not only if it's id or not
        if (sortKey.endsWith('id') || sortKey.endsWith('Id')) {
          result = parseInt(aValue) - parseInt(bValue);
        } else {
          if (aValue < bValue) {
            result = -1;
          } else if (aValue > bValue) {
            result = 1;
          } else {
            result = 0;
          }
        }

        if (order === 'desc') {
          result = -result;
        }

        return result;
      };
    }

    let sortDependencies = dependencies.slice(0); // clone

    if (sortKey && !sortDependencies.includes(sortKey)) {
      sortDependencies.push(sortKey);
    }

    sortDependencies = sortDependencies.map((dep) => `content.@each.${dep}`);
    sortDependencies.push('content.[]');

    Ember.defineProperty(instance, 'sorted', Ember.computed(...sortDependencies, function () {
      return this.get('content').toArray().sort(sortByFunction);
    }));

    Ember.defineProperty(instance, 'limited', limit('sorted', 'pagination.perPage'));
  }
});

export default LivePaginatedCollection;

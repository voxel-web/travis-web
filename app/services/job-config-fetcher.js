import Ember from 'ember';
import { service } from 'ember-decorators/service';

export default Ember.Service.extend({
  @service ajax: null,

  init() {
    this.promisesByJobId = {};
    return this._super(...arguments);
  },

  fetch(jobId) {
    let promise = new Ember.RSVP.Promise((resolve, reject) => {
      this.promisesByJobId[jobId] = resolve;
    });
    Ember.run.once(this, 'flush');
    return promise;
  },

  flush() {
    let promisesByJobId = this.promisesByJobId;
    this.promisesByJobId = {};
    let jobIds = Object.keys(promisesByJobId);
    this.get('ajax').ajax(`/jobs`, 'GET', { data: { ids: jobIds } }).then((data) => {
      data.jobs.forEach((jobData) => {
        promisesByJobId[jobData.id.toString()](jobData.config);
      });
    });
  }
});


const assert = require('bsert');
const {Client} = require('bcurl');

/**
 * Explorer Client
 * @extends {bcurl.Client}
 */

export class ExplorerClient extends Client {

  block(id) {
    return this.get('/blocks/' + id);
  }

  blocks(fromTs, toTs) {
    assert(typeof fromTs === 'number');
    assert(typeof toTs === 'number');

    return this.get('/blocks?fromTs=' + fromTs + '&toTs=' + toTs);
  }

  address(id) {
    return this.get('/addresses/' + id);
  }

  transaction(id) {
    return this.get('/transactions/' + id);
  }
}

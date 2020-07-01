process.env.NODE_ENV = 'test';

const nock = require('nock');
const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const expect = chai.expect;

nock.disableNetConnect();
nock.emitter.on('no match', req => { });

function cleanNocks() {
    if (!nock.isDone()) {
        this.test.error(new Error('Not all nock interceptors were used!'));
    }
    nock.cleanAll();
}

describe('App Start', async function () {
});
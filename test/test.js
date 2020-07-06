process.env.NODE_ENV = 'test';

const app = require('../app.js');
const { SyncDatabase } = require('../tasks');
const { Airtable, Database } = require('../services');

const sinon = require('sinon');

describe('App Start', () => {
    beforeEach(() => {
        sinon.stub(SyncDatabase);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should call all tasks on app run', async function () {
        await app.main();
        sinon.assert.calledOnce(SyncDatabase.main);
    });
});

describe('Sync Database', () => {
    var dbBoatSails, dbCalendar, dbCapacity, dbIndividualSails;
    var airtableCapacity, airtableBoatSails, airtableIndividualSails;

    const defaultCapacity = {
        0: { day: 'sunday', value: 0 },
        1: { day: 'monday', value: 2 }
    };

    beforeEach(() => {
        dbBoatSails = sinon.stub(Database.BoatSails);
        dbCalendar = sinon.stub(Database.Calendar);
        dbCapacity = sinon.stub(Database.Capacity);
        dbIndividualSails = sinon.stub(Database.IndividualSails);

        airtableBoatSails = sinon.stub(Airtable.BoatSails);
        airtableCapacity = sinon.stub(Airtable.Capacity);
        airtableIndividualSails = sinon.stub(Airtable.IndividualSails);

        airtableCapacity.get.resolves(defaultCapacity);
        dbCapacity.get.resolves(defaultCapacity);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Calendar', () => {
        it('should update', async function () {
            await SyncDatabase.main();
            sinon.assert.calledOnce(Database.Calendar.update);
        });
    });

    describe('Capacity', () => {
        it('should get', async function () {
            await SyncDatabase.main();
            sinon.assert.calledOnce(Database.Capacity.get);
        });

        it('should add', async function () {
            dbCapacity.get.resolves({});
            await SyncDatabase.main();
            sinon.assert.calledWith(Database.Capacity.add, defaultCapacity);
        });

        it('should update', async function () {
            dbCapacity.get.resolves({
                0: { day: 'sunday', value: 0 },
                1: { day: 'monday', value: 3 }
            });
            await SyncDatabase.main();
            sinon.assert.calledWith(Database.Capacity.update, { 1: { 'value': 2 } });
        });

        it('should remove', async function () {
            dbCapacity.get.resolves({
                0: { day: 'sunday', value: 0 },
                1: { day: 'monday', value: 2 },
                2: { day: 'tuesday', value: 2 }
            });
            await SyncDatabase.main();
            sinon.assert.calledWith(Database.Capacity.remove, ['2']);
        });
    });
});
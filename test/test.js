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

    const defaultBoatSails = {
        rec12345678900000: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-01 09:00:00', disembarking_date: '2020-01-01 12:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 0, paid: 1550, outstanding: 0, total_passengers: 40, students: 34, adults: 6 },
        rec12345678900001: { vessel_conducting_sail: 'matthew turner', boarding_date: '2020-01-02 13:00:00', disembarking_date: '2020-01-02 16:00:00', status: 'scheduled', total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550, total_passengers: 70, students: 60, adults: 10 }
    };

    const defaultCapacity = {
        0: { day: 'sunday', value: 0 },
        1: { day: 'monday', value: 2 }
    };

    const defaultIndividualSails = {
        rec12345678901000: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-01 09:00:00', disembarking_date: '2020-01-01 12:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 0, paid: 1550, outstanding: 0 },
        rec12345678901001: { vessel_conducting_sail: 'matthew turner', boarding_date: '2020-01-02 13:00:00', disembarking_date: '2020-01-02 16:00:00', status: 'scheduled', total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550 }
    };

    beforeEach(() => {
        airtableBoatSails = sinon.stub(Airtable.BoatSails);
        airtableCapacity = sinon.stub(Airtable.Capacity);
        airtableIndividualSails = sinon.stub(Airtable.IndividualSails);

        dbBoatSails = sinon.stub(Database.BoatSails);
        dbCalendar = sinon.stub(Database.Calendar);
        dbCapacity = sinon.stub(Database.Capacity);
        dbIndividualSails = sinon.stub(Database.IndividualSails);

        airtableBoatSails.get.resolves(defaultBoatSails);
        dbBoatSails.get.resolves(defaultBoatSails);

        airtableCapacity.get.resolves(defaultCapacity);
        dbCapacity.get.resolves(defaultCapacity);

        airtableIndividualSails.get.resolves(defaultIndividualSails);
        dbIndividualSails.get.resolves(defaultIndividualSails);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Boat Sails', () => {
        it('should get', async function () {
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.BoatSails.get);
            sinon.assert.calledOnce(Database.BoatSails.get);
            sinon.assert.notCalled(Database.BoatSails.add);
            sinon.assert.notCalled(Database.BoatSails.update);
            sinon.assert.notCalled(Database.BoatSails.remove);
        });

        it('should add', async function () {
            airtableBoatSails.get.resolves({
                rec12345678900000: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-01 09:00:00', disembarking_date: '2020-01-01 12:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 0, paid: 1550, outstanding: 0, total_passengers: 40, students: 34, adults: 6 },
                rec12345678900001: { vessel_conducting_sail: 'matthew turner', boarding_date: '2020-01-02 13:00:00', disembarking_date: '2020-01-02 16:00:00', status: 'scheduled', total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550, total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550, total_passengers: 70, students: 60, adults: 10 },
                rec12345678900002: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-03 13:00:00', disembarking_date: '2020-01-03 16:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 1550, paid: 0, outstanding: 0, total_passengers: 40, students: 35, adults: 5 }
            });
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.BoatSails.get);
            sinon.assert.calledOnce(Database.BoatSails.get);
            sinon.assert.calledWith(Database.BoatSails.add, { rec12345678900002: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-03 13:00:00', disembarking_date: '2020-01-03 16:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 1550, paid: 0, outstanding: 0, total_passengers: 40, students: 35, adults: 5 } });
            sinon.assert.notCalled(Database.BoatSails.update);
            sinon.assert.notCalled(Database.BoatSails.remove);
        });

        it('should update', async function () {
            airtableBoatSails.get.resolves({
                rec12345678900000: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-01 09:00:00', disembarking_date: '2020-01-01 12:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 0, paid: 1550, outstanding: 0, total_passengers: 40, students: 30, adults: 10 },
                rec12345678900001: { vessel_conducting_sail: 'matthew turner', boarding_date: '2020-01-02 13:00:00', disembarking_date: '2020-01-02 16:00:00', status: 'cancelled', total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550, total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550, total_passengers: 70, students: 60, adults: 10 }
            });
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.BoatSails.get);
            sinon.assert.calledOnce(Database.BoatSails.get);
            sinon.assert.notCalled(Database.BoatSails.add);
            sinon.assert.calledWith(Database.BoatSails.update, {
                rec12345678900000: { students: 30, adults: 10 },
                rec12345678900001: { status: 'cancelled' }
            });
            sinon.assert.notCalled(Database.BoatSails.remove);
        });

        it('should remove', async function () {
            airtableBoatSails.get.resolves({
                rec12345678900000: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-01 09:00:00', disembarking_date: '2020-01-01 12:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 0, paid: 1550, outstanding: 0, total_passengers: 40, students: 34, adults: 6 }
            });
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.BoatSails.get);
            sinon.assert.calledOnce(Database.BoatSails.get);
            sinon.assert.notCalled(Database.BoatSails.add);
            sinon.assert.notCalled(Database.BoatSails.update);
            sinon.assert.calledWith(Database.BoatSails.remove, ['rec12345678900001']);
        });
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
            sinon.assert.calledOnce(Airtable.Capacity.get);
            sinon.assert.calledOnce(Database.Capacity.get);
            sinon.assert.notCalled(Database.Capacity.add);
            sinon.assert.notCalled(Database.Capacity.update);
            sinon.assert.notCalled(Database.Capacity.remove);
        });

        it('should add', async function () {
            airtableCapacity.get.resolves({
                0: { day: 'sunday', value: 0 },
                1: { day: 'monday', value: 2 },
                2: { day: 'tuesday', value: 2 }
            });
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.Capacity.get);
            sinon.assert.calledOnce(Database.Capacity.get);
            sinon.assert.calledWith(Database.Capacity.add, { 2: { day: 'tuesday', value: 2 } });
            sinon.assert.notCalled(Database.Capacity.update);
            sinon.assert.notCalled(Database.Capacity.remove);
        });

        it('should update', async function () {
            airtableCapacity.get.resolves({
                0: { day: 'sunday', value: 0 },
                1: { day: 'monday', value: 3 }
            });
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.Capacity.get);
            sinon.assert.calledOnce(Database.Capacity.get);
            sinon.assert.notCalled(Database.Capacity.add);
            sinon.assert.calledWith(Database.Capacity.update, { 1: { 'value': 3 } });
            sinon.assert.notCalled(Database.Capacity.remove);
        });

        it('should remove', async function () {
            airtableCapacity.get.resolves({
                0: { day: 'sunday', value: 0 }
            });
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.Capacity.get);
            sinon.assert.calledOnce(Database.Capacity.get);
            sinon.assert.notCalled(Database.Capacity.add);
            sinon.assert.notCalled(Database.Capacity.update);
            sinon.assert.calledWith(Database.Capacity.remove, ['1']);
        });
    });

    describe('Individual Sails', () => {
        it('should get', async function () {
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.IndividualSails.get);
            sinon.assert.calledOnce(Database.IndividualSails.get);
            sinon.assert.notCalled(Database.IndividualSails.add);
            sinon.assert.notCalled(Database.IndividualSails.update);
            sinon.assert.notCalled(Database.IndividualSails.remove);
        });

        it('should add', async function () {
            airtableIndividualSails.get.resolves({
                rec12345678901000: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-01 09:00:00', disembarking_date: '2020-01-01 12:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 0, paid: 1550, outstanding: 0 },
                rec12345678901001: { vessel_conducting_sail: 'matthew turner', boarding_date: '2020-01-02 13:00:00', disembarking_date: '2020-01-02 16:00:00', status: 'scheduled', total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550, total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550 },
                rec12345678901002: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-03 13:00:00', disembarking_date: '2020-01-03 16:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 1550, paid: 0, outstanding: 0 }
            });
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.IndividualSails.get);
            sinon.assert.calledOnce(Database.IndividualSails.get);
            sinon.assert.calledWith(Database.IndividualSails.add, { rec12345678901002: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-03 13:00:00', disembarking_date: '2020-01-03 16:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 1550, paid: 0, outstanding: 0 } });
            sinon.assert.notCalled(Database.IndividualSails.update);
            sinon.assert.notCalled(Database.IndividualSails.remove);
        });

        it('should update', async function () {
            airtableIndividualSails.get.resolves({
                rec12345678901000: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-01 13:00:00', disembarking_date: '2020-01-01 16:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 0, paid: 1550, outstanding: 0 },
                rec12345678901001: { vessel_conducting_sail: 'matthew turner', boarding_date: '2020-01-02 13:00:00', disembarking_date: '2020-01-02 16:00:00', status: 'cancelled', total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550, total_cost: 3100, scholarship_awarded: 1550, paid: 0, outstanding: 1550 }
            });
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.IndividualSails.get);
            sinon.assert.calledOnce(Database.IndividualSails.get);
            sinon.assert.notCalled(Database.IndividualSails.add);
            sinon.assert.calledWith(Database.IndividualSails.update, {
                rec12345678901000: { boarding_date: '2020-01-01 13:00:00', disembarking_date: '2020-01-01 16:00:00' },
                rec12345678901001: { status: 'cancelled' }
            });
            sinon.assert.notCalled(Database.BoatSails.remove);
        });

        it('should remove', async function () {
            airtableIndividualSails.get.resolves({
                rec12345678901000: { vessel_conducting_sail: 'seaward', boarding_date: '2020-01-01 09:00:00', disembarking_date: '2020-01-01 12:00:00', status: 'scheduled', total_cost: 1550, scholarship_awarded: 0, paid: 1550, outstanding: 0 }
            });
            await SyncDatabase.main();
            sinon.assert.calledOnce(Airtable.IndividualSails.get);
            sinon.assert.calledOnce(Database.IndividualSails.get);
            sinon.assert.notCalled(Database.IndividualSails.add);
            sinon.assert.notCalled(Database.IndividualSails.update);
            sinon.assert.calledWith(Database.IndividualSails.remove, ['rec12345678901001']);
        });
    });
});
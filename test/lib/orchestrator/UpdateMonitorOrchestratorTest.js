const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

chai.should();
chai.use(tdChai(td));

const updateMonitorOrchestratorFactory = require('../../../lib/orchestrator/UpdateMonitorOrchestrator');

describe('UpdateMonitorOrchestrator', function () {
    const expectedSyntheticName = 'SyntheticName';
    const expectedFilename = 'syntheticFilename.js';


    it ('should fail if no synthetic list file exists', function() {
        const syntheticListFileServiceMock = {
            getSynthetic: td.function()
        };
        const syntheticFileServiceMock = {
            getBase64File: td.function()
        };
        const newRelicServiceMock = {};

        const updateMonitorOrchestrator = updateMonitorOrchestratorFactory(
            syntheticListFileServiceMock,
            syntheticFileServiceMock,
            newRelicServiceMock
        );

        td.when(syntheticListFileServiceMock.getSynthetic(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, 'synthetic not found');

        (function () {
            updateMonitorOrchestrator.updateSynthetic(expectedSyntheticName);
        }).should.throw('synthetic not found');
    });

    it ('should fail if no synthetic file can be found', function () {
        const syntheticListFileServiceMock = {
            getSynthetic: td.function()
        };
        const syntheticFileServiceMock = {
            getBase64File: td.function()
        };
        const newRelicServiceMock = {};

        const updateMonitorOrchestrator = updateMonitorOrchestratorFactory(
            syntheticListFileServiceMock,
            syntheticFileServiceMock,
            newRelicServiceMock
        );

        const syntheticInfoMock = {
            filename: expectedFilename
        };

        td.when(syntheticListFileServiceMock.getSynthetic(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(syntheticInfoMock);

        td.when(syntheticFileServiceMock.getBase64File(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, 'synthetic file not found');

        (function () {
            updateMonitorOrchestrator.updateSynthetic(expectedSyntheticName);
        }).should.throw('synthetic file not found');
    });

    it ('should upload synthetic content to New Relic', function () {
        const expectedSyntheticContent = 'synthetic\ncontent';
        const expectedSyntheticId = 'syntheticId';

        const syntheticListFileServiceMock = {
            getSynthetic: td.function()
        };
        const syntheticFileServiceMock = {
            getBase64File: td.function()
        };
        const newRelicServiceMock = {
            updateMonitorScript: td.function()
        };

        const updateMonitorOrchestrator = updateMonitorOrchestratorFactory(
            syntheticListFileServiceMock,
            syntheticFileServiceMock,
            newRelicServiceMock
        );

        const syntheticInfoMock = {
            filename: expectedFilename,
            id: expectedSyntheticId
        };

        td.when(syntheticListFileServiceMock.getSynthetic(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(syntheticInfoMock);

        td.when(syntheticFileServiceMock.getBase64File(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(new Buffer(expectedSyntheticContent), null);

        td.when(newRelicServiceMock.updateMonitorScript(
            td.matchers.isA(String),
            td.matchers.isA(String),
            td.callback
        )).thenCallback();

        updateMonitorOrchestrator.updateSynthetic(expectedSyntheticName);

        newRelicServiceMock.updateMonitorScript.should.have.been.calledWith(
            syntheticInfoMock.id,
            new Buffer(expectedSyntheticContent),
            td.callback
        );
    });
});
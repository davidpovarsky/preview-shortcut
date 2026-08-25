// Unit coverage for the external metadata contract used by the generic
// fallback renderer. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    registerActionMetadata,
    clearActionMetadata,
    hasExternalMetadata,
    metadataFor,
} from '../src/metadata.ts';

test('metadataFor exposes catalog parameter labels to the generic card', () => {
    clearActionMetadata();
    registerActionMetadata({
        'is.workflow.actions.getupcomingevents': {
            title: 'Get Upcoming Events',
            params: {
                WFGetUpcomingItemCount: 'Count',
                WFDateSpecifier: 'Date Specifier',
                WFSpecifiedDate: 'Specified Date',
            },
        },
    });

    assert.equal(hasExternalMetadata('is.workflow.actions.getupcomingevents'), true);

    const metadata = metadataFor('is.workflow.actions.getupcomingevents');
    assert.equal(metadata?.title, 'Get Upcoming Events');
    assert.deepEqual(metadata?.params, {
        WFGetUpcomingItemCount: 'Count',
        WFDateSpecifier: 'Date Specifier',
        WFSpecifiedDate: 'Specified Date',
    });
});

test('identifiers normalize so short and full forms resolve identically', () => {
    clearActionMetadata();
    registerActionMetadata([
        ['getupcomingevents', { title: 'Get Upcoming Events', params: {} }],
    ]);

    assert.equal(hasExternalMetadata('getupcomingevents'), true);
    assert.equal(hasExternalMetadata('is.workflow.actions.getupcomingevents'), true);
    assert.notEqual(metadataFor('IS.WORKFLOW.ACTIONS.GETUPCOMINGEVENTS'), null);
});

test('unknown identifiers return null metadata without params', () => {
    clearActionMetadata();
    assert.equal(hasExternalMetadata('is.workflow.actions.nope'), false);
    assert.equal(metadataFor('is.workflow.actions.nope'), null);
});

test('clearActionMetadata resets the registry', () => {
    registerActionMetadata({ example: { title: 'Example' } });
    clearActionMetadata();
    assert.equal(hasExternalMetadata('example'), false);
});

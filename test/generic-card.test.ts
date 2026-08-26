// Focused coverage for the generic metadata-aware rendering path: the same
// pure helpers the real renderer consumes. Proves catalog labels surface in
// the generic card, implementation-only keys stay hidden, values of every
// scalar type are represented, and specialized renderers keep precedence.
// Run with: npm test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
    genericParameterEntries,
    resolveCardSource,
    volatileParameterKeys,
} from '../src/generic-card.ts';
import {registerActionMetadata, clearActionMetadata, metadataFor} from '../src/metadata.ts';

const upcomingEventsParams = {
    UUID: '9ddee5c8-858e-4362-81da-e8cb9a56809d',
    CustomOutputName: 'events',
    GroupingIdentifier: 'bd0cf3a4-ea7d-4042-8298-1a2f597f57d3',
    WFControlFlowMode: 0,
    WFGetUpcomingItemCount: 5,
    WFDateSpecifier: 'Specified Day',
    WFSpecifiedDate: 'May 20, 2025',
};

function registerUpcomingEventsMetadata() {
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
}

test('catalog labels drive the generic parameter presentation', () => {
    registerUpcomingEventsMetadata();
    const metadata = metadataFor('is.workflow.actions.getupcomingevents');
    const entries = genericParameterEntries(upcomingEventsParams, metadata?.params);

    assert.deepEqual(
        entries.map((entry) => entry.label),
        ['Count', 'Date Specifier', 'Specified Date'],
        'parameters render with catalog labels instead of raw plist keys',
    );
});

test('implementation-only keys are hidden from the generic card', () => {
    registerUpcomingEventsMetadata();
    const metadata = metadataFor('is.workflow.actions.getupcomingevents');
    const entries = genericParameterEntries(upcomingEventsParams, metadata?.params);
    const presentedKeys = entries.map((entry) => entry.key);

    for (const hidden of ['UUID', 'CustomOutputName', 'GroupingIdentifier', 'WFControlFlowMode']) {
        assert.equal(presentedKeys.includes(hidden), false, `${hidden} must not render`);
        assert.equal(volatileParameterKeys.has(hidden), true, `${hidden} must stay in the volatile set`);
    }
});

test('bool, text, and number values are represented', () => {
    const entries = genericParameterEntries({
        WFFlag: true,
        WFText: 'sanitized evidence',
        WFNumber: 42,
        WFMissing: false,
    });

    assert.deepEqual(
        entries.map((entry) => [entry.key, entry.value]),
        [
            ['WFFlag', true],
            ['WFText', 'sanitized evidence'],
            ['WFNumber', 42],
            ['WFMissing', false],
        ],
        'scalar values pass through with native types',
    );
    // Labels fall back to raw keys when no catalog label exists.
    assert.equal(entries[0].label, 'WFFlag');
});

test('an unknown catalog-backed action uses the metadata-aware generic card', () => {
    clearActionMetadata();
    registerActionMetadata({
        'com.thirdparty.toolkit.runexternalstepintent': {
            title: 'Run External Step',
            params: {StepIndex: 'Step'},
        },
    });

    // No built-in definition exists; metadata resolves for both identifier
    // spellings so the generic card can title itself.
    assert.equal(resolveCardSource(false, true), 'metadata');
    assert.notEqual(metadataFor('com.thirdparty.toolkit.RunExternalStepIntent'), null);
});

test('specialized renderers take precedence over metadata', () => {
    registerUpcomingEventsMetadata();

    // A built-in definition wins even when metadata is also registered.
    assert.equal(resolveCardSource(true, true), 'definition');
    assert.equal(resolveCardSource(true, false), 'definition');

    // With neither, the plain generic fallback renders.
    assert.equal(resolveCardSource(false, false), 'fallback');
});

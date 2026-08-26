// Pure helpers behind the generic metadata-aware fallback card. Extracting
// them keeps the rendering path directly testable with node:test and lets
// hosts verify that shared catalog metadata drives the generic presentation
// without standing up a browser test stack.

export const volatileParameterKeys = new Set([
    'UUID',
    'CustomOutputName',
    'GroupingIdentifier',
    'WFControlFlowMode',
]);

export interface GenericParameterEntry {
    // Original Shortcut plist parameter key.
    key: string;
    // Human-readable label: catalog label when known, otherwise the raw key.
    label: string;
    value: unknown;
}

export function genericParameterEntries(
    parameters: Record<string, unknown>,
    labels?: { [key: string]: string },
): GenericParameterEntry[] {
    const entries: GenericParameterEntry[] = [];
    for (const key of Object.keys(parameters ?? {})) {
        if (volatileParameterKeys.has(key)) {
            continue;
        }
        entries.push({
            key,
            label: labels?.[key] ?? key,
            value: parameters[key],
        });
    }
    return entries;
}

// Which renderer wins for an action, in precedence order: a specialized
// built-in definition always beats host metadata; metadata produces the
// metadata-aware generic card; anything else falls back to the plain generic
// card.
export type CardSource = 'definition' | 'metadata' | 'fallback';

export function resolveCardSource(hasBuiltinDefinition: boolean, hasMetadata: boolean): CardSource {
    if (hasBuiltinDefinition) {
        return 'definition';
    }
    if (hasMetadata) {
        return 'metadata';
    }
    return 'fallback';
}

// External action metadata lets hosts (such as Cherri) feed shared,
// machine-readable action knowledge into the generic fallback renderer
// without writing a custom renderer per action.

export interface ExternalActionMetadata {
    title?: string
    icon?: string
    color?: string
    background?: string
    description?: string
    // Optional map of Shortcut plist parameter keys to human-readable
    // parameter labels, derived from the host's shared action catalog.
    // Present parameters of unknown actions render with these labels
    // through the generic card instead of raw plist keys.
    params?: { [key: string]: string }
}

interface ExternalMetadataMap {
    [identifier: string]: ExternalActionMetadata
}

let externalMetadata: ExternalMetadataMap = {};

function normalizeIdentifier(identifier: string): string {
    return identifier.toLowerCase().replace(/^is\.workflow\.actions\./, '');
}

export function registerActionMetadata(entries: ExternalMetadataMap | Array<[string, ExternalActionMetadata]>) {
    if (Array.isArray(entries)) {
        for (const [identifier, metadata] of entries) {
            externalMetadata[normalizeIdentifier(identifier)] = metadata;
        }
        return;
    }
    for (const identifier of Object.keys(entries)) {
        externalMetadata[normalizeIdentifier(identifier)] = entries[identifier];
    }
}

export function clearActionMetadata() {
    externalMetadata = {};
}

export function hasExternalMetadata(identifier: string): boolean {
    return Boolean(externalMetadata[normalizeIdentifier(identifier)]);
}

export function metadataFor(identifier: string): ActionDefinitionLike | null {
    const metadata = externalMetadata[normalizeIdentifier(identifier)];
    if (!metadata) {
        return null;
    }
    return {
        title: metadata.title,
        icon: metadata.icon,
        color: metadata.color,
        background: metadata.background,
        params: metadata.params ?? {},
    };
}

export interface ActionDefinitionLike {
    title?: string
    icon?: string
    color?: string
    background?: string
    params?: { [key: string]: string }
}

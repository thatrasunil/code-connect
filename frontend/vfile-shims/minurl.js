// Polyfill for fileURLToPath in browser environment
export function urlToPath(url) {
    if (typeof url === 'string') {
        // Remove file:// protocol if present
        return url.replace(/^file:\/\//, '');
    }
    if (url && typeof url === 'object' && url.href) {
        return url.href.replace(/^file:\/\//, '');
    }
    return String(url);
}

export function isUrl(value) {
    return typeof value === 'string' && /^[a-z][a-z\d+.-]*:/i.test(value);
}

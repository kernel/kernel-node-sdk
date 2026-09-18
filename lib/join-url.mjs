export function joinURL(baseURL, path) {
    return `${baseURL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
//# sourceMappingURL=join-url.mjs.map
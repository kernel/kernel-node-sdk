"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinURL = joinURL;
function joinURL(baseURL, path) {
    return `${baseURL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
//# sourceMappingURL=join-url.js.map
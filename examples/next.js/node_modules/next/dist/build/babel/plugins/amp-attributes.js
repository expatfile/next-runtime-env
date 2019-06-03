"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function AmpAttributePatcher(...args) {
    return {
        visitor: {
            JSXOpeningElement(path) {
                const openingElement = path.node;
                const { name, attributes } = openingElement;
                if (!(name && name.type === 'JSXIdentifier')) {
                    return;
                }
                if (!name.name.startsWith('amp-')) {
                    return;
                }
                for (const attribute of attributes) {
                    if (attribute.type !== 'JSXAttribute') {
                        continue;
                    }
                    if (attribute.name.name === 'className') {
                        attribute.name.name = 'class';
                    }
                }
            },
        },
    };
}
exports.default = AmpAttributePatcher;

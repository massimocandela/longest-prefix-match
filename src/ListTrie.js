const ListTrie = function () {
    this.index = {};

    this._newNode = () => {
        return {
            zero: null,
            one: null,
            values: null
        };
    };

    this.root = this._newNode();

    this._walk = (visitor) => {
        const stack = [{ node: this.root, key: "" }];

        while (stack.length > 0) {
            const current = stack.pop();
            const node = current.node;

            if (node.values) {
                visitor(current.key, node.values);
            }

            if (node.one) {
                stack.push({ node: node.one, key: `${current.key}1` });
            }

            if (node.zero) {
                stack.push({ node: node.zero, key: `${current.key}0` });
            }
        }
    };

    this.reset = () => {
        this.index = {};
        this.root = this._newNode();
    }

    this.add = (key, value) => {
        let node = this.root;

        for (let n = 0; n < key.length; n++) {
            const branch = key[n] === '0' ? 'zero' : 'one';

            if (!node[branch]) {
                node[branch] = this._newNode();
            }

            node = node[branch];
        }

        if (node.values) {
            node.values.push(value);
        } else {
            node.values = [value];
        }
    }

    this.rebuildIndex = () => {
        const index = {};

        this._walk((key, values) => {
            index[key] = values;
        });

        this.index = index;
        return this.index;
    }

    this.get = (key, all) => {
        let node = this.root;
        let best = null;
        const matches = all ? [] : null;

        for (let n = 0; n < key.length; n++) {
            node = node[key[n] === '0' ? 'zero' : 'one'];

            if (!node) {
                break;
            }

            if (node.values) {
                if (all) {
                    matches.push(node.values);
                } else {
                    best = node.values;
                }
            }
        }

        if (!all) {
            return best || [];
        }

        if (matches.length === 0) {
            return [];
        }

        const results = [];
        for (let i = matches.length - 1; i >= 0; i--) {
            const group = matches[i];
            for (let j = 0; j < group.length; j++) {
                results.push(group[j]);
            }
        }

        return results;
    }

    this.getLessSpecific = (key) => {
        let node = this.root;

        for (let n = 0; n < key.length; n++) {
            node = node[key[n] === '0' ? 'zero' : 'one'];

            if (!node) {
                break;
            }

            if (node.values) {
                return node.values;
            }
        }

        return [];
    }

    this.at = (key) => {
        let node = this.root;

        for (let n = 0; n < key.length; n++) {
            node = node[key[n] === '0' ? 'zero' : 'one'];

            if (!node) {
                return undefined;
            }
        }

        return node.values;
    }

    this.values = () => {
        const allValues = [];

        this._walk((key, values) => {
            allValues.push(values);
        });

        return allValues;
    }
}

module.exports = ListTrie;
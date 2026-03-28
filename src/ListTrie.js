const ListTrie = function () {
    this.index = {};
    this.root = this._newNode();
}

ListTrie.prototype._newNode = function () {
    return {
        zero: null,
        one: null,
        values: null
    };
};

ListTrie.prototype._walk = function (visitor) {
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

ListTrie.prototype.reset = function () {
    this.index = {};
    this.root = this._newNode();
}

ListTrie.prototype.add = function (key, value) {
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

ListTrie.prototype.rebuildIndex = function () {
    const index = {};

    this._walk((key, values) => {
        index[key] = values;
    });

    this.index = index;
    return this.index;
}

ListTrie.prototype.get = function (key, all) {
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

ListTrie.prototype.getLessSpecific = function (key) {
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

ListTrie.prototype.at = function (key) {
    let node = this.root;

    for (let n = 0; n < key.length; n++) {
        node = node[key[n] === '0' ? 'zero' : 'one'];

        if (!node) {
            return undefined;
        }
    }

    return node.values;
}

ListTrie.prototype.values = function () {
    const allValues = [];

    this._walk((key, values) => {
        allValues.push(values);
    });

    return allValues;
}

module.exports = ListTrie;
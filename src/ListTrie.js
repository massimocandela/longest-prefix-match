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

        if (this.index[key]) {
            this.index[key].push(value);
        } else {
            this.index[key] = [value];
        }
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
        return Object.values(this.index);
    }
}

module.exports = ListTrie;
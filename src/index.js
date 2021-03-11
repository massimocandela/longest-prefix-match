const ip = require("ip-sub");
const RadixTrie = require("radix-trie-js");

const LongestPrefixMatch = function () {
    this.keySizes = {
        v4: 12,
        v6: 24
    };

    this.reset = () => {
        this.data = {
            v4: new RadixTrie(),
            v6: new RadixTrie()
        };
    };

    this.getMatch = (prefix, all) => {
        const af = ip.getAddressFamily(prefix);
        const binaryNetmask = ip.getNetmask(prefix, af);

        return this._getMatch(binaryNetmask, af, all);
    };

    this._getMatch = (binaryNetmask, af, all) => {
        let matches;
        if (af === 4) {
            matches = this.data.v4.get(binaryNetmask.slice(0, this.keySizes.v4));
        } else {
            matches = this.data.v6.get(binaryNetmask.slice(0, this.keySizes.v6));
        }

        const filtered = matches.filter(match => match.binaryPrefix === binaryNetmask ||
            ip.isSubnetBinary(match.binaryPrefix, binaryNetmask));

        if (all) {
            return filtered.map(i => i.data);
        }

        const maxBits = (filtered[filtered.length - 1] || []).length;

        return filtered.filter(i => i.length === maxBits).map(i => i.data);
    };

    this.addPrefix = (prefix, data) => {
        const af = ip.getAddressFamily(prefix);
        const binaryPrefix = ip.getNetmask(prefix, af);

        return this._addPrefix(binaryPrefix, af, { prefix, data });
    };

    this.getData = () => {
        return this.data;
    };

    this.toArray = () => {
        return [].concat.apply([],[...this.data.v4.values(), ...this.data.v6.values()]);
    };

    this._addPrefix = (binaryPrefix, af, data) => {
        data.binaryPrefix = binaryPrefix;
        data.length = binaryPrefix.length;

        if (af === 4) {
            const key = binaryPrefix.slice(0, this.keySizes.v4);
            if (!this.data.v4.has(key)) {
                this.data.v4.add(key, []);
            }
            this.data.v4.get(key).push(data);
            this.data.v4.get(key).sort((a, b) => a.length - b.length);
        } else {
            const key = binaryPrefix.slice(0, this.keySizes.v6);
            if (!this.data.v6.has(key)) {
                this.data.v6.add(key, []);
            }
            this.data.v6.get(key).push(data);
            this.data.v6.get(key).sort((a, b) => a.length - b.length);
        }
    };

    this.reset();
};

module.exports = LongestPrefixMatch;






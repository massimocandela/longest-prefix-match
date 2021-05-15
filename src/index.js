const ip = require("ip-sub");
const RadixTrie = require("radix-trie-js");

const LongestPrefixMatch = function (params={}) {
    this.keySizes = params.keySizes || {
        v4: 9,
        v6: 24
    };

    this.reset = () => {
        this.data = {
            v4: new RadixTrie(),
            v6: new RadixTrie(),
            v4s: [],
            v6s: []
        };
    };

    this._get = (binaryNetmask, af) => {
        if (af === 4) {
            if (binaryNetmask.length < this.keySizes.v4) {
                return this.data.v4s;
            } else {
                return this.data.v4s.concat(this.data.v4.get(binaryNetmask.slice(0, this.keySizes.v4)) || []);
            }
        } else {
            if (binaryNetmask.length < this.keySizes.v6) {
                return this.data.v6s;
            } else {
                return this.data.v6s.concat(this.data.v6.get(binaryNetmask.slice(0, this.keySizes.v6)) || []);
            }
        }
    }

    this.getMatch = (prefix, all) => {
        const af = ip.getAddressFamily(prefix);
        const binaryNetmask = ip.getNetmask(prefix, af);

        return this._getMatch(binaryNetmask, af, all);
    };

    this._getMatch = (binaryNetmask, af, all) => {
        const matches = this._get(binaryNetmask, af);

        const filtered = matches.filter(match => match.binaryPrefix === binaryNetmask ||
            ip.isSubnetBinary(match.binaryPrefix, binaryNetmask));

        if (all) {
            return filtered.map(i => i.data);
        } else {
            const maxBits = (filtered[filtered.length - 1] || []).length;
            return filtered.filter(i => i.length === maxBits).map(i => i.data);
        }
    };

    this.addPrefix = (prefix, payload) => {
        const af = ip.getAddressFamily(prefix);
        const binaryPrefix = ip.getNetmask(prefix, af);

        return this._addPrefix(binaryPrefix, af, payload);
    };

    this.getData = () => {
        return this.data;
    };

    this.toArray = () => {
        return [].concat.apply([],[...this.data.v4s, ...this.data.v4.values(), ...this.data.v6s, ...this.data.v6.values()]).map(i => i.data);
    };

    this._addPrefix = (binaryPrefix, af, payload) => {
        const data = {
            data: payload,
            binaryPrefix,
            length: binaryPrefix.length
        }

        if (af === 4) {
            if (binaryPrefix.length < this.keySizes.v4) {
                this.data.v4s.push(data);
                this.data.v4s.sort((a, b) => a.length - b.length)
            } else {
                const key = binaryPrefix.slice(0, this.keySizes.v4);
                if (!this.data.v4.has(key)) {
                    this.data.v4.add(key, []);
                }
                this.data.v4.get(key).push(data);
                this.data.v4.get(key).sort((a, b) => a.length - b.length);
            }
        } else {
            if (binaryPrefix.length < this.keySizes.v6) {
                this.data.v6s.push(data);
                this.data.v6s.sort((a, b) => a.length - b.length)
            } else {
                const key = binaryPrefix.slice(0, this.keySizes.v6);
                if (!this.data.v6.has(key)) {
                    this.data.v6.add(key, []);
                }
                this.data.v6.get(key).push(data);
                this.data.v6.get(key).sort((a, b) => a.length - b.length);
            }
        }
    };

    this.reset();
};

module.exports = LongestPrefixMatch;






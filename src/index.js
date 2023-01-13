const ip = require("ip-sub");
const RadixTrie = require("radix-trie-js");

const LongestPrefixMatch = function (params={}) {
    this.length = 0;
    this.keySizes = params.keySizes || {
        v4: 12,
        v6: 24
    };

    this.reset = () => {
        this.length = 0;
        this.data = {
            v4: new RadixTrie(),
            v6: new RadixTrie(),
            v4s: {},
            v6s: {}
        };
    };

    this._get = (binaryNetmask, af) => {
        if (af === 4) {
            if (binaryNetmask.length < this.keySizes.v4) {
                return this.data.v4s;
            } else {
                return {
                    ...this.data.v4s,
                    ...this.data.v4.get(binaryNetmask.slice(0, this.keySizes.v4)) ?? {}
                };
            }
        } else {
            if (binaryNetmask.length < this.keySizes.v6) {
                return this.data.v6s;
            } else {
                return {
                    ...this.data.v6s,
                    ...this.data.v6.get(binaryNetmask.slice(0, this.keySizes.v6)) ?? {}
                };
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

        const filtered = {};
        for (let match of Object.values(matches).flat()) {
            if (match.binaryPrefix === binaryNetmask || ip.isSubnetBinary(match.binaryPrefix, binaryNetmask)) {
                filtered[match.length] = filtered[match.length] || [];
                filtered[match.length].push(match);
            }
        }

        if (all) {
            return Object.values(filtered).flat().map(i => i.data);
        } else {
            const maxBits = Math.max(...Object.keys(filtered)).toString();
            return (filtered[maxBits] || []).map(i => i.data);
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
        return [
            ...Object.values(this.data.v4s),
            ...[...this.data.v4.values()].map(i => Object.values(i).flat()).flat(),
            ...Object.values(this.data.v6s),
            ...[...this.data.v6.values()].map(i => Object.values(i).flat()).flat()
        ]
            .flat()
            .map(i => i.data);
    };

    this._addPrefix = (binaryPrefix, af, payload) => {
        this.length++;
        const data = {
            data: payload,
            binaryPrefix,
            length: binaryPrefix.length
        }

        if (af === 4) {
            if (binaryPrefix.length < this.keySizes.v4) {
                this.data.v4s[data.length] = this.data.v4s[data.length] || [];
                this.data.v4s[data.length].push(data);
                // this.data.v4s.sort((a, b) => a.length - b.length)
            } else {
                const key = binaryPrefix.slice(0, this.keySizes.v4);
                if (!this.data.v4.has(key)) {
                    this.data.v4.add(key, {});
                }
                const dict = this.data.v4.get(key);
                dict[data.length] = dict[data.length] || [];
                dict[data.length].push(data);
            }
        } else {
            if (binaryPrefix.length < this.keySizes.v6) {
                this.data.v6s[data.length] = this.data.v6s[data.length] || [];
                this.data.v6s[data.length].push(data);
            } else {
                const key = binaryPrefix.slice(0, this.keySizes.v6);
                if (!this.data.v6.has(key)) {
                    this.data.v6.add(key, {});
                }
                const dict = this.data.v6.get(key);
                dict[data.length] = dict[data.length] || [];
                dict[data.length].push(data);
            }
        }
    };

    this.reset();
};

module.exports = LongestPrefixMatch;
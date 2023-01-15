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
            v4s: [],
            v6s: []
        };
    };

    this.getMatch = (prefix, all) => {
        const af = ip.getAddressFamily(prefix);
        const binaryNetmask = ip.getNetmask(prefix, af);

        return this._getMatch(binaryNetmask, af, all).map(i => i.data);
    };

    this._getMatch = (binaryNetmask, af, all) => {

        const afKey = `v${af}`;
        let key = binaryNetmask;
        let results = [];

        for (let n=key.length; n > 0; n--) {
            key = binaryNetmask.slice(0, n);
            const result = this.data[afKey].get(key);

            if (result) {
                results = results.concat(result);

                if (!all) {
                    return results;
                }
            }
        }

        return results;
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
        this.length++;
        const data = {
            data: payload,
            binaryPrefix,
            length: binaryPrefix.length
        }

        const afKey = `v${af}`;
        const key = binaryPrefix;
        if (!this.data[afKey].has(key)) {
            this.data[afKey].add(key, []);
        }
        this.data[afKey].get(key).push(data);
    };

    this.reset();
};

module.exports = LongestPrefixMatch;
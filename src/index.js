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

    this.getMatch = (prefix) => {
        const af = ip.getAddressFamily(prefix);
        const binaryNetmask = ip.getNetmask(prefix, af);

        return this._getMatch(binaryNetmask, af);
    };

    this._getMatch = (binaryNetmask, af) => {
        if (af === 4) {
            return this.data.v4.get(binaryNetmask.slice(0, this.keySizes.v4));
        } else {
            return this.data.v6.get(binaryNetmask.slice(0, this.keySizes.v6));
        }
    };

    this.addPrefix = (prefix, data) => {
        const af = ip.getAddressFamily(prefix);
        const binaryPrefix = ip.getNetmask(prefix, af);

        return this._addPrefix(binaryPrefix, af, data);
    };

    this.getData = () => {
        return this.data;
    };

    this.toArray = () => {
        return [].concat.apply([],[...this.data.v4.values(), ...this.data.v6.values()]);
    };

    this._addPrefix = (binaryPrefix, af, data) => {

        if (af === 4) {
            const key = binaryPrefix.slice(0, this.keySizes.v4);
            if (!this.data.v4.has(key)) {
                this.data.v4.add(key, []);
            }
            this.data.v4.get(key).push(data);
        } else {
            const key = binaryPrefix.slice(0, this.keySizes.v6);
            if (!this.data.v6.has(key)) {
                this.data.v6.add(key, []);
            }
            this.data.v6.get(key).push(data);
        }
    };

    this.reset();
};

module.exports = LongestPrefixMatch;






const ip = require("ip-sub");
const ListTrie = require('./ListTrie');

const LongestPrefixMatch = function (params={}) {
    this.length = 0;

    this.reset = () => {
        this.length = 0;
        this.data = {
            v4: new ListTrie(),
            v6: new ListTrie()
        };
    };

    this.getMatch = (prefix, all) => {
        const af = ip.getAddressFamily(prefix);
        const binaryNetmask = ip.applyNetmask(prefix, af);

        return this._getMatch(binaryNetmask, af, all).map(i => i.data);
    };

    this.getLessSpecificMatch = (prefix) => {
        const af = ip.getAddressFamily(prefix);
        const binaryNetmask = ip.applyNetmask(prefix, af);

        return this._getLessSpecificMatch(binaryNetmask, af).map(i => i.data);
    };

    this._getLessSpecificMatch = (binaryNetmask, af) => {

        const afKey = `v${af}`;
        let key = binaryNetmask;

        for (let n=1; n <= binaryNetmask.length; n++) {
            key = binaryNetmask.slice(0, n);
            const result = this.data[afKey].at(key);

            if (result) {
                return result;
            }
        }

        return [];
    };

    this._getMatch = (binaryNetmask, af, all) => {

        const afKey = `v${af}`;
        let key = binaryNetmask;

        return this.data[afKey].get(key, all);
    };

    this.addPrefix = (prefix, payload) => {
        const af = ip.getAddressFamily(prefix);
        const binaryPrefix = ip.applyNetmask(prefix, af);

        return this._addPrefix(binaryPrefix, af, payload);
    };

    this.getData = () => {
        return this.data;
    };

    this.toArray = () => {
        return [...this.data.v4.values(), ...this.data.v6.values()].flat().map(i => i.data);
    };

    this._addPrefix = (binaryPrefix, af, payload) => {
        this.length++;
        const data = {
            data: payload,
            binaryPrefix,
            length: binaryPrefix.length
        }

        const afKey = `v${af}`;

        this.data[afKey].add(binaryPrefix, data);
    };

    this.reset();
};

module.exports = LongestPrefixMatch;

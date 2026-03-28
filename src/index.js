const ip = require("ip-sub");
const ListTrie = require('./ListTrie');

const LongestPrefixMatch = function (params={}) {
    this.length = 0;
    this.reset();
};

LongestPrefixMatch.prototype.reset = function () {
    this.length = 0;
    this.data = {
        v4: new ListTrie(),
        v6: new ListTrie()
    };
};

LongestPrefixMatch.prototype.getMatch = function (prefix, all) {
    const af = ip.getAddressFamily(prefix);
    const binaryNetmask = ip.applyNetmask(prefix, af);

    return this._getMatch(binaryNetmask, af, all).map(i => i.data);
};

LongestPrefixMatch.prototype.getLessSpecificMatch = function (prefix) {
    const af = ip.getAddressFamily(prefix);
    const binaryNetmask = ip.applyNetmask(prefix, af);

    return this._getLessSpecificMatch(binaryNetmask, af).map(i => i.data);
};

LongestPrefixMatch.prototype._getLessSpecificMatch = function (binaryNetmask, af) {

    const afKey = `v${af}`;
    return this.data[afKey].getLessSpecific(binaryNetmask);
};

LongestPrefixMatch.prototype._getMatch = function (binaryNetmask, af, all) {

    const afKey = `v${af}`;
    return this.data[afKey].get(binaryNetmask, all);
};

LongestPrefixMatch.prototype.addPrefix = function (prefix, payload) {
    const af = ip.getAddressFamily(prefix);
    const binaryPrefix = ip.applyNetmask(prefix, af);

    return this._addPrefix(binaryPrefix, af, payload);
};

LongestPrefixMatch.prototype.getData = function () {
    this.data.v4.rebuildIndex();
    this.data.v6.rebuildIndex();
    return this.data;
};

LongestPrefixMatch.prototype.toArray = function () {
    return [...this.data.v4.values(), ...this.data.v6.values()].flat().map(i => i.data);
};

LongestPrefixMatch.prototype._addPrefix = function (binaryPrefix, af, payload) {
    this.length++;
    const data = {
        data: payload,
        binaryPrefix,
        length: binaryPrefix.length
    }

    const afKey = `v${af}`;

    this.data[afKey].add(binaryPrefix, data);
};

module.exports = LongestPrefixMatch;

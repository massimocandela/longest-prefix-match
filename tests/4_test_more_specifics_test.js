const chai = require("chai");
const LongestPrefixMatch = require("../src/index.js");
const expect = chai.expect;
const asyncTimeout = 120000;

// Helper: load an array of prefix strings (using the prefix itself as payload)
// and return a fresh LongestPrefixMatch instance.
function buildLpm(prefixes) {
    const lpm = new LongestPrefixMatch();
    prefixes.forEach(prefix => lpm.addPrefix(prefix, { prefix }));
    return lpm;
}

// Helper: extract the prefix strings from the returned payloads and sort them
// so that assertions are order-independent.
function toSortedStrings(results) {
    return results.map(i => i.prefix).sort();
}

describe("getOnlyMoreSpecifics", function () {

    it("basic case", function (done) {
        const lpm = buildLpm(["123.0.0.0/16", "123.0.0.0/24", "124.0.0.0/18"]);

        const result = toSortedStrings(lpm.getOnlyMoreSpecifics());

        // 123.0.0.0/16 is a parent of 123.0.0.0/24: excluded
        // 123.0.0.0/24 has no more-specific in the trie: kept
        // 124.0.0.0/18 has no parent and no more-specific: kept
        expect(result).to.deep.equal(["123.0.0.0/24", "124.0.0.0/18"].sort());
        done();
    }).timeout(asyncTimeout);

    it("returns all prefixes when none is more specific than another", function (done) {
        const prefixes = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"];
        const lpm = buildLpm(prefixes);

        const result = toSortedStrings(lpm.getOnlyMoreSpecifics());

        // No prefix covers any other, so all three are leaves
        expect(result).to.deep.equal([...prefixes].sort());
        done();
    }).timeout(asyncTimeout);

    it("returns only the most specific prefix in a three-level chain", function (done) {
        const lpm = buildLpm(["10.0.0.0/8", "10.0.0.0/16", "10.0.0.0/24"]);

        const result = toSortedStrings(lpm.getOnlyMoreSpecifics());

        // /8 is a parent of /16; /16 is a parent of /24: only /24 is a leaf
        expect(result).to.deep.equal(["10.0.0.0/24"]);
        done();
    }).timeout(asyncTimeout);

    it("returns multiple leaves that share the same parent", function (done) {
        const lpm = buildLpm(["10.0.0.0/8", "10.0.0.0/16", "10.1.0.0/16"]);

        const result = toSortedStrings(lpm.getOnlyMoreSpecifics());

        // 10.0.0.0/8 is a parent of both /16s: excluded
        // Both /16s are leaves: kept
        expect(result).to.deep.equal(["10.0.0.0/16", "10.1.0.0/16"].sort());
        done();
    }).timeout(asyncTimeout);

    it("works correctly with IPv6 prefixes", function (done) {
        const lpm = buildLpm([
            "2001:db8::/32",
            "2001:db8::/48",
            "2001:db8::/64"
        ]);

        const result = toSortedStrings(lpm.getOnlyMoreSpecifics());

        // /32 and /48 are parents: only /64 is a leaf
        expect(result).to.deep.equal(["2001:db8::/64"]);
        done();
    }).timeout(asyncTimeout);

    it("handles a mix of IPv4 and IPv6 prefixes independently", function (done) {
        const lpm = buildLpm([
            "10.0.0.0/8",
            "10.0.0.0/24",
            "2001:db8::/32",
            "2001:db8::/48"
        ]);

        const result = toSortedStrings(lpm.getOnlyMoreSpecifics());

        // IPv4: 10.0.0.0/8 is a parent: only 10.0.0.0/24 kept
        // IPv6: 2001:db8::/32 is a parent: only 2001:db8::/48 kept
        expect(result).to.deep.equal(["10.0.0.0/24", "2001:db8::/48"].sort());
        done();
    }).timeout(asyncTimeout);

    it("returns an empty array when the trie is empty", function (done) {
        const lpm = new LongestPrefixMatch();

        const result = lpm.getOnlyMoreSpecifics();

        expect(result).to.deep.equal([]);
        done();
    }).timeout(asyncTimeout);

    it("returns the single prefix when only one prefix is loaded", function (done) {
        const lpm = buildLpm(["192.168.1.0/24"]);

        const result = toSortedStrings(lpm.getOnlyMoreSpecifics());

        expect(result).to.deep.equal(["192.168.1.0/24"]);
        done();
    }).timeout(asyncTimeout);

    it("excludes all duplicate entries of a parent prefix", function (done) {
        // 123.0.0.0/16 is added twice; since 123.0.0.0/24 is more specific,
        // both copies of /16 must be excluded from the result.
        const lpm = new LongestPrefixMatch();
        lpm.addPrefix("123.0.0.0/16", { prefix: "123.0.0.0/16", copy: 1 });
        lpm.addPrefix("123.0.0.0/16", { prefix: "123.0.0.0/16", copy: 2 });
        lpm.addPrefix("123.0.0.0/24", { prefix: "123.0.0.0/24" });

        const result = lpm.getOnlyMoreSpecifics();

        expect(result.map(i => i.prefix)).to.deep.equal(["123.0.0.0/24"]);
        done();
    }).timeout(asyncTimeout);

    it("returns both duplicate entries when duplicates are the only leaves", function (done) {
        // Two payloads stored at exactly the same prefix with no more-specific sibling.
        const lpm = new LongestPrefixMatch();
        lpm.addPrefix("10.0.0.0/8", { prefix: "10.0.0.0/8", copy: 1 });
        lpm.addPrefix("10.0.0.0/8", { prefix: "10.0.0.0/8", copy: 2 });

        const result = lpm.getOnlyMoreSpecifics();

        // The /8 key has no more-specific sibling: it is a leaf and both copies are returned
        expect(result.length).to.equal(2);
        expect(result.every(i => i.prefix === "10.0.0.0/8")).to.equal(true);
        done();
    }).timeout(asyncTimeout);

});


const chai = require("chai");
const chaiSubset = require('chai-subset');
const LongestPrefixMatch = require('../src/index.js');
chai.use(chaiSubset);
const expect = chai.expect;
const asyncTimeout = 120000;

const somePrefixes = [
    "77.160.0.0/13",
    "77.160.0.0/13",
    "77.160.0.0/16",
    "143.0.0.0/21",
    "143.0.0.0/24",
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334/64",
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334/48"
]

describe("Tests", function () {
    const longestPrefixMatch = new LongestPrefixMatch();

    somePrefixes.forEach(prefix => longestPrefixMatch.addPrefix(prefix, { prefix }));

    it("match - v4", function(done) {

        const match1 = longestPrefixMatch.getMatch("143.0.0.0/21", false).map(i => i.prefix).join("-");
        expect(match1).to.equal( '143.0.0.0/21');

        const match1r = longestPrefixMatch.getMatch("143.0.0.0/21", true).map(i => i.prefix).join("-");
        expect(match1r).to.equal( '143.0.0.0/21');

        const match2 = longestPrefixMatch.getMatch("143.0.0.0/22", false).map(i => i.prefix).join("-");
        expect(match2).to.equal( '143.0.0.0/21');

        const match3 = longestPrefixMatch.getMatch("143.0.0.0/26", false).map(i => i.prefix).join("-");
        expect(match3).to.equal( '143.0.0.0/24');

        const match4 = longestPrefixMatch.getMatch("143.0.0.0/26", true).map(i => i.prefix).join("-");
        expect(match4).to.equal( '143.0.0.0/21-143.0.0.0/24');

        const match5 = longestPrefixMatch.getMatch("143.0.0.0/21", true).map(i => i.prefix).join("-");
        expect(match5).to.equal( '143.0.0.0/21');

        done();
    })
        .timeout(asyncTimeout);

    it("duplicates - v4", function(done) {
        const match1 = longestPrefixMatch.getMatch("77.160.0.0/19", true).map(i => i.prefix).join("-");
        expect(match1).to.equal([ '77.160.0.0/13', '77.160.0.0/13', '77.160.0.0/16' ].join("-"));

        const match2 = longestPrefixMatch.getMatch("77.160.0.0/13", true).map(i => i.prefix).join("-");
        expect(match2).to.equal([ '77.160.0.0/13', '77.160.0.0/13' ].join("-"));
        done();
    })
        .timeout(asyncTimeout);

    it("match - v6", function(done) {
        const match = longestPrefixMatch.getMatch("2001:0db8:85a3:0000:0000:8a2e:0370:7334/84").map(i => i.prefix).join("-");
        expect(match).to.equal('2001:0db8:85a3:0000:0000:8a2e:0370:7334/64');

        const match2 = longestPrefixMatch.getMatch("2001:0db8:85a3:0000:0000:8a2e:0370:7334/84", true).map(i => i.prefix).join("-");
        expect(match2).to.equal('2001:0db8:85a3:0000:0000:8a2e:0370:7334/48-2001:0db8:85a3:0000:0000:8a2e:0370:7334/64');

        done();
    })
        .timeout(asyncTimeout);


    it("no match - v4", function(done) {
        const match = longestPrefixMatch.getMatch("143.0.0.0/20").map(i => i.prefix).join("-");

        expect(match).to.equal('');
        done();
    })
        .timeout(asyncTimeout);

    it("no match - v6", function(done) {
        const match = longestPrefixMatch.getMatch("2001:0db8:85a3:0000:0000:8a2e:0370:7334/32").map(i => i.prefix).join("-");

        expect(match).to.equal('');
        done();
    })
        .timeout(asyncTimeout);

});

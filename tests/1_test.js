const chai = require("chai");
const chaiSubset = require('chai-subset');
const LongestPrefixMatch = require('../src/index.js');
chai.use(chaiSubset);
const expect = chai.expect;
const asyncTimeout = 120000;
const ip = require("ip-sub");

const somePrefixes = [
    "77.160.0.0/13",
    "77.160.0.0/13",
    "77.160.0.0/16",
    "143.0.0.0/21",
    "143.0.0.0/24",
    "160.0.0.0/6",
    "160.0.0.0/8",
    "160.0.0.0/24",
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334/64",
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334/48"
]

function sortByPrefixLength(list) {
    return list.sort((a, b) => ip.sortByPrefixLength(a, b));
}
describe("Tests", function () {
    const longestPrefixMatch = new LongestPrefixMatch();

    somePrefixes.forEach(prefix => longestPrefixMatch.addPrefix(prefix, { prefix }));

    it("match - v4", function(done) {

        const match1 = sortByPrefixLength(longestPrefixMatch.getMatch("143.0.0.0/21", false).map(i => i.prefix)).join("-");
        expect(match1).to.equal( '143.0.0.0/21');

        const match1r = sortByPrefixLength(longestPrefixMatch.getMatch("143.0.0.0/21", true).map(i => i.prefix)).join("-");
        expect(match1r).to.equal( '143.0.0.0/21');

        const match2 = sortByPrefixLength(longestPrefixMatch.getMatch("143.0.0.0/22", false).map(i => i.prefix)).join("-");
        expect(match2).to.equal( '143.0.0.0/21');

        const match3 = sortByPrefixLength(longestPrefixMatch.getMatch("143.0.0.0/26", false).map(i => i.prefix)).join("-");
        expect(match3).to.equal( '143.0.0.0/24');

        const match4 = sortByPrefixLength(longestPrefixMatch.getMatch("143.0.0.0/26", true).map(i => i.prefix)).join("-");
        expect(match4).to.equal( '143.0.0.0/21-143.0.0.0/24');

        const match5 = sortByPrefixLength(longestPrefixMatch.getMatch("143.0.0.0/21", true).map(i => i.prefix)).join("-");
        expect(match5).to.equal( '143.0.0.0/21');

        const match6 = sortByPrefixLength(longestPrefixMatch.getMatch("160.0.0.0/9", false).map(i => i.prefix)).join("-");
        expect(match6).to.equal( '160.0.0.0/8');

        const match7 = sortByPrefixLength(longestPrefixMatch.getMatch("160.0.0.0/25", false).map(i => i.prefix)).join("-");
        expect(match7).to.equal( '160.0.0.0/24');

        const match8 = sortByPrefixLength(longestPrefixMatch.getMatch("160.0.0.0/25", true).map(i => i.prefix)).join("-");
        expect(match8).to.equal( '160.0.0.0/6-160.0.0.0/8-160.0.0.0/24');



        done();
    })
        .timeout(asyncTimeout);

    it("duplicates - v4", function(done) {
        const match1 = sortByPrefixLength(longestPrefixMatch.getMatch("77.160.0.0/19", true).map(i => i.prefix)).join("-");
        expect(match1).to.equal([ '77.160.0.0/13', '77.160.0.0/13', '77.160.0.0/16' ].join("-"));

        const match2 = sortByPrefixLength(longestPrefixMatch.getMatch("77.160.0.0/13", true).map(i => i.prefix)).join("-");
        expect(match2).to.equal([ '77.160.0.0/13', '77.160.0.0/13' ].join("-"));
        done();
    })
        .timeout(asyncTimeout);

    it("match - v6", function(done) {
        const match = sortByPrefixLength(longestPrefixMatch.getMatch("2001:0db8:85a3:0000:0000:8a2e:0370:7334/84").map(i => i.prefix)).join("-");
        expect(match).to.equal('2001:0db8:85a3:0000:0000:8a2e:0370:7334/64');

        const match2 = sortByPrefixLength(longestPrefixMatch.getMatch("2001:0db8:85a3:0000:0000:8a2e:0370:7334/84", true).map(i => i.prefix)).join("-");
        expect(match2).to.equal('2001:0db8:85a3:0000:0000:8a2e:0370:7334/48-2001:0db8:85a3:0000:0000:8a2e:0370:7334/64');

        done();
    })
        .timeout(asyncTimeout);


    it("no match - v4", function(done) {
        const match = sortByPrefixLength(longestPrefixMatch.getMatch("143.0.0.0/20").map(i => i.prefix)).join("-");
        expect(match).to.equal('');

        const match9 = sortByPrefixLength(longestPrefixMatch.getMatch("160.0.0.0/1", true).map(i => i.prefix)).join("-");
        expect(match9).to.equal( '');

        done();
    })
        .timeout(asyncTimeout);

    it("no match - v6", function(done) {
        const match = sortByPrefixLength(longestPrefixMatch.getMatch("2001:0db8:85a3:0000:0000:8a2e:0370:7334/32").map(i => i.prefix)).join("-");

        expect(match).to.equal('');
        done();
    })
        .timeout(asyncTimeout);

    it("less specific", function(done) {
        const match1 = sortByPrefixLength(longestPrefixMatch.getLessSpecificMatch("160.0.0.0/24").map(i => i.prefix)).join("-");
        const match2 = sortByPrefixLength(longestPrefixMatch.getLessSpecificMatch("2001:0db8:85a3:0000:0000:8a2e:0370:7334/64").map(i => i.prefix)).join("-");
        const match3 = sortByPrefixLength(longestPrefixMatch.getLessSpecificMatch("2001:0db8:85a3:0000:0000:8a2e:0370:7334/48").map(i => i.prefix)).join("-");

        expect(match1).to.equal('160.0.0.0/6');
        expect(match2).to.equal("2001:0db8:85a3:0000:0000:8a2e:0370:7334/48");
        expect(match3).to.equal("2001:0db8:85a3:0000:0000:8a2e:0370:7334/48");
        done();
    })
        .timeout(asyncTimeout);


    it("export to array", function(done) {
        const arr = longestPrefixMatch.toArray();
        expect(arr.length > 0).to.equal(true);
        expect(somePrefixes.every(i => arr.map(i => i.prefix).includes(i))).to.equal(true);
        done();
    }).timeout(asyncTimeout);

    it("length", function(done) {
        expect(longestPrefixMatch.length).to.equal(10);
        longestPrefixMatch.reset();
        expect(longestPrefixMatch.length).to.equal(0);
        done();
    })
});

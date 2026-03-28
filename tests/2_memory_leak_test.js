const chai = require("chai");
const chaiSubset = require('chai-subset');
const LongestPrefixMatch = require("../src/index.js");
chai.use(chaiSubset);
const expect = chai.expect;

const prefixes = [
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
];

function heapUsedAfterGc() {
    global.gc();
    return process.memoryUsage().heapUsed;
}

describe("Memory regression", function () {
    it("does not retain heap after repeated build/query/reset cycles", function (done) {
        if (typeof global.gc !== "function") {
            this.skip();
            return;
        }

        const baseline = heapUsedAfterGc();

        for (let round = 0; round < 3000; round++) {
            const lpm = new LongestPrefixMatch();

            for (let i = 0; i < prefixes.length; i++) {
                lpm.addPrefix(prefixes[i], {prefix: prefixes[i], round, i});
            }

            for (let i = 0; i < 100; i++) {
                lpm.getMatch("160.0.0.0/25", true);
                lpm.getMatch("143.0.0.0/22", false);
                lpm.getLessSpecificMatch("2001:0db8:85a3:0000:0000:8a2e:0370:7334/64");
            }

            lpm.reset();
        }

        const after = heapUsedAfterGc();
        const growthBytes = after - baseline;

        // Allow a small buffer for allocator/runtime noise across environments.
        const growthBudgetBytes = 8 * 1024 * 1024;
        expect(growthBytes).to.be.below(growthBudgetBytes);
        done();
    }).timeout(30000);
});

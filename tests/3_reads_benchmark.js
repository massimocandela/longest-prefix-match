const LongestPrefixMatch = require("../src/index.js");

function pad(value, width) {
    const s = String(value);
    return s.length >= width ? s : " ".repeat(width - s.length) + s;
}

function formatOps(ops) {
    return Number.isFinite(ops) ? Math.round(ops).toLocaleString("en-US") : "n/a";
}

function nowNs() {
    return process.hrtime.bigint();
}

function nsToMs(ns) {
    return Number(ns) / 1e6;
}

function buildDataset() {
    const lpm = new LongestPrefixMatch();

    for (let a = 1; a <= 223; a++) {
        lpm.addPrefix(`${a}.0.0.0/8`, { prefix: `${a}.0.0.0/8` });
    }

    for (let a = 1; a <= 223; a++) {
        for (let b = 0; b < 8; b++) {
            lpm.addPrefix(`${a}.${b * 32}.0.0/11`, { prefix: `${a}.${b * 32}.0.0/11` });
            lpm.addPrefix(`${a}.${b * 32}.0.0/16`, { prefix: `${a}.${b * 32}.0.0/16` });
        }
    }

    for (let i = 0; i < 512; i++) {
        const g2 = (i >> 8) & 0xff;
        const g3 = i & 0xff;
        lpm.addPrefix(`2001:db8:${g2.toString(16)}:${g3.toString(16)}::/48`, {
            prefix: `2001:db8:${g2.toString(16)}:${g3.toString(16)}::/48`
        });
        lpm.addPrefix(`2001:db8:${g2.toString(16)}:${g3.toString(16)}::/64`, {
            prefix: `2001:db8:${g2.toString(16)}:${g3.toString(16)}::/64`
        });
    }

    return lpm;
}

function buildQueries() {
    const v4Queries = [];
    for (let a = 1; a <= 223; a++) {
        for (let b = 0; b < 8; b++) {
            v4Queries.push(`${a}.${b * 32}.123.45/32`);
            v4Queries.push(`${a}.${b * 32}.10.0/24`);
            v4Queries.push(`${a}.${b * 32}.0.0/15`);
        }
    }

    const v6Queries = [];
    for (let i = 0; i < 1024; i++) {
        const g2 = (i >> 8) & 0xff;
        const g3 = i & 0xff;
        v6Queries.push(`2001:db8:${g2.toString(16)}:${g3.toString(16)}::1/128`);
        v6Queries.push(`2001:db8:${g2.toString(16)}:${g3.toString(16)}::/64`);
    }

    return {
        mixed: v4Queries.concat(v6Queries),
        v4: v4Queries,
        v6: v6Queries
    };
}

function benchScenario({ name, durationMs, warmupMs, fn }) {
    const warmupEnd = Date.now() + warmupMs;
    let warmupIters = 0;
    while (Date.now() < warmupEnd) {
        fn(warmupIters++);
    }

    const start = nowNs();
    const deadline = Date.now() + durationMs;
    let iters = 0;
    while (Date.now() < deadline) {
        fn(iters++);
    }
    const elapsedNs = nowNs() - start;
    const elapsedMs = nsToMs(elapsedNs);
    const opsPerSec = (iters * 1000) / elapsedMs;

    return {
        name,
        iterations: iters,
        elapsedMs,
        opsPerSec
    };
}

function summarize(results) {
    const score = results.reduce((acc, r) => acc + r.opsPerSec, 0) / results.length;
    return {
        score,
        results
    };
}

function printHuman(summary, config) {
    console.log("Read benchmark");
    console.log(`Node: ${process.version}`);
    console.log(`Duration per scenario: ${config.durationMs}ms (warmup ${config.warmupMs}ms)`);
    console.log("");
    console.log(`${pad("Scenario", 38)}  ${pad("Ops/s", 12)}  ${pad("Iterations", 12)}  ${pad("Elapsed(ms)", 12)}`);
    console.log("-".repeat(82));

    for (const r of summary.results) {
        console.log(`${pad(r.name, 38)}  ${pad(formatOps(r.opsPerSec), 12)}  ${pad(r.iterations, 12)}  ${pad(r.elapsedMs.toFixed(1), 12)}`);
    }

    console.log("-".repeat(82));
    console.log(`${pad("Composite read score (avg ops/s)", 38)}  ${pad(formatOps(summary.score), 12)}`);
}

function main() {
    const durationMs = Number(process.env.BENCH_DURATION_MS || 1500);
    const warmupMs = Number(process.env.BENCH_WARMUP_MS || 300);
    const asJson = process.argv.includes("--json");

    const lpm = buildDataset();
    const queries = buildQueries();

    const results = [
        benchScenario({
            name: "getMatch(all=false) mixed",
            durationMs,
            warmupMs,
            fn: (i) => {
                const q = queries.mixed[i % queries.mixed.length];
                lpm.getMatch(q, false);
            }
        }),
        benchScenario({
            name: "getMatch(all=true) mixed",
            durationMs,
            warmupMs,
            fn: (i) => {
                const q = queries.mixed[i % queries.mixed.length];
                lpm.getMatch(q, true);
            }
        }),
        benchScenario({
            name: "getLessSpecificMatch mixed",
            durationMs,
            warmupMs,
            fn: (i) => {
                const q = queries.mixed[i % queries.mixed.length];
                lpm.getLessSpecificMatch(q);
            }
        }),
        benchScenario({
            name: "getMatch(all=false) v4",
            durationMs,
            warmupMs,
            fn: (i) => {
                const q = queries.v4[i % queries.v4.length];
                lpm.getMatch(q, false);
            }
        }),
        benchScenario({
            name: "getMatch(all=false) v6",
            durationMs,
            warmupMs,
            fn: (i) => {
                const q = queries.v6[i % queries.v6.length];
                lpm.getMatch(q, false);
            }
        })
    ];

    const summary = summarize(results);

    if (asJson) {
        console.log(JSON.stringify({
            benchmark: "reads",
            node: process.version,
            durationMs,
            warmupMs,
            compositeScoreOpsPerSec: summary.score,
            scenarios: summary.results
        }, null, 2));
        return;
    }

    printHuman(summary, { durationMs, warmupMs });
}

main();

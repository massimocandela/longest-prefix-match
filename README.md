# longest-prefix-match

This is a JavaScript implementation of the IP (v4 and v6) longest prefix match algorithm.
It is optimized for performance, e.g., it takes into consideration the current (2020) v4 and v6 address space allocation distribution to balance the data structure.

It works in the browser and in Node.js, it allows lookups in less than 0.05ms per prefix.

The data structure it's based on a concatenation of hashmaps and radix tries working on the binary representation of the prefixes. Arrays are used to manage duplicate data entries. It is optimized for read operations, at the expense of write operations and memory usage.


## Install
Run: 
`npm install longest-prefix-match`

## Usage

```javascript
const LongestPrefixMatch = require("longest-prefix-match");

// Create an instance 
const longestPrefixMatch = new LongestPrefixMatch();

// Add one or more prefixes to the data structure. 
// The second parameter is a data object that will be associated to the prefix, it can contain whatever you would like.
longestPrefixMatch.addPrefix("213.74.5.0/24", { match: "213.74.5.0/24", something: false });
longestPrefixMatch.addPrefix("213.74.5.0/26", { match: "213.74.5.0/26", something: true });

// You can retrive the data object associated with the longest-prefix-match prefix
longestPrefixMatch.getMatch("213.74.5.60/32"); // returns [{ match: "213.74.5.0/26", something: true }]
longestPrefixMatch.getMatch("213.74.5.70/32"); // returns [{ match: "213.74.5.0/24", something: false }]
longestPrefixMatch.getMatch("213.74.5.0/28"); // returns [{ match: "213.74.5.0/26", something: true }]

// You can retrieve all the containing prefixes as well
longestPrefixMatch.getMatch("213.74.5.0/28", true); // returns [{ match: "213.74.5.0/26", something: true }, { match: "213.74.5.0/24", something: false }]

longestPrefixMatch.getMatch("213.74.5.0/25", true); // returns [{ match: "213.74.5.0/24", something: false }]

longestPrefixMatch.getLessSpecificMatch("213.74.5.0/28"); // returns [{match: ""213.74.5.0/24"}]

```

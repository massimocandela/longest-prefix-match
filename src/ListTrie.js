const ListTrie = function () {
    this.index = {};

    this.reset = () => {
        this.index = {};
    }

    this.add = (key, value) => {

        if (this.index[key]) {
            this.index[key].push(value);
        } else {
            this.index[key] = [value];
        }
    }

    this.get = (key, all) => {
        let results = [];
        for (let n=key.length; n >= 1; n--) {
            const result = this.index[key.slice(0, n)];
            if (result) {
                results = results.concat(result);
                if (!all) {
                    break;
                }
            }
        }

        return results;
    }

    this.values = () => {
        return Object.values(this.index);
    }
}

module.exports = ListTrie;
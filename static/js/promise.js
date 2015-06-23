var CrapPromise;

(function () {
    CrapPromise = function (func) {
        // Crappy temporary stand-in for a proper promise framework (or native)
        this._thens = [];
        var resolve = this.resolve.bind(this);
        var reject = function () { 
            // Non working dummy
        };

        // Defer so "thens" can be chained before
        setTimeout(function () {
            func(resolve, reject);
        }, 1);
    }

    CrapPromise.prototype.resolve = function (val) {
        if (this._thens.length) {
            var f = this._thens.shift()
            var ret = f(val);
            if (ret && ret.then && ret.then instanceof Function) {
                ret.then(this.resolve.bind(this));
            }
            else {
                this.resolve(ret);
            }
        }
    };

    CrapPromise.prototype.then = function (func) {
        this._thens.push(func);
        return this;
    };

})()

var _ = require('underscore');

function Sequence(callback) {
    this.callback = callback || null;
    this.counter = 1;
}

Sequence.prototype.clone = function() {
    return new Sequence(this.callback);
};

Sequence.prototype.next = function() {
    var result;
    if (this.callback) {
        result = this.callback(this.counter);
    } else {
        result = this.counter;
    }
    this.counter++;
    return result;
};


function LazyAttribute(callback) {
    this.callback = callback;
}

LazyAttribute.prototype.clone = function() {
    return new LazyAttribute(this.callback);
};

LazyAttribute.prototype.evaluate = function(obj) {
    return this.callback(obj);
};


function SubFactory(factory) {
    var attributes = _.chain(factory.attributes)
        .map(function(value, key) {
            if (_.isFunction(value.clone)) {
                value = value.clone();
            } else {
                value = _.clone(value);
            }
            return [key, value];
        })
        .object()     
        .value();
    this.factory = new Factory(attributes);
}

SubFactory.prototype.clone = function() {
    return new SubFactory(this.factory);
};

SubFactory.prototype.create = function(overrides) {
    return this.factory.create(overrides);
};


function Factory(attributes) {
    this.attributes = attributes;
}

Factory.prototype.create = function(overrides) {
    var lazyAttributes = {};

    var fixture =  _.chain(this.attributes)
        .map(_.bind(function(value, key) {
            var override;
            if (overrides && _.has(overrides, key)) {
                override = overrides[key];
            }
            if (value instanceof SubFactory) {
                value = value.create(override);
            } else {
                if (override)
                    value = override;
                
                if (value instanceof Sequence) {
                    value = value.next();
                } else if (value instanceof LazyAttribute) {
                    lazyAttributes[key] = value;
                }
            }
            return [key, value];
        }, this))
        .object()
        .value();

    fixture = _.extend(fixture, _.object(
        _.map(lazyAttributes, function(lazyAttribute, key) {
            return [key, lazyAttribute.evaluate(fixture)];
        })
    ));

    if (overrides) {
        var keys = _.keys(overrides);
        var additionals = _.reject(keys, _.bind(function(key) {
            return _.has(this.attributes, key);
        }, this));
        fixture = _.extend(fixture, _.object(
            _.map(additionals, function(key) {
                return [key, overrides[key]];
            })
        ));
    }

    return fixture;
}


module.exports.Sequence = function (callback) {
    return new Sequence(callback);
};

module.exports.LazyAttribute = function(callback) {
    return new LazyAttribute(callback);
};

module.exports.Factory = function(attributes) {
    var factory = new Factory(attributes);
    var factoryMethod = _.bind(factory.create, factory);
    factoryMethod.__factory__ = factory;
    return factoryMethod;
};

module.exports.SubFactory = function(factoryMethod) {
    return new SubFactory(factoryMethod.__factory__);
}

Set.prototype.intersection = function (otherSet) {
    var intersectionSet = new Set();
    for (var elem of otherSet) {
        if (this.has(elem))
            intersectionSet.add(elem);
    }
    return intersectionSet;
}

Set.prototype.union = function (otherSet) {
    var unionSet = new Set();
    for (var elem of this) {
        unionSet.add(elem);
    }
    for (var elem of otherSet)
        unionSet.add(elem);
    return unionSet;
}

function jsonEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

module.exports = {
    jsonEqual: jsonEqual
};
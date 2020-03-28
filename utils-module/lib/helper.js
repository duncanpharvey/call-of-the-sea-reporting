function difference(Set) {
    Set.prototype.difference = function (otherSet) {
        var differenceSet = new Set();
        for (var elem of this) {
            if (!otherSet.has(elem))
                differenceSet.add(elem);
        }
        return differenceSet;
    }
}

exports.difference = difference;
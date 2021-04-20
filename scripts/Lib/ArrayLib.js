Array.prototype.delete = function(elem) {
    let ind = this.indexOf(elem);
    if (ind != -1) {
        this.splice(ind, 1);
        return true;
    }
    return false;
};

Array.prototype.binarySearch = function(val, comp = (v, elem) => v - elem) {
    let left = 0;
    let right = this.length;
    while (left < right) {
        let mid = Math.floor((left + right) / 2);
        let compRes = comp(val, this[mid]);
        if (compRes < 0) {
            right = mid;
        } else if (compRes > 0) {
            left = mid + 1;
        } else {
            return mid;
        }
    }
    return right;
};
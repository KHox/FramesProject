/**
 * @param {Function} f 
 */
export function getFunctionBody(f) {
    let s = f.toString();
    let i = s.indexOf('(') + 1;
    if (!i) return null;
    let lvl = 1;
    for (; i < s.length; i++) {
        switch (s[i]) {
            case ')':
                lvl--;
                break;
            case '(':
                lvl++;
                break;
        }

        if (!lvl) break;
    }

    if (lvl) {
        return null;
    } else {
        i = s.indexOf('{', i) + 1;
        let left = i;
        if (!i) return null;
        lvl = 1;
        for (; i < s.length; i++) {
            switch (s[i]) {
                case '}':
                    lvl--;
                    break;
                case '{':
                    lvl++;
                    break;
            }
    
            if (!lvl) {
                return s.slice(left, i).trim();
            }
        }

        return null;
    }
}

Function.prototype.getFunctionBody = function() {
    return getFunctionBody(this);
};
import { isEmpty } from "../scripts/Lib/index.js";

export class APIHelper {
    constructor(explorer, main, offset, opened) {
        this._explorer = explorer;
        this._main = main;
        this._offset = offset;
        this._opened = opened;
        this.add(main);
    }

    add(obj, _ul = this._explorer, _lvl = 1) {
        for (const key in obj) {
            const prop = obj[key];
            let li = document.createElement('li');
            if (prop.type == 'folder') {
                li.className = 'folder';
                let div = document.createElement('div');
                div.dataset.key = key;
                div.className = 'folder-info';
                if (!(this._opened && this._opened.includes(key))) {
                    div.className += ' closed';
                }
                div.style.paddingLeft = 50 * _lvl + 'px';
                div.textContent = key;
                li.append(div);
                let ul = document.createElement('ul');
                li.append(ul);
                this.add(prop.items, ul, _lvl + 1);
            } else {
                let a = document.createElement('a');
                a.textContent = key;
                a.dataset.key = key;
                a.style.paddingLeft = this._offset * _lvl + 'px';
                prop.li = li;
                li.append(a);
            }
            _ul.append(li);
        }
    }

    find(findingKey, _obj = this._main) {
        let data = _obj[findingKey];
        if (data) {
            return data;
        } else {
            for (let key in _obj) {
                if (_obj[key].type == 'folder') {
                    data = this.find(findingKey, _obj[key].items);
                    if (data) {
                        return data;
                    }
                }
            }
        }
        return null;
    }

    getHTML(name, data) {
        let result = this._getMainHeader(name, data.extends);


        result += this._getImport(data.import);

        result += this._getDescription(data.description, 'post');

        result += this._getMethods(data.methods, data.addClassName, name);

        result += this._getProperties(data.properties, data.addClassName, name);

        return result;
    }

    _getMainHeader(name, ext) {
        let result = `<h1 class="header">${name}`;
        if (ext) {
            result += ` <span class="struct-word">extends</span> `;
            if (this.find(ext)) {
                result += `<a data-key="${ext}">${ext}</a>`;
            } else {
                result += ext;
            }
        }

        result += '</h1>\n';
        return result;
    }

    _getImport(imp) {
        if (imp) {
            return `<div class="import-string">\n<span class="struct-word">import from</span> <span class="string">"${imp}"</span>\n</div>\n`;
        } else {
            return '';
        }
    }

    _getHeader(val) {
        return `<div class="container-header">${val}</div>\n`;
    }

    _getMethods(methods, addIfNeed, name) {
        let result = '';
        if (!isEmpty(methods)) {
            result = this._getHeader('Методы');
            result += `<div class="methods-container">\n`;
            for (let method in methods) {
                result += this._getMethod(method, methods[method], addIfNeed, name);
            }
            result += '</div>\n';
        }
        return result;
    }

    _getMethod(method, data, addIfNeed, name) {
        let result = `<div class="method-container">\n`;
        result += `<h3 class="method-name">`;
        if (data.isAsync) {
            result += '<span class="struct-word">async</span> ';
        }
        if (addIfNeed) {
            result += name + '.';
        }
        result += method + '(' + this._getArgsLine(data.args) + ') : <span class="arg">' + (data.returns || 'void');
        result += '</span></h3>\n';

        result += this._getArgsContainer(data.args);

        result += this._getDescription(data.description, 'method');

        result += '</div>\n';

        return result;
    }

    _getArgsLine(args) {
        let result = '';
        if (!isEmpty(args)) {
            for (let argName in args) {
                result += `, <span class="arg">${argName}</span>`;
            }

            result = result.slice(2);
        }
        return result;
    }

    _getArgsContainer(args) {
        let result = '';
        if (!isEmpty(args)) {
            result = '<div class="args-container">\n';
            for (let arg in args) {
                result += this._getArgContainer(arg, args[arg]);
            }
            result += '</div>\n';
        }
        return result;
    }

    _getArgContainer(name, data) {
        let result = '<div class="arg-container">\n';

        result += `<div class="arg-name">${name}</div>\n`;

        result += this._getLine('type', data.type || 'any');

        if (data.description) {
            result += `<div class="arg-description">\n`;
            result += data.description + '\n';
            result += `</div>\n`;
        }

        result += '</div>\n';
        return result;
    }

    _getLine(k, v) {
        if (k) {
            let result = `<div class="line-description ${k}">\n`;
            result += `<span class="line-key">@${k}`;
            if (v) {
                result += ` - </span><span class="line-value">${v}</span>\n`;
            } else {
                result += '</span>';
            }
            result += '</div>\n';
            return result;
        } else {
            return '';
        }
    }

    _getDescription(desciption, className = '') {
        if (desciption) {
            return `<div class="description ${className}">${desciption}</div>\n`;
        } else {
            return '';
        }
    }

    _getProperties(props, addIfNeed, name) {
        let result = '';
        if (props) {
            if (!isEmpty(props.public)) {
                result = this._getHeader('Публичные свойства');
                result += `<div class="properties-container public">\n`;
                for (let prop in props.public) {
                    result += this._getProp(prop, props.public[prop], addIfNeed, name);
                }
                result += '</div>\n';
            }

            if (!isEmpty(props.protected)) {
                result += this._getHeader('Защищённые свойства');
                result += `<div class="properties-container protected">\n`;
                for (let prop in props.protected) {
                    result += this._getProp(prop, props.protected[prop], addIfNeed, name);
                }
                result += '</div>\n';
            }
        }
        return result;
    }

    _getProp(name, data, addIfNeed, className) {
        let result = `<div class="property-container">\n`;
        result += `<h3 class="property-name">`;
        if (addIfNeed) {
            result += className + '.';
        }
        result += name + '</h3>\n';

        result += this._getLinesContainer(data.lines);

        result += this._getDescription(data.description, 'property');

        result += '</div>\n';

        return result;
    }

    _getLinesContainer(lines) {
        let result = '';
        if (!isEmpty(lines)) {
            result = '<div class="lines-container">\n';
            for (let line in lines) {
                result += this._getLine(line, lines[line]);
            }
            result += '</div>\n'
        }
        return result;
    }
}
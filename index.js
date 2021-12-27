const rp = require('request-promise');
const path = require('path');

let init = false;
let rules = [];
let env_name = 'NODE_ENV'
let env_value = 'test'

const compareObjects = (obj1, obj2) => {
    if(typeof obj1 === 'object') {
        const keys1 = Object.keys(obj1);
        for(let i = 0; i < keys1.length; i++) {
            const key = keys1[i];
            if(obj2[key]) {
                if(!compareObjects(obj1[key], obj2[key])) return false;
            } else {
                return false
            }
        }
        return true;
    }
    return obj2 == obj1
}

module.exports = async (options) => {
    if(options.type && options.type === 'initialization') {
        if(init) {
            throw new Error('Cannot init second time')
        }
        const { filename, envName = 'NODE_ENV', envValue = 'test' } = options
        const data = require(path.join(path.dirname(require.main.filename), filename));
        if(Array.isArray(data)) {
            const error = data.find(item => !item.request || !item.response);
            if(error)
                throw new Error('Rules should contain request and response fields')
            rules = data
        } else {
            throw new Error('Wrong data in rules file, should return []')
        }
        env_name = envName
        env_value = envValue
        init = true;
        return;
    }

    if(process.env[env_name] === env_value) {
        for(let i = 0; i < rules.length; i++) {
            if(compareObjects(rules[i].request, options))
                return rules[i].response;
        }
    }
    return rp(options);
}
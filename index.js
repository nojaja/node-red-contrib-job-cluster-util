const fs = require("fs");
const path = require("path");
const ip = require("ip");
const os = require("os");
const crypto = require("crypto");

module.exports = function (RED) {

    //このNodeREDのUUID
    RED.util.procuuid = crypto.randomUUID()

    //IP取得
    RED.util.getLocalAddress = () => {
        const ifacesObj = {}
        ifacesObj.ipv4 = []
        ifacesObj.ipv6 = []
        const interfaces = os.networkInterfaces()
        for (let ifname in interfaces) {
            interfaces[ifname].forEach(function (iface) {
                if (!iface.internal) {
                    const broadcastAddress = ip.or(iface.address, ip.not(iface.netmask))
                    switch (iface.family) {
                        case "IPv4":
                            ifacesObj.ipv4.push({ name: ifname, address: iface.address, broadcastAddress: broadcastAddress })
                            break
                        case "IPv6":
                            ifacesObj.ipv6.push({ name: ifname, address: iface.address, broadcastAddress: broadcastAddress })
                            break
                    }
                }
            });
        }
        return ifacesObj;
    }
    //オブジェクトをパス指定で取得
    RED.util.getPropByPath = (obj, path) => {
        const pathArr = path.split('.');
        let current = obj;
        for (const prop of pathArr) {
            if (current[prop] === undefined) {
                return undefined;
            }
            current = current[prop];
        }
        return current;
    }

    //オブジェクトをパス指定で配置
    RED.util.setPropByPath = (obj, path, value) => {
        const pathArr = path.split('.')
        let cnt = 1
        const _obj = (cnt == pathArr.length) ? value : obj
        let current = _obj
        for (const prop of pathArr) {
            current[prop] = (cnt == pathArr.length) ? value : (typeof current[prop] == "object") ? current[prop] : {}
            current = current[prop]
            cnt++
        }
        return obj
    }

    //オブジェクトをパス指定で配置
    // RED.util.setPropByPath = (obj, path, value) => {
    //     const pathArr = path.split('.')
    //     let cnt = 1
    //     const _obj = (cnt == pathArr.length )? value : {}
    //     let current = _obj
    //     for (const prop of pathArr) {
    //         current[prop] = (cnt == pathArr.length )? value : {}
    //         current = current[prop]
    //         cnt++
    //     }
    //     return Object.assign(obj, _obj)
    // }

    //mapでのlistのpop実装
    RED.util.mappop = (map) => {
        try {
            const key = map.keys().next().value
            const result = map.get(key)
            return (map.delete(key)) ? result : null
        } catch (error) {
            return null
        }
    }

    // //mapでのlistのpop実装
    // RED.util.mappop = (map) => {
    //     try {
    //         node.warn(global.keys());
    //         const keys = global.keys();
    //         const _global = {}
    //         for (const key of keys) {
    //             _global[key] = global.get(key)
    //             node.warn({ key: key, v: _global[key]});
    //         }
    //         msg.global = JSON.stringify(_global)
    //         msg._global = _global

    //         //const index_js = fs.readFileSync(path.join(process.cwd(), 'template', 'index.js'), 'utf-8')
    //         fs.writeFileSync(path.join("/workspace", 'global.json'), JSON.stringify(_global))

    //         return msg;
    //     } catch (error) {
    //         return null
    //     }
    // }

    //
    RED.util.expotGlobal = (_this, filepath) => {
        try {
            const keys = _this.global.keys();
            const _global = {}
            for (const key of keys) {
                _global[key] = _this.global.get(key)
            }
            msg.global = JSON.stringify(_global)
            msg._global = _global
            fs.writeFileSync(filepath, JSON.stringify(_global))
            return true;
        } catch (error) {
            return false
        }
    }

    //
    RED.util.importGlobal = (_this, filepath) => {
        try {
            const global_json = fs.readFileSync(filepath, 'utf-8')
            const _global = JSON.parse(global_json);
            for (const key in _global) {
                _this.global.set(key, _global[key])
            }
            return _global;
        } catch (error) {
            return null
        }
    }

    RED.util.getWorkerInfo = (_this, id) => {
        try {
            const WORKER_HOSTS = _this.global.get("WORKER_HOSTS") || new Map();
            for (const [workerName, worker] of WORKER_HOSTS) {                //topics.${selectTopic}
                if (worker.ID == id || workerName == id) {
                    return [workerName, worker]
                }
            }
            return [null, null]
        } catch (error) {
            console.error("getWorkerInfo:", _this, id, error)
            return [null, null]
        }
    }

    const ColoredTextRegex = /\x1b[[0-9;]*m/g
    //Remove logs Colored Text
    RED.util.ColoredTextRemover = () => {
        return ((typeof msg.payload === 'object') ? msg.payload.toString() : msg.payload).replace(ColoredTextRegex, '')
    }
}
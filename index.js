const fs = require("fs");
const path = require("path");
const ip = require("ip");
const os = require("os");

module.exports = function (RED) {
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
        const _obj = (cnt == pathArr.length )? value : obj
        let current = _obj
        for (const prop of pathArr) {
            current[prop] = (cnt == pathArr.length )? value : (typeof current[prop]=="object")? current[prop] :{}
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
    

}
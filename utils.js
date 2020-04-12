'use strict';

const Distance = require('geo-distance');

exports.distance = function (v1, v2) {
    var d = Distance.between({
        lat: parseFloat(v1.lat),
        lon: parseFloat(v1.lng)
    }, {
        lat: parseFloat(v2.lat),
        lon: parseFloat(v2.lng)
    }).human_readable();

    return `${d.distance}${d.unit}`
};


exports.avaPath = function (p) {
    return `http://localhost:3000/avatar/${p}`
};
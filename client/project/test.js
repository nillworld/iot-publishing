"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var test = function () {
    console.log('yeah ');
    (0, child_process_1.exec)('where npm', function (err, out, stderr) {
        console.log(out);
    });
};
test();

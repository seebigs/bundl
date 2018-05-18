// /**
//  * Parse plugin for Bundl
//  *   convert a string into a parsed code tree
//  */
//
// var parseJS = require('../../parsetree-js');
// // var parseJS = require('../../parsetree-css');
//
// var defaultProcessors = {
//     // css: function (contentsString) {
//     //     return new parseCSS(contentsString);
//     // },
//     js: function (contentsString) {
//         return new parseJS(contentsString);
//     },
// };
//
// function parseContents (r, processors) {
//     var ext = r.src[0].split('.').pop();
//     var contentsString = r.contents.getString();
//     if (processors[ext]) {
//         return processors[ext](contentsString);
//     }
// }
//
// function parseInit(options) {
//     options = options || {};
//     var processors = Object.assign(defaultProcessors, options.processors);
//
//     function parse(r) {
//         if (r.contents) {
//             var parsed = parseContents(r, processors);
//
//             if (parsed) {
//                 r.contents.set(parsed);
//             }
//
//             r.contents.setStage('parsed');
//         }
//
//         return r;
//     }
//
//     return {
//         name: 'parse',
//         stage: 'stringy',
//         exec: parse,
//     };
// }
//
// module.exports = parseInit;

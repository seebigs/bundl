// /**
//  * Convert parsed code into a compressed string
//  */
//
// function minifyInit(options) {
//     options = options || {};
//     var processors = options.processors || {};
//
//     function minify(r) {
//         if (r.contents && r.contents.parsed) {
//             var parsed = r.contents.getParsed();
//             if (parsed) {
//                 var str = '';
//                 if (typeof processors[r.ext] === 'function') {
//                     str = processors[r.ext](r);
//                 } else if (typeof parsed.minify === 'function') {
//                     str = parsed.minify();
//                 }
//
//                 r.contents.set(str);
//                 r.contents.changeStage('stringy');
//             }
//         }
//
//         return r;
//     }
//
//     return {
//         name: 'minify',
//         exec: minify,
//     };
// }
//
// module.exports = minifyInit;

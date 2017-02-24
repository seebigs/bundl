/**
 * Remaps stack trace to the source files provided via mappings
 * Modified from https://github.com/evanw/node-source-map-support
 */

var mapCache = [];

function mapSourcePosition (map) {
    var found;

    mapCache.forEach(function (c) {
        var startLine = c.generated.line;
        if (map.line >= startLine && map.line < startLine + c.totalLines) {
            found = {
                source: c.source,
                line: c.original.line + map.line - startLine,
                column: map.column
            };
        }
    });

    return found || map;
}

// This is copied almost verbatim from the V8 source code at
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js. The
// implementation of wrapCallSite() used to just forward to the actual source
// code of CallSite.prototype.toString but unfortunately a new release of V8
// did something to the prototype chain and broke the shim. The only fix I
// could find was copy/paste.
function CallSiteToString() {
    var fileName;
    var fileLocation = "";
    if (this.isNative()) {
        fileLocation = "native";
    } else {
        fileName = this.getScriptNameOrSourceURL();
        if (!fileName && this.isEval()) {
            fileLocation = this.getEvalOrigin();
            fileLocation += ", "; // Expecting source position to follow.
        }

        if (fileName) {
            fileLocation += fileName;
        } else {
            // Source code does not originate from a file and is not native, but we
            // can still get the source position inside the source string, e.g. in
            // an eval string.
            fileLocation += "<anonymous>";
        }
        var lineNumber = this.getLineNumber();
        if (lineNumber != null) {
            fileLocation += ":" + lineNumber;
            var columnNumber = this.getColumnNumber();
            if (columnNumber) {
                fileLocation += ":" + columnNumber;
            }
        }
    }

    var line = "";
    var functionName = this.getFunctionName();
    var addSuffix = true;
    var isConstructor = this.isConstructor();
    var isMethodCall = !(this.isToplevel() || isConstructor);
    if (isMethodCall) {
        var typeName = this.getTypeName();
        // Fixes shim to be backward compatable with Node v0 to v4
        if (typeName === "[object Object]") {
            typeName = "null";
        }
        var methodName = this.getMethodName();
        if (functionName) {
            if (typeName && functionName.indexOf(typeName) != 0) {
                line += typeName + ".";
            }
            line += functionName;
            if (methodName && functionName.indexOf("." + methodName) != functionName.length - methodName.length - 1) {
                line += " [as " + methodName + "]";
            }
        } else {
            line += typeName + "." + (methodName || "<anonymous>");
        }
    } else if (isConstructor) {
        line += "new " + (functionName || "<anonymous>");
    } else if (functionName) {
        line += functionName;
    } else {
        line += fileLocation;
        addSuffix = false;
    }
    if (addSuffix) {
        line += " (" + fileLocation + ")";
    }
    return line;
}

function cloneCallSite(frame) {
    var object = {};
    Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(function (name) {
        object[name] = /^(?:is|get)/.test(name) ? function () {
            return frame[name].call(frame);
        } : frame[name];
    });
    object.toString = CallSiteToString;
    return object;
}

function isInBrowser() {
    var isNode = typeof process === 'undefined' ? false : Object.prototype.toString.call(process) === '[object process]';
    return !isNode; // good enough for now
}

function wrapCallSite(frame) {
    if (frame.isNative()) {
        return frame;
    }

    // Most call sites will return the source file from getFileName(), but code
    // passed to eval() ending in "//# sourceURL=..." will return the source file
    // from getScriptNameOrSourceURL() instead
    var source = frame.getFileName() || frame.getScriptNameOrSourceURL();
    if (source) {
        var line = frame.getLineNumber();
        var column = frame.getColumnNumber() - 1;

        // Fix position in Node where some (internal) code is prepended.
        // See https://github.com/evanw/node-source-map-support/issues/36
        if (line === 1 && !isInBrowser() && !frame.isEval()) {
            column -= 62;
        }

        var position = mapSourcePosition({
            source: source,
            line: line,
            column: column
        });

        frame = cloneCallSite(frame);
        frame.getFileName = function () {
            return position.source;
        };
        frame.getLineNumber = function () {
            return position.line;
        };
        frame.getColumnNumber = function () {
            return position.column + 1;
        };
        frame.getScriptNameOrSourceURL = function () {
            return position.source;
        };

        return frame;
    }

    // Code called using eval() needs special handling
    var origin = frame.isEval() && frame.getEvalOrigin();
    if (origin) {
        origin = mapEvalOrigin(origin);
        frame = cloneCallSite(frame);
        frame.getEvalOrigin = function () {
            return origin;
        };
        return frame;
    }

    // If we get here then we were unable to change the source position
    return frame;
}

function init (mappings) {
    mapCache = mappings;
    Error.prepareStackTrace = function prepareStackTrace(error, stack) {
        return error + stack.map(function (frame) {
            return '\n    at ' + wrapCallSite(frame);
        }).join('');
    };
}

module.exports = {
    init: init
};

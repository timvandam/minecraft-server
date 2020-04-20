"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ESocketState;
(function (ESocketState) {
    ESocketState[ESocketState["HANDSHAKING"] = 0] = "HANDSHAKING";
    ESocketState[ESocketState["STATUS"] = 1] = "STATUS";
    ESocketState[ESocketState["LOGIN"] = 2] = "LOGIN";
    ESocketState[ESocketState["PLAY"] = 3] = "PLAY";
})(ESocketState = exports.ESocketState || (exports.ESocketState = {}));

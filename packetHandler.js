/*
 * /=======================================================\
 * | UDP Relay Tool                                        |
 * | Copyright (c) PANCHO7532 [pancho7532@p7com.net] 2022  |
 * |=======================================================|
 * |-> Purpose: UDP Packet Manipulation functions.         |
 * \=======================================================/
 * C2S = Client to Server
 * S2C = Server to Client
 * Functions should always return the udpPacket argument... or an Buffer style compatible format.
 */
function handleC2S(udpPacket, originInfo) {
    // Manipulate the packets sent from the client to the server here.
    console.log(`[INFO] Received packet from ${originInfo.address} at ${originInfo.port}`);
    console.log(udpPacket);
    return udpPacket;
}
function handleS2C(udpPacket, originInfo) {
    // Manipulate the packets sent from the server to the client here.
    console.log(`[INFO] Received packet from ${originInfo.address} at ${originInfo.port}`);
    console.log(udpPacket);
    return udpPacket;
}
module.exports = {handleC2S, handleS2C};
#!/usr/bin/env node
/*
 * /=======================================================\
 * | UDP Relay Tool                                        |
 * | Copyright (c) PANCHO7532 [pancho7532@p7com.net] 2022  |
 * |=======================================================|
 * |-> Purpose: UDP packet analysis via MITM methodology   |
 * |            Main script runtime and logic              |
 * \=======================================================/
 * Pretty much the concept for the connection flow between client/server goes like this normally:
 *
 * |--------|               |-------|               |--------|
 * | client | ===========>  | relay | ===========>  | server |
 * |--------| src: 27005    |-------| src: 37005    |--------|
 *            dest: 27015             dest: 27015
 * 
 * In this context, "src" refers to the local port where the packet originates
 * And "dest" refers to the remote port where the server is awaiting new packets
 * With that on your mind, the connection flow between server/client goes like this:
 * 
 * |--------|               |-------|               |--------|
 * | client | <===========  | relay | <===========  | server |
 * |--------| src: 27015    |-------| src: 27015    |--------|
 *            dest: 27005             dest: 37015
 * 
 * For this scheme to work, in a real scenario, we need to create two sockets.
 * One needs to be binded for await connections from the client (27015)
 * And the other one needs to be binded to await connections from the server (37015)
 * Then once we receive an packet from the client, we parse it, send it from an new port
 * to the destination port, and when we receive the packet through the new port, we parse it
 * again, and re-send it to the client, simple right?
 * With Node.JS this approach is quite complicated from every aspect, and the most noticeable problem is
 * that we don't know how to communicate to each event the address of every endpoint, each request.
 * UDP can't achieve an stable and continuous duplex traffic like TCP... sort of.
 * So, one simple approach is to nest events, so we have the information of the client AND the server via rinfo.
 * Now what i'm not sure yet is what happens if the server tries first to connect to the client, as this whole
 * implementation relies entirely on the client connecting to the server first, maybe adding some extra parameters
 * should do the trick, in it's current state it's very likely to crash on that exact scenario.
 * Please don't boo me for this implementation, I might be aware of a more simpler (or complicated) approach, but
 * my intentions here are to be as compatible as possible with older versions of Node.
 * Though if you use something less than Node 5.12 then... you're on for a wild ride dude.
 * Good Luck, and Have Fun!
 */
const net = require("net");
const dgram = require("dgram");
const process = require("process");
const packetHandler = require("./packetHandler");
const npmPackageFile = require("./package.json");
let dhost = "127.0.0.1", dport = 10012, lhost = "::", lport = 10010, cport = 10011, udpV4 = false;
console.log(`UDP Relay Tool v${npmPackageFile.version}\r\nCopyright (c) PANCHO7532 [pancho7532@p7com.net] 2022`);
function parseIPVersion(ip) {
    // This one attempts to cover the shenanigans of udp6 IPv4 format requirements so it doesn't explode
    // If something goes wild, then this is the reason for it, in such case, adjust to your needs.
    if(ip == "::" && udpV4) { return "0.0.0.0" } // HACK: To cover a few rare cases
    if(net.isIPv4(ip) && !udpV4) { return `::ffff:${ip}`}
    if(net.isIPv6(ip) && udpV4) { console.log("[ERROR] Please use only IPv4 addresses on UDPv4 mode."); process.exit(1); }
    return ip; // Not sure about this one though.
}
for(let a = 0; a < process.argv.length; a++) {
    switch(process.argv[a]) {
        // Add your command line arguments here!
        // Example: case "-someArgument": localVariable = process.argv[a+1]; break;
        // process.argv[a+1] by sole nature references the data asociated for that argument
        // You can add more actions before manipulating/assigning by adding more lines on your switch case.
        case "-help":
            console.log(`Usage: node udpRelay.js [-arg1 | -arg2 content]...\r\n` +
            `\t  ./udpRelay.js [-arg1 | -arg2 content]...\r\n` +
            `Documented command line options:\r\n` + 
            `-dhost\tDestination host/ip where captured packets would be relayed, default: ${dhost}\r\n` +
            `-dport\tDestination port where captured packets would be relayed, default: ${dport}\r\n` +
            `-lhost\tHostname/IP of the interface where sockets would bind in your machine, default: ${lhost}\r\n` +
            `-lport\tPort where sockets would listen for your incoming packets, default: ${lport}\r\n` +
            `-cport\tPort where relayed packets should be sent to the server, default: ${cport}\r\n` +
            `-udpV4\t(flag) Use UDPv4 instead of UDPv6, default: ${udpV4}\r\n\r\n` +
            `NOTE: All IPv4 addresses are converted to an acceptable format for Node by default on UDPv6 mode.\r\n` +
            `NOTENOTE: "::" means "every IP on every interface regardless if it's IPv4 or IPv6"... just in case if you didn't know.`);
            process.exit(0);
        case "-dhost": dhost = process.argv[a+1]; break;
        case "-dport": dport = parseInt(process.argv[a+1]); break;
        case "-lhost": lhost = process.argv[a+1]; break;
        case "-lport": lport = parseInt(process.argv[a+1]); break;
        case "-cport": cport = parseInt(process.argv[a+1]); break;
        case "-udpV4": udpV4 = true; break; // Use UDP v4, if false, v6 will be used.
    }
}
const socket1 = dgram.createSocket(udpV4 ? "udp4" : "udp6");
const socket2 = dgram.createSocket(udpV4 ? "udp4" : "udp6");
// Do not edit anything below here... unless you know what you're doing.
socket1.on("listening", () => { console.log(`[INFO] Listening incoming packets at ${parseIPVersion(lhost)} on port ${lport}`); });
socket2.on("listening", () => { console.log(`[INFO] Forwarding packets from port ${cport} at ${parseIPVersion(dhost)} on port ${dport}`); });
socket1.on("message", (msg, rinfo) => {
    msg = packetHandler.handleC2S(msg, rinfo);
    socket2.removeAllListeners("message");
    socket2.on("message", (msg2, rinfo2) => {
        msg2 = packetHandler.handleS2C(msg2, rinfo2);
        socket1.send(msg2, rinfo.port, rinfo.address);
    });
    socket2.send(msg, dport, parseIPVersion(dhost));
});
socket1.bind(lport, parseIPVersion(lhost));
socket2.bind(cport, parseIPVersion(lhost)); // Should we use lhost here?
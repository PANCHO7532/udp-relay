# UDP Relay Tool
UDP Packet analysis tool on an MITM concept.
### Made in pure JavaScript for your enjoyment :D
## Requirements
- Node.JS >= 5.12.0 or >= 14.5.x

## Setup instructions
- Download Node.JS: [Download Here](https://nodejs.org/en/download/ "Node.JS Download")
- Clone this repository to your harddisk or [download an ZIP file](https://gitlab.com/PANCHO7532/udp-relay/-/archive/master/udp-relay-master.zip "Download .zip here") with the code
- Execute `npm update --save-dev` to download development dependencies and run `npm run start-dev` to start nodemon.
- Execute `npm run start` to view an list of allowed commands for the tool (or continue scrolling to see them anyways)

## Usage
The tool requires no dependencies and can be executed right away without installing development dependencies.
### Example Usage
- On the file `packetHandler.js` you will find two functions to interact with UDP packets, both originated from client and server.
- You can relay UDP packets to 192.168.1.2 at port 5555 using the following command line: `node udpRelay.js -dhost 192.168.1.2 -dport 5555 -lport 5553 -cport 5554`
- Set your application to connect via localhost (or local address) to the port 5553, packets will be relayed through 5554 to the server at 5555 and relayed back through 5553 to your application

## Command Arguments
```
-dhost  Destination host/ip where captured packets would be relayed, default: 127.0.0.1
-dport  Destination port where captured packets would be relayed, default: 10012
-lhost  Hostname/IP of the interface where sockets would bind in your machine, default: ::
-lport  Port where sockets would listen for your incoming packets, default: 10010
-cport  Port where relayed packets should be sent to the server, default: 10011
-udpV4  (flag) Use UDPv4 instead of UDPv6, default: false
```
import { Server, Socket, AddressInfo } from 'net';
import { SocketObjectStream } from './app/socket-object-stream';


const server: Server = new Server((socket: Socket) => {
    console.log('Socket connected');

    const sender = new SocketObjectStream(socket);

    let i = 0;

    sender.getReceivedMessages().subscribe((message) => {
        console.log('message', message);
        i++;
        console.log(i);
    });
});

server.listen(1337);

console.log('Listening');


const client: Socket = new Socket();
const sender = new SocketObjectStream(client);

sender.getReceivedMessages().subscribe((message) => {
    console.log(message);
});

client.connect(1337, '127.0.0.1', () => {
    for (let i = 0; i < 10000; i++) {
        sender.sendMessage({ a:Math.random(), b: 'oo' });
    }
});

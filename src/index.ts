import { Server, Socket } from 'net';
import { SocketObjectStream } from '@piros/utils';


const server: Server = new Server((socket: Socket) => {
    console.log('Socket connected');

    const sender = new SocketObjectStream(socket);

    sender.getReceivedMessages().subscribe((message) => {
        console.log('message', message);
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

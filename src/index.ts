import { Server, Socket, AddressInfo } from 'net';


const server: Server = new Server((socket: Socket) => {
    console.log('Socket connected');

    let sobrante: Buffer;

    socket.on('data', (data) => {
        console.log(`Received: ${data.length} bytes`);
        let finished = false;
        let pos = 0;

        let a=0;
        while (!finished) {
            const ceroPos = data.indexOf(0, pos);

            if (ceroPos !== -1) {
                if (sobrante) {
                    a++;
                    console.log('Messaje: ', Buffer.concat([sobrante, data.slice(pos, ceroPos)]).toString());
                    sobrante = null;
                } else {
                    a++
                    console.log('Messaje: ', data.slice(pos, ceroPos).toString());
                }
                
                pos = ceroPos + 1;
            }
            
            finished = ceroPos === -1;

            
        }

        if (pos < data.length) {
            sobrante = data.slice(pos);
        }
        
    });
});

server.listen(1337);

console.log('Listening');


const client: Socket = new Socket();

client.connect(1337, '127.0.0.1', () => {
	
    for (let i = 0; i < 10000; i++) {
        write({ a:Math.random(), b: 'oo' }, client);
    }
});

client.on('data', (data) => {
	console.log('Received: ' + data);
	
});

client.on('close', () => {
	console.log('Connection closed');
});



function write(data: any, socket: Socket) {
    if (Math.random() > 0.5) {
        socket.write(JSON.stringify(data));
        socket.write(new Uint8Array([0]));
    } else {
        socket.write(JSON.stringify(data).slice(0,5));
        
        socket.write(JSON.stringify(data).slice(6));
        socket.write(new Uint8Array([0]));
        
    }
    
}
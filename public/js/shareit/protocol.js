socket.on('peer.connected',    peer_connected)
socket.on('peer.disconnected', peer_disconnected)

socket.on('files.list', function(data)
{
	files_list(JSON.parse(data))
});
socket.on('transfer.send_chunk', function(filename, chunk, data)
{
	transfer_send_chunk(filename, parseInt(chunk), data)
})

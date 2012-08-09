![logo](http://i.imgur.com/SKHiX.png)

# ShareIt! - Pure Javascript Peer to Peer filesharing

## Jesús Leganés Combarro "Piranna" - [piranna@gmail.com]
## Based on code from Rich Jones - rich@[gun.io](http://gun.io)

ShareIt! is a "Peer to Peer" filesharing system written in pure Javascript and based on the [DirtyShare](https://github.com/Miserlou/DirtyShare) proof-of-concept by Rich Jones.

## About

File transfers in ShareIt! happen from a host client to a peer client, in chunks which go through the webserver over
WebSockets provided by Socket.IO like a proxy, and in the future directly thanks to WebRTC PeerConnection DataChannels.
The web server only holds onto the data while it is being received and transmitted through it, so there is no data ever
permanently stored on the web server. This makes it perfect for anonymity.

Ideally, the WebSockets will only be used to establish the P2P connections which will go over the HTML5 PeerConnection
object, however, no modern browsers support this feature yet. Hopefully, it will become available within the last quarter
of 2012 or so, and we will be ready for it from the start.

Let's make a purely browser based, ad-free, Free and Open Source private and anonymous filesharing system!

## Mailing List

If you'd like to discuss P2P web applications further, send an email to 

> webp2p@librelist.com

and you'll be part of the discussion mailing list! [(Archives here.)](http://librelist.com/browser/webp2p/)

## TODO

* Work on doing proper PeerConnection based transfers when builds are available.
* Clean it up. It's a little dirty.
* Send as little data as possible.
* Find the optimal size for chunking. Currently set at 64Kb - this is arbitrary.
* Security, of any kind.
* Drag and drop of files, so my roommate shuts up about it.

## License

For now, consider this code to be under the Affero GNU General Public License. I am willing to relicense it under the
BSD/MIT/Apache license, I simply ask that you email me and tell me why. I'll almost certainly agree.

Patches graciously accepted!

let protooPort = 4443;

if (window.location.hostname === 'test.mediasoup.org')
	protooPort = 4444;

export function getProtooUrl({ roomId, peerId })
{
	const hostname = window.location.hostname;
	//const hostname = '192.168.2.202'; // window.location.hostname;
	return `wss://${hostname}:${protooPort}/?roomId=${roomId}&peerId=${peerId}`;
}

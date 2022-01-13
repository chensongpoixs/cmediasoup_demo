let protooPort = 8888;

if (window.location.hostname === 'test.mediasoup.org')
	protooPort = 4444;

export function getProtooUrl({ roomId, peerId })
{
	//const hostname = window.location.hostname;
	const hostname = '192.168.2.139';
	return `ws://${hostname}:${protooPort}/?roomId=${roomId}&peerId=${peerId}`;
}

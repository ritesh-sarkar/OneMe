import { NextResponse } from 'next/server';
import { authorizeNearbyRequest, privateNoStoreHeaders } from '@/libs/flow-nearby';
import { createNearbyTurnServer, parseNearbyTurnUrls } from '@/libs/nearby-ice';

export const runtime = 'nodejs';

export async function GET(request) {
  const auth = await authorizeNearbyRequest(request, 'ice-config', 30);
  if (auth.response) return auth.response;

  try {
    const urls = parseNearbyTurnUrls(process.env.ONEME_TURN_URLS);
    const sharedSecret = process.env.ONEME_TURN_SHARED_SECRET;
    if (urls.length && !sharedSecret) {
      return NextResponse.json({ error: 'Nearby TURN credentials are not configured.' }, {
        status: 503,
        headers: privateNoStoreHeaders(),
      });
    }

    const iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];
    if (urls.length) {
      iceServers.push(createNearbyTurnServer(urls, sharedSecret));
    }

    return NextResponse.json({
      iceServers,
      relayAvailable: urls.length > 0,
    }, { headers: privateNoStoreHeaders() });
  } catch (error) {
    console.error('Nearby ICE configuration is invalid.', {
      error: error?.name || 'UnknownError',
    });
    return NextResponse.json({ error: 'Nearby ICE configuration is invalid.' }, {
      status: 503,
      headers: privateNoStoreHeaders(),
    });
  }
}

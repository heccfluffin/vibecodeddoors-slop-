/* =====================================================================================================
   THE DOORS SERVER (Cloudflare Worker + one Durable Object)

   1. THE BOARD (/ws): a small publish/subscribe message board, the job the free public MQTT brokers used to do:
      topics with + and # wildcards, retained notes, "last will" notes that are posted when a player vanishes.
      The game's lobby, public room list, leaderboards, live rooms and the ban registry all run on it.
   2. MATCHMAKING (/peerjs): the signalling PeerJS needs so two players' browsers can connect directly. The game
      itself still runs player to player; the server only introduces them.
   3. BANS AND KICKS: every player proves their device ID (the game's existing ECDSA device keys) when they arrive.
      The server reads the owner-signed ban registry and admin-signed bans off the board (checking every signature),
      remembers which connections (IP addresses) each ID has used, and turns banned IDs and their connections away.
      Owner and admins can KICK: the player is disconnected and blocked for 10 minutes, and every game in their co-op
      drops them.

   Nothing secret lives here: the owner's PUBLIC keys are the same ones that are in the game.
   ===================================================================================================== */
import { Hub } from './hub.js';
export { Hub };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (url.pathname === '/' || url.pathname === '/health') return new Response('DOORS server: ok', { headers: Object.assign({ 'content-type': 'text/plain' }, cors) });
    if (url.pathname === '/ws' || url.pathname === '/peerjs' || url.pathname === '/peerjs/id' || url.pathname.startsWith('/peerjs/')) {
      const id = env.HUB.idFromName('main');
      const h = new Headers(req.headers);
      h.set('x-doors-ip', req.headers.get('CF-Connecting-IP') || '');
      return env.HUB.get(id).fetch(new Request(req, { headers: h }));
    }
    return new Response('Not found', { status: 404, headers: cors });
  }
};

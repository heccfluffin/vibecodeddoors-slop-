# DOORS server

A Cloudflare Worker with one Durable Object (`Hub`), deployed by `.github/workflows/server.yml` whenever `server/` changes.

- `/ws` the message board the game uses for the lobby, public rooms, leaderboards and the ban registry
- `/peerjs` matchmaking (PeerJS signalling) so players can connect directly to each other
- bans (device + connection) and kicks are enforced here, from the owner-signed registry and admin-signed bans

Free on Cloudflare's Workers Free plan at DOORS' scale: gameplay itself stays player to player.

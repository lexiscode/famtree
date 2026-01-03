i will like to integrate a live chat within the family tree, like a group chat where everyone members of the family tree (also merged family tree members) can access and discuss inside of it. In this app, i will like us to use Laravel Pusher + Laravel Echo, whereby messages are being sent live and can be seen instantly, with even the "typing..." indication showing.

✅ Features:

✔ Real-time messaging
✔ Presence channels (user lists)
✔ Typing indicators
✔ Reconnects and fallbacks
✔ Works seamlessly with React

📌 How It Works:

Laravel broadcasts events (messages, typing updates).
Echo listens in React and updates state in real time.
Pusher delivers events.

Installation Idea:

docker-compose exec -it famtree bash composer require pusher/pusher-php-server
docker-compose exec -it famtree bash npm install laravel-echo pusher-js


Laravel .env:

BROADCAST_DRIVER=pusher
PUSHER_APP_ID=…
PUSHER_APP_KEY=…
PUSHER_APP_SECRET=…
PUSHER_HOST=api-pusher.com
PUSHER_PORT=443
PUSHER_SCHEME=https

# Friend + Chat update

Added features:
- Friend request workflow: send, receive, accept, reject, remove friend.
- User search API by name, username, email.
- Friend list API.
- Private chat API for accepted friends.
- Feed mixing rule: when user has friends, feed prioritizes friends' posts and inserts 1 stranger post after every 3 friend posts.

New backend endpoints:
- GET /api/users/search?keyword=
- GET /api/friends
- POST /api/friends/requests/{userId}
- GET /api/friends/requests/received
- GET /api/friends/requests/sent
- POST /api/friends/requests/{requestId}/accept
- POST /api/friends/requests/{requestId}/reject
- DELETE /api/friends/{userId}
- GET /api/chats/{userId}/messages?limit=50
- POST /api/chats/{userId}/messages

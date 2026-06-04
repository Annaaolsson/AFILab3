using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using ChatApp.DataService;
using ChatApp.Models;
using System.Linq;

namespace ChatApp.Hubs
{
    public class ChatHub : Hub
    {
        private readonly SharedDb _sharedDb;

        public ChatHub(SharedDb sharedDb)
        {
            _sharedDb = sharedDb;
        }

        public async Task JoinChatRoom(string userName, string chatRoom, string role)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, chatRoom);
            
			_sharedDb.Connection[Context.ConnectionId] = new UserConnection 
			{ 
				UserName = userName, 
				ChatRoom = chatRoom,
				Role = role
			};

            await Clients.Group(chatRoom).SendAsync(
				"ReceiveMessage", 
				"admin", 
				$"{userName} joined as {role}"
			);
			
			await SendOnlineUsers();
        }

        public async Task SendMessage(string chatRoom, string userName, string message)
        {
            await Clients.Group(chatRoom)
				.SendAsync("ReceiveMessage", userName, message);
        }

		public async Task SendAnnouncement(string chatRoom, string announcement)
		{
			if (!_sharedDb.Connection.TryGetValue(Context.ConnectionId, out UserConnection? userConnection))
			{
				return;
			}

			if (userConnection.Role != "Teacher")
			{
				await Clients.Caller.SendAsync(
					"ReceiveMessage",
					"admin",
					"Only teachers can send announcements."
				);

				return;
			}

			await Clients.Group(chatRoom).SendAsync(
				"ReceiveAnnouncement",
				userConnection.UserName,
				announcement
			);
		}

		public override async Task OnDisconnectedAsync(Exception? exception)
		{
			if (_sharedDb.Connection.TryRemove(Context.ConnectionId, out UserConnection? userConnection))
			{
				await Clients.Group(userConnection.ChatRoom)
					.SendAsync("ReceiveMessage", "admin", $"{userConnection.UserName} has left the chat room {userConnection.ChatRoom}");

				await SendOnlineUsers();
			}

			await base.OnDisconnectedAsync(exception);
		}

		private async Task SendOnlineUsers()
		{
			var onlineUsers = _sharedDb.Connection.Values
				.Select(connection => new
				{
					userName = connection.UserName,
					role = connection.Role,
					chatRoom = connection.ChatRoom
				})
				.ToList();

			await Clients.All.SendAsync("ReceiveOnlineUsers", onlineUsers);
		}
    }
}
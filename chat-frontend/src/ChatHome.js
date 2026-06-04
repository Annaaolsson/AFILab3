import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from './ChatRoom';
import ChatBox from './ChatBox';

const ChatHome = () => {
    const [connection, setConnection] = useState(null);
    const [usermessages, setUserMessages] = useState([]);
	const [announcements, setAnnouncements] = useState([]);
    const [userName, setUserName] = useState('');
    const [chatRoom, setChatRoom] = useState('');
    const [loading, setLoading] = useState(false);
	const [role, setRole] = useState('Student');

	useEffect(() => {
		if (connection) {
			connection.on("ReceiveMessage", (user, message) => {
				setUserMessages(prevMessages => {
					const updatedMessages = [
						...prevMessages,
						{
							user: user,
							message: message,
							isAnnouncement: false
						}
					];

					return updatedMessages.slice(-50);
				});
			});

			connection.on("ReceiveAnnouncement", (user, message) => {
				setAnnouncements(prevAnnouncements => {
					const updatedAnnouncements = [
						...prevAnnouncements,
						{
							user: user,
							message: message,
						}
					];

					return updatedAnnouncements.slice(-10);
				});
			});

			connection.onclose(() => {
				console.log("Connection closed");
			});
		}
	}, [connection]);

    const joinChatRoom = async (userName, chatRoom) => {
        if (!userName.trim() || !chatRoom.trim()) {
			alert("Please enter both your name and a chat room.");
			return;
		}

		setLoading(true);
        const connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5136/chat")
            .configureLogging(LogLevel.Information)
            .build();

        await connection.start();
        await connection.invoke("JoinChatRoom", userName, chatRoom, role);
        setConnection(connection);
        setLoading(false);
    };

    const sendMessage = async (message) => {
        const trimmedMessage = message.trim();

		if (!connection || !trimmedMessage) {
			return;
		}
		
        await connection.invoke("SendMessage", chatRoom, userName, trimmedMessage);
    };

	const sendAnnouncement = async (announcement) => {
		const trimmedAnnouncement = announcement.trim();

		if (!connection || !trimmedAnnouncement) {
			return;
		}

		await connection.invoke("SendAnnouncement", chatRoom, trimmedAnnouncement);
	};

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <main className="container flex-grow mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white">Connecting to chat room...</p>
                    </div>
                ) : (
                    connection ? (
                        <>
                            <div className="chat-header">
								<h2>Room: {chatRoom}</h2>
								<p>Logged in as: {userName}, {role}</p>
							</div>

							<div className="announcements-section">
								<h3>Announcements</h3>

								{announcements.length === 0 ? (
									<p className="no-announcements">No announcements yet.</p>
								) : (
									announcements.map((announcement, index) => (
										<div key={index} className="announcement-item">
											<strong>{announcement.user}: </strong>
											<span>{announcement.message}</span>
										</div>
									))
								)}
							</div>

							<h3>Chat</h3>
							<ChatRoom usermessages={usermessages} currentUser={userName} />
                            <ChatBox 
								sendMessage={sendMessage}
								sendAnnouncement={sendAnnouncement}
								role={role} 
							/>
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-screen bg-gray-900">
                            <div className="w-full max-w-lg p-8 mx-4 bg-white rounded-lg shadow-lg md:mx-auto">
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Enter chat room name"
                                    value={chatRoom}
                                    onChange={(e) => setChatRoom(e.target.value)}
                                />
								<label>Role</label>
								<select value={role} onChange={(e) => setRole(e.target.value)}>
									<option value="Student">Student</option>
									<option value="Teacher">Teacher</option>
								</select>
                                <button onClick={() => joinChatRoom(userName, chatRoom)}>Join Chat Room</button>
                            </div>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default ChatHome;
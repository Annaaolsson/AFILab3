import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiSend } from 'react-icons/fi';

const ChatBox = ({ sendMessage, sendAnnouncement, role }) => {
    const [message, setMessage] = useState('');
	const [announcement, setAnnouncement] = useState("");

    const handleSend = () => {
        if (message.trim()) {
            sendMessage(message);
            setMessage('');
        }
    };

	const handleAnnouncementSend = () => {
		const trimmedAnnouncement = announcement.trim();

		if (!trimmedAnnouncement) {
			return;
		}

		sendAnnouncement(trimmedAnnouncement);
		setAnnouncement("");
	};

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600">
            <div className="flex items-end space-x-2">
                <textarea
                    className="w-full p-2 bg-white rounded-2xl resize-none"
                    rows="1"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                />
                <button onClick={handleSend} disabled={!message.trim()}>
                    <FiSend className="w-5 h-5 text-white" />
                </button>
            </div>

			{role === "Teacher" && (
				<div className="announcement-box">
					<input
						type="text"
						value={announcement}
						onChange={(e) => setAnnouncement(e.target.value)}
						placeholder="Write an announcement..."
					/>

					<button
						onClick={handleAnnouncementSend}
						disabled={!announcement.trim()}
					>
						Send announcement
					</button>
				</div>
			)}
        </div>
    );
};

ChatBox.propTypes = {
    sendMessage: PropTypes.func.isRequired
};

export default ChatBox;
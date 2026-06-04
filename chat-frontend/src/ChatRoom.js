import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChatRoom = ({ usermessages, currentUser }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [usermessages]);

    return (
        <div className="h-screen p-4 overflow-y-scroll bg-white rounded-lg shadow-lg">
            {usermessages.map((msg, index) => {
				const isCurrentUser = msg.user === currentUser;
				const isAdmin = msg.user.toLowerCase() === "admin";

				return (
					<div
						key={index}
						className={`message ${isCurrentUser ? "own-message" : ""} ${isAdmin ? "admin-message" : ""}`}
					>
						<strong>{msg.user}: </strong>
						<span>{msg.message}</span>
					</div>
				);
			})}
            <div ref={messagesEndRef} />
        </div>
    );
};

ChatRoom.propTypes = {
    usermessages: PropTypes.arrayOf(
        PropTypes.shape({
            user: PropTypes.string.isRequired,
            message: PropTypes.string.isRequired
        })
    ).isRequired,
    currentUser: PropTypes.string.isRequired
};

export default ChatRoom;
import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageId = Date.now(); // Generate a unique ID for the message
      const messageData = {
        id: messageId,
        room: room,
        author: username,
        message: currentMessage,
        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  const deleteMessage = async (messageId) => {
    await socket.emit("delete_message", messageId);
    setMessageList((list) => list.filter((message) => message.id !== messageId));
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    socket.on("update_message", (updatedMessage) => {
      setMessageList((list) =>
        list.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message
        )
      );
    });

    socket.on("delete_message", (deletedMessageId) => {
      setMessageList((list) =>
        list.filter((message) => message.id !== deletedMessageId)
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("update_message");
      socket.off("delete_message");
    };
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => (
            <div
              className="message"
              id={username === messageContent.author ? "you" : "other"}
              key={messageContent.id} // Add a unique key for each mapped element
            >
              {username === messageContent.author && (
                <button
                  onClick={() => deleteMessage(messageContent.id)}
                  className="delete-button"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
              <div>
                <div className="message-content">
                  <p>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author">{messageContent.author}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;

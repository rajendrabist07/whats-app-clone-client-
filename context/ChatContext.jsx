// context/ChatContext.jsx
import { createContext, useContext, useReducer } from 'react';

const ChatContext = createContext(null);

const chatReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CHATS':
            return { ...state, chats: action.payload };
        case 'SET_ACTIVE_CHAT':
            return { ...state, activeChat: action.payload };
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload],
            };
        case 'UPDATE_MESSAGE_STATUS':
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg._id === action.payload.messageId
                        ? { ...msg, status: { ...msg.status, [action.payload.userId]: action.payload.status } }
                        : msg
                ),
            };
        default:
            return state;
    }
};

const initialState = {
    chats: [],
    activeChat: null,
    messages: [],
    typingUsers: {}, // { chatId: [userId, ...] }
};

export const ChatProvider = ({ children }) => {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    return (
        <ChatContext.Provider value={{ ...state, dispatch }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
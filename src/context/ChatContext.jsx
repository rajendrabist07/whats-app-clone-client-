import { createContext, useContext, useReducer } from 'react';

const ChatContext = createContext(null);

const initialState = {
  chats: [],
  activeChat: null,
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChat: action.payload };
    case 'UPSERT_CHAT': {
      const exists = state.chats.some((chat) => chat._id === action.payload._id);
      return {
        ...state,
        chats: exists
          ? state.chats.map((chat) => (chat._id === action.payload._id ? action.payload : chat))
          : [action.payload, ...state.chats],
        activeChat: action.payload,
      };
    }
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  return <ChatContext.Provider value={{ ...state, dispatch }}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);

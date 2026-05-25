// store/slices/messageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMessages as fetchMessages } from '../../api/message.api';

export const loadMessages = createAsyncThunk(
    'messages/load',
    async ({ chatId, page }, { rejectWithValue }) => {
        try {
            const { data } = await fetchMessages(chatId, page);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

const messageSlice = createSlice({
    name: 'messages',
    initialState: { items: [], loading: false, error: null, pagination: {} },
    reducers: {
        addMessage: (state, action) => {
            state.items.push(action.payload);
        },
        updateMessageStatus: (state, action) => {
            const { messageId, userId, status } = action.payload;
            const message = state.items.find(m => m._id === messageId);
            if (message) message.status[userId] = status;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadMessages.pending, (state) => { state.loading = true; })
            .addCase(loadMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.items = [...action.payload.messages, ...state.items];
                state.pagination = action.payload.pagination;
            })
            .addCase(loadMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { addMessage, updateMessageStatus } = messageSlice.actions;
export default messageSlice.reducer;
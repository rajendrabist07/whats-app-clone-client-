import { useState, useCallback, useRef } from "react";
import { getMessages } from "../../server/controllers/message.controller"; import { useState, useCallback, useRef } from 'react';
import { getMessages } from '../api/message.api';

export const useInfiniteMessages = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const { data } = await getMessages(chatId, page);
            setMessages(prev => [...data.messages, ...prev]); // Prepend older messages
            setHasMore(data.pagination.hasMore);
            setPage(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    }, [chatId, page, loading, hasMore]);

    return { messages, setMessages, loadMore, hasMore, loading };
};
import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebaseInit';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Bell } from 'lucide-react';

interface Notification {
    id: string;
    message: string;
    read: boolean;
    createdAt: any;
}

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!auth.currentUser) return;

        const notificationsRef = collection(db, `users/${auth.currentUser.uid}/notifications`);
        const q = query(notificationsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newNotifications = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...(doc.data() as Omit<Notification, 'id'>) 
            }));
            setNotifications(newNotifications);
            setUnreadCount(newNotifications.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [auth.currentUser]);

    const markAsRead = async (id: string) => {
        if (!auth.currentUser) return;
        const noteRef = doc(db, `users/${auth.currentUser.uid}/notifications/${id}`);
        await updateDoc(noteRef, { read: true });
    };

    return (
        <div className="relative">
            <Bell size={24} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>}
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebaseInit';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Bell, Check } from 'lucide-react';

interface Notification {
    id: string;
    message: string;
    read: boolean;
    createdAt: any;
}

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

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
        }, (error) => {
            if (auth.currentUser) {
                console.error("Notification listener error:", error);
            }
        });

        return () => unsubscribe();
    }, [auth.currentUser]);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!auth.currentUser) return;
        const noteRef = doc(db, `users/${auth.currentUser.uid}/notifications/${id}`);
        await updateDoc(noteRef, { read: true });
    };

    return (
        <div className="relative inline-block">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-serif font-bold text-fluent-navy text-sm">Notifications</h3>
                        <span className="text-[10px] font-black uppercase text-slate-400">{unreadCount} New</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm italic">No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-slate-50 ${n.read ? 'opacity-60' : ''}`}>
                                    <p className="text-sm font-medium text-fluent-navy mb-2">{n.message}</p>
                                    {!n.read && (
                                        <button 
                                            onClick={(e) => markAsRead(n.id, e)}
                                            className="flex items-center gap-1 text-[10px] font-black uppercase text-fluent-teal hover:text-fluent-teal/80"
                                        >
                                            <Check size={12} /> Mark as Read
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

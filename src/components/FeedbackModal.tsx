import React, { useState } from 'react';
import { db, auth } from '../lib/firebaseInit';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, Btn } from './UI';
import { X, MessageSquare, Star } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: string;
  category?: string;
}

export const FeedbackModal = ({ isOpen, onClose, target = "General Session", category = "General" }: FeedbackModalProps) => {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        studentId: auth.currentUser.uid,
        target,
        category,
        rating,
        text,
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-lg p-8 bg-white rounded-[40px] shadow-2xl relative" onClick={() => {}}>
        <div onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
            <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-fluent-navy tracking-tight">Session Feedback</h2>
          <p className="text-slate-500 text-sm">Help us improve the clarity and effectiveness of our lessons. Your insights are invaluable.</p>
          
          <div className="space-y-4">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</div>
             <div className="flex gap-2">
                {[1,2,3,4,5].map(i => (
                    <button key={i} onClick={() => setRating(i)} className={`p-3 rounded-xl transition-all ${rating >= i ? 'bg-fluent-gold text-white' : 'bg-slate-100 text-slate-300'}`}>
                        <Star size={20} className={rating >= i ? 'fill-current' : ''} />
                    </button>
                ))}
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comments</label>
            <textarea 
                className="w-full p-4 rounded-xl border border-black/5 focus:ring-2 focus:ring-fluent-teal focus:border-transparent outline-none text-sm"
                rows={4}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="What could be improved?"
            />
          </div>

          <Btn variant="primary" size="lg" className="w-full rounded-2xl" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Btn>
        </div>
        </div>
      </Card>
    </div>
  );
};

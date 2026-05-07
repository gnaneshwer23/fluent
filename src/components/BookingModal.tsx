import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, BookOpen, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Btn, Card } from './UI';
import { db, auth } from '../lib/firebaseInit';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

export const BookingModal = ({ isOpen, onClose, profile }: { isOpen: boolean, onClose: () => void, profile?: any }) => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    subject: "",
    date: "",
    time: "",
    reason: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English"];
  const times = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"];

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        userId: auth.currentUser.uid,
        userName: profile?.name || auth.currentUser.displayName || "Unknown User",
        userRole: profile?.role || "student",
        status: "pending",
        createdAt: serverTimestamp()
      });
      setStep(3);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-fluent-navy/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        layoutId="booking-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-10"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-fluent-navy transition-colors">
          <X size={24} />
        </button>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-8">
                <div className="text-[10px] font-bold text-fluent-teal uppercase tracking-widest mb-2">Academic Consultation</div>
                <h3 className="text-3xl font-serif font-bold text-fluent-navy">Schedule Sync</h3>
                <p className="text-slate-500 mt-2">Select the subject and session focus.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 block">Select Subject</label>
                  <div className="grid grid-cols-2 gap-3">
                    {subjects.map(s => (
                      <button
                        key={s}
                        onClick={() => setBookingData({ ...bookingData, subject: s })}
                        className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${bookingData.subject === s ? 'border-fluent-teal bg-fluent-teal/5 text-fluent-teal' : 'border-black/5 hover:border-black/10 text-slate-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <Btn 
                  variant="primary" 
                  className="w-full py-4 text-md" 
                  disabled={!bookingData.subject} 
                  onClick={() => setStep(2)}
                  icon={Calendar}
                >
                  Continue to Schedule
                </Btn>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-8">
                <Btn variant="ghost" size="sm" onClick={() => setStep(1)} className="mb-4 -ml-2 text-slate-400">← Back to Subjects</Btn>
                <h3 className="text-2xl font-serif font-bold text-fluent-navy">{bookingData.subject} Consultation</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preferred Date</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-fluent-teal/10 outline-none"
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Slot</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-fluent-teal/10 outline-none"
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    >
                      <option value="">Choose Time</option>
                      {times.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason for Consultation</label>
                  <textarea 
                    placeholder="Briefly describe the topics you'd like to discuss..."
                    className="w-full h-32 p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-fluent-teal/10 outline-none resize-none"
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  />
                </div>

                <Btn 
                  variant="gold" 
                  className="w-full py-4 text-md" 
                  disabled={!bookingData.date || !bookingData.time || isSubmitting} 
                  onClick={handleSubmit}
                  icon={isSubmitting ? undefined : Clock}
                >
                  {isSubmitting ? "Processing..." : "Confirm Request"}
                </Btn>
              </div>
            </motion.div>
          ) : (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-3xl font-serif font-bold text-fluent-navy mb-4">Request Sent</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-10">The faculty has been notified. You'll receive an alert once the slot is confirmed in your registry.</p>
              <Btn variant="primary" className="w-full" onClick={onClose}>Return to Dashboard</Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

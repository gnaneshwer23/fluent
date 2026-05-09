import { addDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseInit";

import { notifyAlertTriggered } from "./communicationService";

export const checkAndCreateAlerts = async (feedback: any) => {
  const alerts = [];

  // Low Marks Logic
  if (Number(feedback.marks) < 60) {
    alerts.push({
      type: "Academic Risk",
      message: `Score dropped to ${feedback.marks}% in ${feedback.week || 'latest review'}`,
    });
  }

  // Low Confidence Logic
  if (Number(feedback.confidenceScore) < 5) {
    alerts.push({
      type: "Confidence Warning",
      message: "Scholar demonstrating significant hesitation during synthesis nodes.",
    });
  }

  // Low Participation Logic
  if (Number(feedback.participationScore) < 5) {
    alerts.push({
      type: "Engagement Gap",
      message: "Minimal verbal participation in peer-review sessions.",
    });
  }

  for (const alert of alerts) {
    await addDoc(collection(db, "alerts"), {
      ...alert,
      studentId: feedback.studentId,
      date: serverTimestamp(),
      status: "active"
    });
    
    // Trigger notification
    notifyAlertTriggered(feedback.studentId, alert.type, alert.message);
  }
};

export const checkAttendanceAlerts = async (studentId: string) => {
  const q = query(collection(db, "attendance"), where("studentId", "==", studentId));
  const snapshot = await getDocs(q);
  
  let total = 0;
  let absent = 0;

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    total++;
    if (data.status === "Absent") absent++;
  });

  if (total > 3) {
    const attendanceRate = ((total - absent) / total) * 100;
    if (attendanceRate < 75) {
      await addDoc(collection(db, "alerts"), {
        studentId,
        type: "Attendance Critical",
        message: `Attendance node dropped to ${attendanceRate.toFixed(1)}%. Immediate synthesis required.`,
        date: serverTimestamp(),
        status: "active"
      });
    }
  }
};

export const checkTeacherIssues = async (teacherId: string) => {
  // Aggregate feedback for this teacher
  // CRITICAL: Filter by teacherId to match security rules and correct context
  const q = query(collection(db, "weeklyReports"), where("teacherId", "==", teacherId));
  const snapshot = await getDocs(q);
  
  let totalMarks = 0;
  let totalConfidence = 0;
  let count = 0;

  snapshot.docs.forEach(doc => {
    const d = doc.data();
    // In a real multi-teacher app, filter by teacherId
    totalMarks += Number(d.marks || 0);
    totalConfidence += Number(d.confidenceScore || 0);
    count++;
  });

  if (count > 5) {
    const avgMarks = totalMarks / count;
    const avgConfidence = totalConfidence / count;

    if (avgMarks < 60) {
      await addDoc(collection(db, "alerts"), {
        teacherId,
        type: "Faculty Performance Issue",
        message: "Aggregated scholar fluency dropped below 60% baseline.",
        date: serverTimestamp(),
        status: "active"
      });
    }

    if (avgConfidence < 5) {
      await addDoc(collection(db, "alerts"), {
        teacherId,
        type: "Confidence Training Gap",
        message: "Faculty unable to pivot scholar confidence above terminal threshold.",
        date: serverTimestamp(),
        status: "active"
      });
    }
  }
};

export const calculateTeacherGrowth = async (teacherId: string) => {
  // CRITICAL: Filter by teacherId to match security rules and correct context
  const q = query(collection(db, "weeklyReports"), where("teacherId", "==", teacherId));
  const snapshot = await getDocs(q);
  
  let marks: number[] = [];
  let confidence: number[] = [];

  snapshot.docs.forEach(doc => {
    const d = doc.data();
    // Filter by teacherId in production
    marks.push(Number(d.marks));
    confidence.push(Number(d.confidenceScore));
  });

  if (marks.length > 0) {
    const avgMarks = marks.reduce((a, b) => a + b, 0) / marks.length;
    const avgConfidence = confidence.reduce((a, b) => a + b, 0) / confidence.length;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const currentMonth = months[new Date().getMonth()];

    await addDoc(collection(db, "teacherGrowth"), {
      teacherId,
      avgMarks: Math.round(avgMarks),
      avgConfidence: Number(avgConfidence.toFixed(1)),
      month: currentMonth,
      date: serverTimestamp()
    });
  }
};

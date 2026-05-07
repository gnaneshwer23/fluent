import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseInit";

export interface AnalyticsData {
  avgMarks: number;
  avgConfidence: number;
  avgParticipation: number;
  attendanceRate: number;
  rating: number;
  teacherScore: number;
  history: { month: string; marks: number; confidence: number }[];
}

export const fetchTeacherAnalytics = async (teacherId: string): Promise<AnalyticsData> => {
  // In a real app, this might be a pre-calculated collection
  // For this demo, we'll aggregate on the fly from weeklyReports
  
  const reportsQ = query(collection(db, "weeklyReports")); // In production, filter by teacher batches if available
  const reportsSnap = await getDocs(reportsQ);
  
  let totalMarks = 0;
  let totalConfidence = 0;
  let totalParticipation = 0;
  let count = 0;

  const monthStats: Record<string, { marks: number; confidence: number; count: number }> = {};

  reportsSnap.docs.forEach(doc => {
    const data = doc.data();
    // Assuming reports are for students assigned to this teacher
    // We could filter strictly if we had a teacherId on the report
    totalMarks += Number(data.marks || 0);
    totalConfidence += Number(data.confidenceScore || 0);
    totalParticipation += Number(data.participationScore || 0);
    count++;

    const date = new Date(data.date || Date.now());
    const month = date.toLocaleString('default', { month: 'short' });
    if (!monthStats[month]) monthStats[month] = { marks: 0, confidence: 0, count: 0 };
    monthStats[month].marks += Number(data.marks || 0);
    monthStats[month].confidence += Number(data.confidenceScore || 0);
    monthStats[month].count++;
  });

  const avgMarks = count > 0 ? totalMarks / count : 0;
  const avgConfidence = count > 0 ? totalConfidence / count : 0;
  const avgParticipation = count > 0 ? totalParticipation / count : 0;
  
  // Attendance aggregation
  const attendanceQ = query(collection(db, "attendance"));
  const attendanceSnap = await getDocs(attendanceQ);
  let present = 0;
  let totalLogs = attendanceSnap.docs.length;
  attendanceSnap.docs.forEach(doc => {
    if (doc.data().status === "Present") present++;
  });
  const attendanceRate = totalLogs > 0 ? (present / totalLogs) * 100 : 0;

  // Placeholder rating (could be from a separate parent feedback collection)
  const rating = 4.8;

  // Formula: 40% Marks + 20% Confidence + 20% Participation + 10% Attendance + 10% Rating
  const teacherScore = 
    (avgMarks * 0.4) + 
    (avgConfidence * 10 * 0.2) + 
    (avgParticipation * 10 * 0.2) + 
    (attendanceRate * 0.1) + 
    (rating * 20 * 0.1);

  const history = Object.entries(monthStats).map(([month, stats]) => ({
    month,
    marks: Math.round(stats.marks / stats.count),
    confidence: Number((stats.confidence / stats.count).toFixed(1))
  }));

  return {
    avgMarks: Math.round(avgMarks),
    avgConfidence: Number(avgConfidence.toFixed(1)),
    avgParticipation: Number(avgParticipation.toFixed(1)),
    attendanceRate: Math.round(attendanceRate),
    rating,
    teacherScore: Math.round(teacherScore),
    history: history.length > 0 ? history : [
      { month: "Mar", marks: 65, confidence: 6.2 },
      { month: "Apr", marks: 72, confidence: 7.1 },
      { month: "May", marks: Math.round(avgMarks) || 75, confidence: Number(avgConfidence.toFixed(1)) || 7.5 }
    ]
  };
};

export const getTeacherInsights = (history: { marks: number }[]) => {
  if (history.length < 2) return "Establishing diagnostic baseline...";
  const latest = history[history.length - 1];
  const prev = history[history.length - 2];

  if (latest.marks > prev.marks) return "✅ Teaching efficiency is on a positive trajectory.";
  if (latest.marks < prev.marks) return "⚠ Performance pivot required: Scholar marks declining.";
  return "📊 Operational stability maintained across nodes.";
};

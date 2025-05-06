export type ExamAssignment = {
  id: number;
  applicationId: number;
  examId: number;
  note: string | null;
  assignedBy: number;
  status: string;
  score: number | null;
  startTime: Date | null;
  endTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

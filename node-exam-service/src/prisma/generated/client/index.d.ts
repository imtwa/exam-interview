/**
 * Model JobApplication
 */
export type JobApplication = {
  id: number;
  jobSeekerId: number;
  jobId: number;
  status: InterviewStatus;
  appliedAt: Date;
  updatedAt: Date;
  feedback: string | null;
};

/**
 * Model ExamAssignment
 */
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

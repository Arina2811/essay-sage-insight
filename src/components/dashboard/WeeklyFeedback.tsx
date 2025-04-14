
import { Card } from "@/components/ui/card";

interface WeeklyFeedbackProps {
  feedback: string;
}

const WeeklyFeedback = ({ feedback }: WeeklyFeedbackProps) => {
  return (
    <Card className="p-6 glass">
      <h2 className="text-lg font-semibold mb-4">Weekly Feedback</h2>
      <div className="p-4 bg-muted/50 rounded-md whitespace-pre-line">
        {feedback}
      </div>
    </Card>
  );
};

export default WeeklyFeedback;

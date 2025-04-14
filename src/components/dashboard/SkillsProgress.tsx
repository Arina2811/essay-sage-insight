
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface Skill {
  name: string;
  progress: number;
}

interface SkillsProgressProps {
  skills: Skill[];
}

const SkillsProgress = ({ skills }: SkillsProgressProps) => {
  return (
    <Card className="p-6 glass col-span-2">
      <h2 className="text-lg font-semibold mb-4">Writing Skills Progress</h2>
      <div className="space-y-5">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{skill.name}</span>
              <span className="font-medium">{skill.progress}%</span>
            </div>
            <Progress value={skill.progress} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SkillsProgress;

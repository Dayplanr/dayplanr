import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

interface ChallengeCardProps {
  title: string;
  daysRemaining: number;
  totalDays: number;
  progress: number;
  participants: Participant[];
}

export default function ChallengeCard({
  title,
  daysRemaining,
  totalDays,
  progress,
  participants,
}: ChallengeCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-challenge-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{participants.length} participants</span>
          </div>
          <span className="text-sm font-semibold">
            {daysRemaining}/{totalDays} days left
          </span>
        </div>
        <div className="flex -space-x-2">
          {participants.slice(0, 5).map((participant) => (
            <Avatar key={participant.id} className="border-2 border-background w-8 h-8">
              <AvatarImage src={participant.avatar} />
              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {participants.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium">+{participants.length - 5}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Group Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardContent>
    </Card>
  );
}

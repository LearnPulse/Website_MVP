// Using relative paths (../../) to guarantee it finds the components
import { Card, CardContent } from "../../components/ui/card";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import LearnPulseGraph from "@/components/ui/LearnPulseGraph";

export default function GraphPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-display text-ink">Your Knowledge Map</h1>
        <Link href="/">
          {/* I removed variant="outline" to fix the typescript error */}
          <Button>Back to Dashboard</Button> 
        </Link>
      </div>
      
      <Card className="glow overflow-hidden">
        <CardContent className="p-0">
          <LearnPulseGraph />
        </CardContent>
      </Card>
    </main>
  );
}
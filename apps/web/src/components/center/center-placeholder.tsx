import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CenterPageHeader } from "@/components/center/center-page-header";

type Props = {
  step: string;
  title: string;
  description: string;
  backHref?: string;
};

export function CenterPlaceholder({ step, title, description, backHref = "/center" }: Props) {
  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb={`Control Center › ${title}`}
        title={title}
        description={description}
      />
      <div className="rounded-lg border border-dashed bg-muted/20 px-6 py-10 text-center">
        <p className="text-sm font-medium text-violet-700 dark:text-violet-300">{step}</p>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={backHref}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

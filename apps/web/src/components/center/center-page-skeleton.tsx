import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  variant?: "list" | "dashboard" | "detail";
};

export function CenterPageSkeleton({ variant = "list" }: Props) {
  if (variant === "detail") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-56" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
        <Skeleton className="h-9 w-full max-w-xl" />
        <div className="grid gap-3 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-3 w-96 max-w-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-36 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <div className="grid gap-3 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-lg lg:col-span-2" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-3 w-96 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-72 rounded-lg" />
    </div>
  );
}

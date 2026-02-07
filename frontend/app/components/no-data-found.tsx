import { CirclePlus, FolderPlus } from "lucide-react";
import { Button } from "./ui/button";

interface NoDataFoundProps {
  title: string;
  description: string;
  buttonText: string;
  buttonAction: () => void;
}

export const NoDataFound = ({
  title,
  description,
  buttonText,
  buttonAction,
}: NoDataFoundProps) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-6 text-center">
      <div className="rounded-full bg-muted p-4">
        <FolderPlus className="size-8 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button onClick={buttonAction} className="mt-6 gap-2" size="lg">
        <CirclePlus className="size-4" />
        {buttonText}
      </Button>
    </div>
  );
};

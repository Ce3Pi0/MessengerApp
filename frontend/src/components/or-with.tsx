import { Separator } from "./ui/separator";
const OrWith = () => {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <Separator className="w-full" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          or with
        </span>
      </div>
    </div>
  );
};

export default OrWith;

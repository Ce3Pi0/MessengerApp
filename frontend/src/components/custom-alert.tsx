import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface Props {
  alertTitle: string;
  alertDescription: string;
}

const CustomAlert = ({ alertTitle, alertDescription }: Props) => {
  return (
    <Alert variant="destructive" className="max-w-md">
      <AlertCircleIcon />
      <AlertTitle>{alertTitle}</AlertTitle>
      <AlertDescription>
        {alertDescription}
        <a className="underline" href="/">
          Go Back
        </a>
      </AlertDescription>
    </Alert>
  );
};

export default CustomAlert;

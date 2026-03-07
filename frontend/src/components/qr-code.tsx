import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PROTECTED_ROUTES } from "@/routes/routes";

const QrCode = () => {
  const { qrCode } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Card
        className="p-7
        m-1"
      >
        <CardContent className="flex flex-row align-middle justify-center">
          <img src={qrCode!} />
        </CardContent>
      </Card>
      <Button
        className="max-w-1/3"
        type="button"
        onClick={() => navigate(PROTECTED_ROUTES.VERIFY_2FA)}
      >
        Verify
      </Button>
    </>
  );
};

export default QrCode;

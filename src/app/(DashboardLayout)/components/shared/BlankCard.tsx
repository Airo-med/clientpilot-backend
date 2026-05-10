import { Card } from "@mui/material";

type Props = {
  className?: string;
  children: React.ReactNode;
};

const BlankCard = ({ children, className }: Props) => {
  return (
    <Card
      className={className}
      variant="outlined"
      elevation={0}
      sx={{
        p: 0,
        position: "relative",
        borderRadius: 2,
        borderColor: "divider",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 12px 32px rgba(93, 135, 255, 0.12)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {children}
    </Card>
  );
};

export default BlankCard;

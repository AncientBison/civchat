import { ButtonGroup } from "@nextui-org/button";

import useMediaQuery from "@/lib/hooks/useMediaQuery";

export const ResponsiveButtonGroup = ({
  children,
}: {
  children: React.ReactElement[];
}) => {
  const isMobile = useMediaQuery("(max-width: 600px)");

  return isMobile ? (
    <span className="flex flex-col-reverse gap-2 px-12">{children}</span>
  ) : (
    <ButtonGroup>{children}</ButtonGroup>
  );
};

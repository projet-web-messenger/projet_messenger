import { cn } from "@repo/utils/classes";
import { type UixComponent, uix } from "../factory";

export const Card: UixComponent<"div"> = (props) => {
  const { children, className, ...remainingProps } = props;

  return (
    <uix.div className={cn("flex flex-1 flex-col break-words rounded-md border p-0 text-start", className)} {...remainingProps}>
      {children}
    </uix.div>
  );
};
Card.displayName = "Card";

export const CardBody: UixComponent<"div"> = (props) => {
  const { children, className, ...remainingProps } = props;

  return (
    <uix.div className={cn("flex flex-1 flex-col p-6", className)} {...remainingProps}>
      {children}
    </uix.div>
  );
};
CardBody.displayName = "CardBody";

export const CardHeader: UixComponent<"div"> = (props) => {
  const { children, className, ...remainingProps } = props;

  return (
    <uix.div className={cn("flex flex-col gap-1.5 px-6 pt-6", className)} {...remainingProps}>
      {children}
    </uix.div>
  );
};
CardHeader.displayName = "CardHeader";

export const CardFooter: UixComponent<"div"> = (props) => {
  const { children, className, ...remainingProps } = props;

  return (
    <uix.div className={cn("flex items-center gap-2 px-6 pb-6", className)} {...remainingProps}>
      {children}
    </uix.div>
  );
};
CardFooter.displayName = "CardFooter";

export const CardTitle: UixComponent<"h3"> = (props) => {
  const { className, ...remainingProps } = props;

  return <uix.h3 className={cn("font-semibold text-lg leading-7", className)} {...remainingProps} />;
};
CardTitle.displayName = "CardTitle";

export const CardDescription: UixComponent<"p"> = (props) => {
  const { className, ...remainingProps } = props;

  return <uix.p className={cn("text-sm", className)} {...remainingProps} />;
};
CardDescription.displayName = "CardDescription";

import { type UixComponent, uix } from "../factory";

/**-----------------------------------------------------------------------------
 * Box Component
 * -----------------------------------------------------------------------------
 * Box is a layout component that can be used to wrap other components.
 * It renders a 'div' tag by default.
 *
 * @param props - The props of the component.
 * @returns The Box component.
 *
 * -----------------------------------------------------------------------------*/
export const Box: UixComponent<"div"> = (props) => {
  return <uix.div {...props} />;
};

Box.displayName = "Box";

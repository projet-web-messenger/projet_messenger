"use client";

import { cn } from "@repo/utils/classes";
import { uuid } from "@repo/utils/functions";
import { useEffect, useState } from "react";
import { type UixComponent, uix } from "../factory";

type FieldProps = {
  /**
   * Indicates whether the field is disabled.
   */
  disabled?: boolean;

  /**
   * Indicate that the field is invalid.
   */
  errorText?: string;

  /**
   * Add helper text to the field.
   */
  helperText?: string;

  /**
   * Indicates whether the field is invalid.
   */
  invalid?: boolean;

  /**
   * The label for the field.
   */
  label?: React.ReactNode;

  /**
   * Indicate that the field is optional.
   */
  optionalText?: React.ReactElement;

  /**
   * Indicates whether the field is read-only.
   */
  readOnly?: boolean;

  /**
   * Indicates whether the field is required.
   */
  required?: boolean;
};

const DATA_SCOPE = "field";

/**-----------------------------------------------------------------------------
 * Field Component
 * -----------------------------------------------------------------------------
 * Used to add labels, help text, and error messages to form fields.
 *
 * -----------------------------------------------------------------------------*/
export const Field: UixComponent<"fieldset", FieldProps> = (props) => {
  const {
    asChild,
    children,
    className,
    disabled,
    errorText,
    helperText,
    id: idProp,
    invalid,
    label,
    optionalText,
    readOnly,
    required,
    ...remainingProps
  } = props;

  const [id, setId] = useState<string | undefined>(idProp);

  const ids = id
    ? {
        root: `${DATA_SCOPE}::${id}`,
        label: `${DATA_SCOPE}::${id}::label`,
        input: id,
        errorText: `${DATA_SCOPE}::${id}::error-text`,
        helperText: `${DATA_SCOPE}::${id}::helper-text`,
      }
    : {};

  useEffect(() => {
    if (!id) {
      const generatedId = uuid();
      setId(generatedId);
    }
  }, [id]);

  useEffect(() => {
    const root = ids.root ? document.getElementById(ids.root) : null;
    const input = root?.querySelector("input, textarea, select") as HTMLElement | null;

    if (input) {
      input.id = ids.input || input.id;
      input.className = cn("relative flex w-full flex-col gap-1.5", input.className);

      input.dataset.scope = DATA_SCOPE;
      input.dataset.part = "input";
      input.dataset.invalid = invalid ? "" : undefined;
      if (invalid) {
        input.setAttribute("aria-invalid", "true");
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("data-invalid");
      }

      if (disabled) {
        input.setAttribute("disabled", "true");
      } else {
        input.removeAttribute("disabled");
      }

      if (readOnly) {
        input.setAttribute("readonly", "true");
      } else {
        input.removeAttribute("readonly");
      }

      if (required) {
        input.setAttribute("required", "true");
      } else {
        input.removeAttribute("required");
      }
    }
  }, [disabled, invalid, required, ids.input, ids.root, readOnly]);

  return (
    <uix.fieldset
      asChild={asChild}
      className={cn("relative flex w-full flex-col gap-1.5", className)}
      data-part="root"
      data-readonly={readOnly ? "" : undefined}
      data-scope={DATA_SCOPE}
      id={ids.root}
      {...remainingProps}
    >
      {label ? (
        <label
          className={cn("flex select-none items-center gap-1 text-start font-medium text-sm leading-5", disabled && "data-[disabled]:opacity-50")}
          data-disabled={disabled ? "" : undefined}
          data-invalid={invalid ? "" : undefined}
          data-part="label"
          data-readonly={readOnly ? "" : undefined}
          data-scope={DATA_SCOPE}
          htmlFor={ids.input}
          id={ids.label}
        >
          {label}
          {optionalText}
          {required ? <span className="text-[var(--colors-error)] leading-none">*</span> : null}
        </label>
      ) : null}
      {children}
      {invalid && errorText ? (
        <span
          className="inline-flex items-center gap-1 font-medium text-[var(--colors-error)] text-xs leading-4"
          aria-live="polite"
          data-part="error-text"
          data-scope="input"
          id={ids.errorText}
        >
          {errorText}
        </span>
      ) : null}
      {helperText ? (
        <p className="text-xs leading-4" data-part="helper-text" data-scope="input" id={ids.helperText}>
          {helperText}
        </p>
      ) : null}
    </uix.fieldset>
  );
};

Field.displayName = "Field";

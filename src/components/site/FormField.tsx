const controlClasses =
  "mt-2 block w-full rounded-xs border-0 border-b border-charcoal/30 bg-transparent py-2.5 text-base outline-none transition-colors duration-300 focus:border-accent aria-invalid:border-charcoal";

type FormFieldProps = {
  label: string;
  name: string;
  error?: string;
  defaultValue?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  required?: boolean;
  multiline?: boolean;
};

/** שדה טקסט עם תווית והודעת שגיאה מתחתיו */
export function FormField({
  label,
  name,
  error,
  defaultValue,
  type = "text",
  autoComplete,
  required,
  multiline,
}: FormFieldProps) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const shared = {
    id,
    name,
    defaultValue,
    required,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  } as const;

  return (
    <div>
      <label htmlFor={id} className="text-sm text-warm-gray">
        {label}
      </label>
      {multiline ? (
        <textarea {...shared} rows={5} className={`${controlClasses} resize-y`} />
      ) : (
        <input
          {...shared}
          type={type}
          // אימייל וטלפון נכתבים משמאל לימין, אבל נשארים מיושרים עם שאר הטופס
          dir={type === "text" ? undefined : "ltr"}
          className={`${controlClasses} ${type === "text" ? "" : "text-end"}`}
        />
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-charcoal">
      {message}
    </p>
  );
}

type CheckboxFieldProps = {
  label: string;
  name: string;
  error?: string;
  defaultChecked?: boolean;
};

export function CheckboxField({ label, name, error, defaultChecked }: CheckboxFieldProps) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 py-1 text-sm leading-relaxed">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 size-5 shrink-0 accent-charcoal"
        />
        <span>{label}</span>
      </label>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** מלכודת לבוטים: מחוץ למסך ולא display:none, כדי שבוטים ימלאו אותה */
export function HoneypotField({ label }: { label: string }) {
  return (
    <div aria-hidden="true" className="absolute -start-[9999px] top-auto size-px overflow-hidden">
      <label>
        {label}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function FormSuccess({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="border-t border-accent pt-6">
      <p className="font-serif text-2xl font-light">{title}</p>
      <p className="mt-3 leading-relaxed text-warm-gray">{body}</p>
    </div>
  );
}

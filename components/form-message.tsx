type FormMessageProps = {
  message?: string;
  error?: string;
};

export function FormMessage({ message, error }: FormMessageProps) {
  if (!message && !error) {
    return null;
  }

  return (
    <div className={error ? "form-msg form-msg-error" : "form-msg form-msg-ok"}>
      {error || message}
    </div>
  );
}

export type ClientFormErrors = Partial<Record<"name" | "email" | "phone", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateClientFormFields(form: {
  name: string;
  email: string;
  phone: string;
}): ClientFormErrors {
  const errors: ClientFormErrors = {};
  const name = form.name.trim();
  if (!name) errors.name = "Name is required.";
  else if (name.length > 255) errors.name = "Name must be at most 255 characters.";

  const email = form.email.trim();
  if (email) {
    if (email.length > 255) errors.email = "Email must be at most 255 characters.";
    else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address, or leave this field empty.";
  }

  const phone = form.phone.trim();
  if (phone.length > 50) errors.phone = "Phone must be at most 50 characters.";

  return errors;
}

export function clientFormHasErrors(errors: ClientFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

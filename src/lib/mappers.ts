export function toPublicUser(row: Record<string, unknown>) {
  const {
    password: _p,
    password_reset_token: _t,
    password_reset_expires: _e,
    ...rest
  } = row;
  return {
    id: rest.id,
    name: rest.name,
    email: rest.email,
    role: rest.role,
    subscriptionStatus: (rest.subscription_status as string) ?? "free",
    stripeCustomerId: rest.stripe_customer_id ?? null,
    createdAt: rest.created_at,
    updatedAt: rest.updated_at,
  };
}

export function toClient(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toProject(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    clientId: row.client_id,
    title: row.title,
    description: row.description,
    status: row.status,
    notes: row.notes,
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toInvoice(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    amount: row.amount !== null && row.amount !== undefined ? String(row.amount) : null,
    status: row.status,
    dueDate: row.due_date,
    paidAt: row.paid_at,
    pdfUrl: row.pdf_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

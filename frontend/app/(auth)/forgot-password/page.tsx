import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

/**
  * Component: Page
  * Renders the UI and handles the internal logic for the Page.
  */
export default function Page() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}


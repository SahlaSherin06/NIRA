import { AuthLayout } from "@/features/auth/components/AuthLayout";

/**
 * Component: Layout
 * Renders the UI and handles the internal logic for the Layout.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}


import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  code: string;
  title: string;
  message: string;
}

const ErrorPage = ({ code, title, message }: ErrorPageProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <h1 className="text-9xl font-bold text-primary">{code}</h1>
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{message}</p>
        <Button asChild size="lg">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export const NotFoundPage = () => (
  <ErrorPage
    code="404"
    title="Page Not Found"
    message="Sorry, we couldn't find the page you're looking for. It might have been moved or deleted."
  />
);

export const ForbiddenPage = () => (
  <ErrorPage
    code="403"
    title="Access Denied"
    message="Sorry, you don't have permission to access this page. Please sign in or contact support if you believe this is an error."
  />
);

export default ErrorPage;

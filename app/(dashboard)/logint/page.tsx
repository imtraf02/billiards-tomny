import LoginForm from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg border border-border shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gradient-primary">Billiard Pro</h2>
          <p className="mt-2 text-muted-foreground">Đăng nhập vào hệ thống</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

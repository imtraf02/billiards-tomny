import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Billiard Management</h1>
          <p className="mt-2 text-gray-600">Đăng nhập vào hệ thống quản lý</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

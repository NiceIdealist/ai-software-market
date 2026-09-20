import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";

export default async function NavBar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          AI 软件交易平台
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/requirements" className="hover:underline">
            浏览需求
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">
                控制台
              </Link>
              <span className="text-neutral-400">
                {user.name} · {roleLabel(user.role)}
              </span>
              <form action={logoutAction}>
                <button type="submit" className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
                  退出
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white dark:bg-white dark:text-neutral-900"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function roleLabel(role: string) {
  switch (role) {
    case "DEMANDER":
      return "需求方";
    case "PROVIDER":
      return "服务方";
    case "ADMIN":
      return "管理员";
    default:
      return role;
  }
}

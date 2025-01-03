export default function LoginLinks() {
  return (
    <div className="flex justify-between text-sm">
      <a
        href="/forget-page"
        className="text-primary hover:text-primary/80 transition-colors"
      >
        Forgot password?
      </a>
      <a
        href="/signup"
        className="text-primary hover:text-primary/80 transition-colors"
      >
        Create Account
      </a>
    </div>
  );
}

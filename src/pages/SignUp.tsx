
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthCard from "@/components/auth/AuthCard";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp = () => {
  const { bypassAuth } = useAuth();

  return (
    <AuthCard
      title="Create an Account"
      description="Enter your details to create your WriteRight account"
      footer={
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      }
    >
      <SignUpForm bypassAuth={bypassAuth} />
    </AuthCard>
  );
};

export default SignUp;

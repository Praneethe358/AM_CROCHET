"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Container from "@/components/Container";
import { useAuth } from "@/context/AuthContext";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    try {
      await signup({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast.success("Signup completed");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="pt-28 pb-28 min-h-screen bg-theme-bg flex items-center justify-center px-4">
      <Container className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full bg-theme-card/90 border border-theme-border rounded-3xl shadow-[0_12px_40px_rgba(200,169,126,0.16)] p-6 sm:p-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold font-serif text-theme-text mb-2">Create Account</h1>
            <p className="text-theme-faint text-sm">Start exploring curated premium essentials.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-text mb-2">Full Name</label>
              <input
                type="text"
                {...register("name")}
                placeholder="Your name"
                autoComplete="name"
                className={`w-full h-12 px-4 rounded-xl bg-theme-bg border outline-none transition-all ${
                  errors.name
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-theme-border focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20"
                }`}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text mb-2">Email Address</label>
              <input
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full h-12 px-4 rounded-xl bg-theme-bg border outline-none transition-all ${
                  errors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-theme-border focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20"
                }`}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text mb-2">Password</label>
              <input
                type="password"
                {...register("password")}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className={`w-full h-12 px-4 rounded-xl bg-theme-bg border outline-none transition-all ${
                  errors.password
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-theme-border focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20"
                }`}
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-theme-text text-white font-medium flex items-center justify-center gap-2 hover:bg-theme-accent disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              <UserPlus size={18} />
              {isSubmitting ? "Creating account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="text-sm text-theme-faint mt-5 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-theme-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </Container>
    </div>
  );
}

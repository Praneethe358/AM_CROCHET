"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Container from "@/components/Container";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [nextPath, setNextPath] = useState("/");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const next = query.get("next");
    const path = next && next.startsWith("/") ? next : "/";
    setTimeout(() => {
      setNextPath(path);
    }, 0);
  }, [setNextPath]);

  const onSubmit = async (values) => {
    try {
      const loggedInUser = await login(values.email.trim(), values.password);
      toast.success("Login successful");

      if (nextPath && nextPath !== "/") {
        router.push(nextPath);
        return;
      }

      if (loggedInUser?.role === "admin") {
        router.push("/admin");
        return;
      }

      router.push("/");
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:py-12">
      <Container className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-xl sm:text-2xl font-light text-gray-900 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">👤</span>
              <span>Login</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Email */}
            <div>
              <input
                type="email"
                {...register("email")}
                placeholder="EMAIL"
                autoComplete="email"
                className={`w-full px-0 py-3 bg-transparent border-b outline-none text-gray-700 placeholder-gray-500 transition-colors ${
                  errors.email
                    ? "border-b-red-400"
                    : "border-b-gray-300 focus:border-b-gray-700"
                }`}
              />
              {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="PASSWORD"
                  autoComplete="current-password"
                  className={`w-full px-0 py-3 bg-transparent border-b outline-none text-gray-700 placeholder-gray-500 transition-colors ${
                    errors.password
                      ? "border-b-red-400"
                      : "border-b-gray-300 focus:border-b-gray-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-10 sm:h-12 rounded-none bg-black text-white font-medium text-xs sm:text-sm uppercase tracking-wider hover:bg-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-6 sm:mt-8`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">DO NOT HAVE AN ACCOUNT YET?</p>
            <Link href="/signup" className="text-xs sm:text-sm text-gray-900 font-medium uppercase tracking-wider hover:underline">
              Create account
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}

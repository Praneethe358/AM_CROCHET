"use client";

import { useState } from "react";
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

const signupSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    try {
      await signup({
        title: values.title,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        name: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.trim(),
        password: values.password,
        phone: values.phone || "",
      });
      toast.success("Signup completed");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Signup failed. Please try again.");
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
          <div className="mb-8 sm:mb-10">
            <h1 className="text-xl sm:text-2xl font-light text-gray-900 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">👤</span>
              <span>Create account</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <select
                {...register("title")}
                className="w-full px-0 py-3 bg-transparent border-b outline-none text-gray-700 placeholder-gray-500 cursor-pointer transition-colors border-b-gray-300 focus:border-b-gray-700 appearance-none bg-no-repeat bg-right"
              >
                <option value="">Select Title</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
                <option value="Dr">Dr</option>
              </select>
              {errors.title && <p className="mt-2 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div>
                <input
                  type="text"
                  {...register("firstName")}
                  placeholder="FIRST NAME"
                  autoComplete="given-name"
                  className={`w-full px-0 py-3 bg-transparent border-b outline-none text-gray-700 placeholder-gray-500 transition-colors ${
                    errors.firstName
                      ? "border-b-red-400"
                      : "border-b-gray-300 focus:border-b-gray-700"
                  }`}
                />
                {errors.firstName && <p className="mt-2 text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div>
                <input
                  type="text"
                  {...register("lastName")}
                  placeholder="LAST NAME"
                  autoComplete="family-name"
                  className={`w-full px-0 py-3 bg-transparent border-b outline-none text-gray-700 placeholder-gray-500 transition-colors ${
                    errors.lastName
                      ? "border-b-red-400"
                      : "border-b-gray-300 focus:border-b-gray-700"
                  }`}
                />
                {errors.lastName && <p className="mt-2 text-xs text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

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
                  autoComplete="new-password"
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

            {/* Phone */}
            <div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full sm:w-20 px-0 py-3 bg-transparent border-b outline-none text-gray-700 transition-colors border-b-gray-300 focus:border-b-gray-700 cursor-pointer text-sm"
                >
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+61">🇦🇺 +61</option>
                </select>
                <div className="flex-1">
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="PHONE (OPTIONAL)"
                    autoComplete="tel"
                    className="w-full px-0 py-3 bg-transparent border-b outline-none text-gray-700 placeholder-gray-500 transition-colors border-b-gray-300 focus:border-b-gray-700 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-10 sm:h-12 rounded-none bg-black text-white font-medium text-xs sm:text-sm uppercase tracking-wider hover:bg-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-6 sm:mt-8`}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </motion.button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 sm:mt-10 text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">ALREADY HAVE AN ACCOUNT?</p>
            <Link href="/login" className="text-xs sm:text-sm text-gray-900 font-medium uppercase tracking-wider hover:underline">
              Sign in
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}

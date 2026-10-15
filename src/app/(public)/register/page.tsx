"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signUpWithEmail } from "@/features/auth/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [registrationNotice, setRegistrationNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      return;
    }

    void createSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          router.replace("/account");
        }
      });
  }, [router]);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setSubmitError("");
    setRegistrationNotice("");
    setIsSubmitting(true);

    try {
      const { data, error } = await signUpWithEmail({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });

      if (error) {
        setSubmitError(error.message || "Unable to create your account.");
        return;
      }

      if (data.user && data.session) {
        router.push("/account");
        router.refresh();
        return;
      }

      if (data.user) {
        setRegistrationNotice(
          "আপনার account তৈরি হয়েছে। লগইন করার আগে আপনার email inbox-এ পাঠানো confirmation link-এ click করুন। Spam/Junk folder-ও দেখুন।",
        );
        return;
      }

      setSubmitError("Account তৈরি হয়নি। আবার চেষ্টা করুন।");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">
          Create Account
        </h1>
        <p className="text-slate-600 mb-6">
          Join Fixora and start shopping for quality products
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {registrationNotice && (
            <div
              role="status"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900"
            >
              <p>{registrationNotice}</p>
              <Link
                href="/login"
                className="mt-2 inline-block font-semibold underline"
              >
                Email confirm করার পর এখানে লগইন করুন
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-slate-900 font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

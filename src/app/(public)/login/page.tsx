"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  resendSignupConfirmation,
  signInWithEmail,
} from "@/features/auth/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export default function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendNotice, setResendNotice] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
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

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setSubmitError("");
    setShowResendConfirmation(false);
    setResendNotice("");
    setIsSubmitting(true);

    try {
      const { data, error } = await signInWithEmail(values.email, values.password);

      if (error) {
        if (error.code === "email_not_confirmed") {
          setSubmitError(
            "আপনার email এখনো confirm হয়নি। নতুন confirmation link পাঠাতে নিচের button চাপুন।",
          );
          setShowResendConfirmation(true);
          return;
        }

        if (error.code === "invalid_credentials") {
          setSubmitError(
            "Email বা password মিলছে না। Account তৈরি করার পর confirmation email এলে সেটি confirm করে তারপর লগইন করুন।",
          );
          return;
        }

        setSubmitError(error.message || "Unable to sign in. Please try again.");
        return;
      }

      if (data.session) {
        router.push("/account");
        router.refresh();
        return;
      }

      setSubmitError("Sign in succeeded, but no session was created. Please try again.");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResendConfirmation() {
    const isEmailValid = await form.trigger("email");
    if (!isEmailValid) {
      return;
    }

    setIsResending(true);
    setSubmitError("");
    setResendNotice("");

    try {
      const { error } = await resendSignupConfirmation(form.getValues("email"));
      if (error) {
        setSubmitError(error.message || "Confirmation email পাঠানো যায়নি। আবার চেষ্টা করুন।");
        return;
      }

      setResendNotice(
        "নতুন confirmation email পাঠানো হয়েছে। Inbox/Spam থেকে সবচেয়ে নতুন email খুলে link-এ একবার click করুন।",
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Confirmation email পাঠানো যায়নি। আবার চেষ্টা করুন।",
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">
          Sign In to Fixora
        </h1>
        <p className="text-slate-600 mb-6">
          Access your account and manage your orders
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {showResendConfirmation && (
            <button
              type="button"
              onClick={onResendConfirmation}
              disabled={isResending}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isResending ? "পাঠানো হচ্ছে..." : "নতুন confirmation email পাঠান"}
            </button>
          )}

          {resendNotice && (
            <div
              role="status"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            >
              {resendNotice}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-slate-900 font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

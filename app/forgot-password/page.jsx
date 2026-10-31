import React from "react";
import { Suspense } from "react";
import ForgotPasswordPage from "@/components/ForgotPassword";

const page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-page" />}>
      <ForgotPasswordPage />
    </Suspense>
  );
};

export default page;

import { Suspense } from "react";
import FormBuilder from "@/components/form-builder/FormBuilder";

const page = () => {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-semibold text-text-secondary">Loading Form Builder...</div>}>
      <FormBuilder />
    </Suspense>
  );
};

export default page;

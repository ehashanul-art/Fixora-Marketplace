"use client";

export function ConfirmSubmitButton() {
  return (
    <button
      type="submit"
      className="text-sm font-semibold text-red-700 hover:text-red-900"
      onClick={(event) => {
        if (!confirm("Deactivate this product?")) event.preventDefault();
      }}
    >
      Deactivate product
    </button>
  );
}

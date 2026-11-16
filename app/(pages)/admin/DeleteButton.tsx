'use client';

export default function DeleteButton() {
  return (
    <button
      type="submit"
      className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer"
      onClick={(e) => {
        if (!confirm('Are you sure you want to delete this article?')) {
          e.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
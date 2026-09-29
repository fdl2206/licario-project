"use client";

import { useParams } from "next/navigation";
import ProductForm from "../ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const id = Number(params?.id);

  return (
    <ProductForm
      isEdit
      productId={Number.isFinite(id) ? id : undefined}
    />
  );
}
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  questionEn: string;
  questionId: string;
  answerEn: string;
  answerId: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    questionEn: "How does the pre-order process work?",
    questionId: "Bagaimana proses pre-order?",
    answerEn:
      "Our pre-order and custom pieces are made in exclusive, limited runs using carefully curated fabrics. Once your order is placed, your garment is handcrafted and tailored by our penjahit, then ready to ship within 10–14 days depending on the design complexity.",
    answerId:
      "Produk pre-order dan custom kami dibuat secara eksklusif dalam jumlah terbatas menggunakan bahan-bahan pilihan. Setelah pesanan dikonfirmasi, busana Anda akan dijahit langsung oleh penjahit ahli kami dan siap dikirim dalam kurun waktu 10–14 hari kerja, tergantung pada tingkat kerumitan desain.",
  },
  {
    questionEn: "How do I find my correct size?",
    questionId: "Bagaimana cara menemukan ukuran yang tepat?",
    answerEn:
      "Each product page includes a detailed size chart in centimeters. If you are between sizes or need a custom fit for all sizes, simply contact us via WhatsApp. We will assist you with proper measurements to ensure the attire fits you beautifully.",
    answerId:
      "Setiap halaman produk dilengkapi dengan panduan ukuran (size chart) dalam sentimeter. Jika ukuran Anda berada di antara dua pilihan atau membutuhkan ukuran khusus (custom size), Anda dapat langsung menghubungi kami melalui WhatsApp. Kami siap membantu memandu ukuran agar busana pas dan nyaman saat dikenakan.",
  },
  {
    questionEn: "What are the shipping times and costs?",
    questionId: "Berapa lama estimasi dan biaya pengiriman?",
    answerEn:
      "Domestic orders across Indonesia typically arrive within 2–5 business days. For deliveries within Bandung, same-day delivery via GoSend is available with shipping fees borne by the buyer. For international delivery requests, please contact us directly via WhatsApp before placing an order.",
    answerId:
      "Pengiriman domestik ke seluruh wilayah Indonesia umumnya memakan waktu 2–5 hari kerja dan ongkos kirim ditanggung oleh pembeli. Khusus area Bandung, pengiriman same-day menggunakan jasa GoSend dapat dilakukan dengan ongkos kirim ditanggung oleh pembeli. Bagi pengiriman ke luar negeri (internasional), silakan hubungi kami terlebih dahulu via WhatsApp.",
  },
  {
    questionEn: "Can I return or exchange an item?",
    questionId: "Apakah saya bisa mengembalikan atau menukar barang?",
    answerEn:
      "Since our ready-to-wear and made-to-order pieces are tailored specifically upon request, we do not accept returns or refunds. However, if there is any fitting or tailoring adjustment needed, we provide a free alteration service within 7 days of package delivery.",
    answerId:
      "Koleksi kami dijahit secara khusus sesuai pesanan, kami tidak menerima pengembalian barang atau dana (return/refund). Namun, jika terdapat penyesuaian atau kesalahan ukuran jahitan, kami menyediakan layanan revisi gratis dalam jangka waktu 7 hari sejak paket diterima.",
  },
  {
    questionEn: "How should I care for my LICARIO pieces?",
    questionId: "Bagaimana cara merawat busana LICARIO?",
    answerEn:
      "Every piece includes care instructions on its label. For general care, we recommend gentle hand-washing or dry cleaning for natural fibers. For pieces featuring delicate beadwork, sequins, or lace embroidery, dry clean only is strongly recommended to preserve the details.",
    answerId:
      "Panduan perawatan tertera pada label setiap pakaian. Secara umum, kami menyarankan cuci tangan secara lembut (hand-wash) atau dry clean untuk bahan serat alami. Khusus busana yang memiliki aplikasi payet, mutiara, atau bordir renda halus, sangat disarankan untuk dry clean saja demi menjaga keawetan detailnya.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-col gap-4">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.questionEn}
            className="rounded-2xl border border-mist/30 bg-white/75 p-6 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-display text-base font-medium text-charcoal sm:text-lg">
                  {item.questionEn}
                </span>
                <span className="font-body text-xs text-zinc-500">
                  {item.questionId}
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-charcoal/60 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-pastel-pink" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 pt-4 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="max-w-2xl font-body text-sm leading-relaxed text-charcoal/70">
                {item.answerEn}
              </p>
              <div className="my-4 border-b border-mist/30" />
              <p className="max-w-2xl font-body text-sm italic leading-relaxed text-zinc-600">
                {item.answerId}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
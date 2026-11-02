import React, { useState, useMemo } from 'react';
import {
  Flower2,
  Package,
  Sparkles,
  Mail,
  Check,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart';
import { formatIDR } from '../../../lib/formatters';
import {
  FLOWER_OPTIONS,
  WRAPPING_OPTIONS,
  RIBBON_OPTIONS,
  ACCESSORY_OPTIONS,
  CARD_TEMPLATES,
} from '../constants/customComponents';

const STEPS = [
  { id: 1, title: 'Bunga Utama', icon: Flower2 },
  { id: 2, title: 'Kertas Wrapping', icon: Package },
  { id: 3, title: 'Pita & Aksesoris', icon: Sparkles },
  { id: 4, title: 'Kartu Ucapan', icon: Mail },
];

export default function CustomBouquetPage() {
  const { addItem } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFlower, setSelectedFlower] = useState(FLOWER_OPTIONS[0]);
  const [flowerQty, setFlowerQty] = useState(5);
  const [selectedWrapping, setSelectedWrapping] = useState(WRAPPING_OPTIONS[0]);
  const [selectedRibbon, setSelectedRibbon] = useState(RIBBON_OPTIONS[0]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [selectedCardTemplate, setSelectedCardTemplate] = useState(CARD_TEMPLATES[0]);
  const [greetingText, setGreetingText] = useState(CARD_TEMPLATES[0].defaultText);
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Kalkulasi Harga Real-time
  const calculatedTotal = useMemo(() => {
    const flowerCost = (selectedFlower?.pricePerStem || 0) * flowerQty;
    const wrapCost = selectedWrapping?.price || 0;
    const ribbonCost = selectedRibbon?.price || 0;
    const accessoriesCost = selectedAccessories.reduce((acc, curr) => acc + (curr.price || 0), 0);
    return flowerCost + wrapCost + ribbonCost + accessoriesCost;
  }, [selectedFlower, flowerQty, selectedWrapping, selectedRibbon, selectedAccessories]);

  const toggleAccessory = (accItem) => {
    if (selectedAccessories.some((a) => a.id === accItem.id)) {
      setSelectedAccessories(selectedAccessories.filter((a) => a.id !== accItem.id));
    } else {
      setSelectedAccessories([...selectedAccessories, accItem]);
    }
  };

  const handleTemplateChange = (tmpl) => {
    setSelectedCardTemplate(tmpl);
    setGreetingText(tmpl.defaultText);
  };

  const handleAddToCart = async () => {
    setIsSubmitting(true);
    try {
      const customPayload = {
        item_type: 'custom',
        name: `Custom Bouquet - ${selectedFlower.name} (${flowerQty} Tangkai)`,
        price: calculatedTotal,
        image_url: selectedFlower.image,
        quantity: 1,
        custom_details: {
          flower: {
            id: selectedFlower.id,
            name: selectedFlower.name,
            qty: flowerQty,
            price_per_stem: selectedFlower.pricePerStem,
          },
          wrapping: selectedWrapping,
          ribbon: selectedRibbon,
          accessories: selectedAccessories,
          greeting_card: {
            recipient: recipientName.trim(),
            sender: senderName.trim(),
            message: greetingText.trim(),
          },
          calculated_total_price: calculatedTotal,
        },
      };

      await addItem(customPayload);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    } catch (err) {
      console.error('Gagal menambahkan custom bouquet ke keranjang:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notifikasi Toast Sukses */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in-up">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check size={16} className="text-white" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold">Racikan Berhasil Disimpan!</p>
              <p className="font-sans text-xs text-white/80">
                Custom bouquet Anda telah dimasukkan ke keranjang belanja.
              </p>
            </div>
          </div>
        )}

        {/* Header Halaman */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-heading text-xs uppercase tracking-widest text-primary font-bold bg-softLavender px-3 py-1 rounded-full">
            FloverArts_ Studio
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primaryText mt-3 mb-2">
            Rakit Buket Impian Anda
          </h1>
          <p className="font-sans text-secondaryText text-sm sm:text-base">
            Sesuaikan setiap detail buket bunga mulai dari pilihan bunga segar, kertas wrapping,
            hiasan pita elegan, hingga kartu ucapan berkesan.
          </p>
        </div>

        {/* Stepper Wizard Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-softLavender text-primary font-bold shadow-xs'
                      : isPast
                      ? 'bg-gray-50 text-emerald-700 hover:bg-gray-100'
                      : 'text-secondaryText hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-roboto text-sm font-semibold ${
                      isActive
                        ? 'bg-primary text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isPast ? <Check size={18} /> : <StepIcon size={18} />}
                  </div>
                  <div>
                    <span className="font-roboto block text-[11px] uppercase tracking-wider text-secondaryText">
                      Langkah {step.id}
                    </span>
                    <span className="font-heading text-xs sm:text-sm font-semibold line-clamp-1">
                      {step.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Workspace Layout (2 Kolom: Konten Step di Kiri, Ringkasan di Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Wizard Steps */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100">
            {/* STEP 1: Pilih Bunga Utama */}
            {currentStep === 1 && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-primaryText">
                      Langkah 1: Pilih Bunga Utama & Kuantitas
                    </h2>
                    <p className="font-sans text-xs sm:text-sm text-secondaryText mt-1">
                      Pilih jenis bunga segar favorit dan tentukan jumlah tangkai buket.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {FLOWER_OPTIONS.map((flower) => {
                    const isSelected = selectedFlower.id === flower.id;
                    return (
                      <div
                        key={flower.id}
                        onClick={() => setSelectedFlower(flower)}
                        className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex gap-4 items-center ${
                          isSelected
                            ? 'border-primary bg-softLavender/20 shadow-xs'
                            : 'border-gray-100 hover:border-accentLavender bg-white'
                        }`}
                      >
                        <img
                          src={flower.image}
                          alt={flower.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1">
                          <span className="font-sans text-[11px] font-semibold text-primary uppercase bg-softLavender px-2 py-0.5 rounded-full inline-block mb-1">
                            {flower.category}
                          </span>
                          <h3 className="font-heading text-sm font-bold text-primaryText">
                            {flower.name}
                          </h3>
                          <p className="font-roboto text-sm font-bold text-primary mt-1">
                            {formatIDR(flower.pricePerStem)}{' '}
                            <span className="font-sans text-xs text-secondaryText font-normal">
                              / tangkai
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Kontrol Kuantitas Tangkai */}
                <div className="bg-[#FAF8F5] rounded-xl p-5 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-primaryText">
                      Jumlah Tangkai Bunga ({selectedFlower.name})
                    </h4>
                    <p className="font-sans text-xs text-secondaryText mt-0.5">
                      Minimal {selectedFlower.minQty} tangkai, maksimal {selectedFlower.maxQty} tangkai.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={flowerQty <= selectedFlower.minQty}
                      onClick={() => setFlowerQty(Math.max(selectedFlower.minQty, flowerQty - 1))}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white disabled:opacity-40 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-roboto text-xl font-bold w-10 text-center text-primaryText">
                      {flowerQty}
                    </span>
                    <button
                      type="button"
                      disabled={flowerQty >= selectedFlower.maxQty}
                      onClick={() => setFlowerQty(Math.min(selectedFlower.maxQty, flowerQty + 1))}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white disabled:opacity-40 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pilih Wrapping Paper */}
            {currentStep === 2 && (
              <div>
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="font-heading text-xl font-bold text-primaryText">
                    Langkah 2: Pilih Kertas Pembungkus (Wrapping Paper)
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-secondaryText mt-1">
                    Bahan dan warna pembungkus premium menentukan nuansa buket Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {WRAPPING_OPTIONS.map((wrap) => {
                    const isSelected = selectedWrapping.id === wrap.id;
                    return (
                      <div
                        key={wrap.id}
                        onClick={() => setSelectedWrapping(wrap)}
                        className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex gap-4 items-center ${
                          isSelected
                            ? 'border-primary bg-softLavender/20 shadow-xs'
                            : 'border-gray-100 hover:border-accentLavender bg-white'
                        }`}
                      >
                        <img
                          src={wrap.image}
                          alt={wrap.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1">
                          <span className="font-sans text-[11px] font-semibold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                            {wrap.badge}
                          </span>
                          <h3 className="font-heading text-sm font-bold text-primaryText">
                            {wrap.name}
                          </h3>
                          <p className="font-roboto text-sm font-bold text-primary mt-1">
                            {formatIDR(wrap.price)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Pita & Aksesoris Tambahan */}
            {currentStep === 3 && (
              <div>
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="font-heading text-xl font-bold text-primaryText">
                    Langkah 3: Pilih Pita & Aksesoris Tambahan
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-secondaryText mt-1">
                    Sentuhan pita mewah dan aksesoris ornamen pemanis buket.
                  </p>
                </div>

                {/* Sub: Pilihan Pita */}
                <h3 className="font-heading text-sm font-bold text-primaryText uppercase tracking-wider mb-3">
                  Warna Pita Satin (Wajib Pilih 1)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {RIBBON_OPTIONS.map((ribbon) => {
                    const isSelected = selectedRibbon.id === ribbon.id;
                    return (
                      <div
                        key={ribbon.id}
                        onClick={() => setSelectedRibbon(ribbon)}
                        className={`cursor-pointer border-2 rounded-xl p-3.5 transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-primary bg-softLavender/20'
                            : 'border-gray-100 hover:border-accentLavender'
                        }`}
                      >
                        <span className="font-heading text-sm font-medium text-primaryText">
                          {ribbon.name}
                        </span>
                        <span className="font-roboto text-xs font-bold text-primary">
                          {formatIDR(ribbon.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sub: Aksesoris Tambahan */}
                <h3 className="font-heading text-sm font-bold text-primaryText uppercase tracking-wider mb-3">
                  Aksesoris Tambahan (Opsional - Boleh Pilih Lebih Dari 1)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACCESSORY_OPTIONS.map((acc) => {
                    const isChecked = selectedAccessories.some((a) => a.id === acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() => toggleAccessory(acc)}
                        className={`cursor-pointer border-2 rounded-xl p-3.5 transition-all flex items-center justify-between ${
                          isChecked
                            ? 'border-primary bg-softLavender/20'
                            : 'border-gray-100 hover:border-accentLavender'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center border ${
                              isChecked
                                ? 'bg-primary border-primary text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check size={14} />}
                          </div>
                          <span className="font-sans text-xs sm:text-sm font-medium text-primaryText">
                            {acc.name}
                          </span>
                        </div>
                        <span className="font-roboto text-xs font-bold text-primary">
                          +{formatIDR(acc.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Kartu Ucapan Personal */}
            {currentStep === 4 && (
              <div>
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="font-heading text-xl font-bold text-primaryText">
                    Langkah 4: Kartu Ucapan & Pesan Personal
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-secondaryText mt-1">
                    Gratis kartu ucapan eksklusif FloverArts_ dicetak rapi dan disematkan di buket.
                  </p>
                </div>

                {/* Pilihan Template Kartu */}
                <h3 className="font-heading text-sm font-bold text-primaryText uppercase tracking-wider mb-3">
                  Pilih Tema Kartu Ucapan
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                  {CARD_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedCardTemplate.id === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleTemplateChange(tmpl)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-primary bg-softLavender text-primary font-bold shadow-xs'
                            : 'border-gray-200 text-secondaryText hover:border-gray-300'
                        }`}
                      >
                        <span className="font-sans text-xs">{tmpl.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Input Penerima & Pengirim */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="font-roboto block text-xs font-semibold text-primaryText uppercase mb-1">
                      Nama Penerima (Untuk:)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Sarah Anindya"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="font-roboto w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="font-roboto block text-xs font-semibold text-primaryText uppercase mb-1">
                      Nama Pengirim (Dari:)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Dimas Pratama"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="font-roboto w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Textarea Pesan */}
                <div>
                  <label className="font-roboto block text-xs font-semibold text-primaryText uppercase mb-1">
                    Isi Pesan Ucapan
                  </label>
                  <textarea
                    rows={4}
                    value={greetingText}
                    onChange={(e) => setGreetingText(e.target.value)}
                    placeholder="Tuliskan ucapan tulus Anda di sini..."
                    className="font-roboto w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                  <span className="font-sans text-[11px] text-secondaryText mt-1 block">
                    Pesan akan dicetak rapi di atas kertas bertekstur linen tebal 260gsm.
                  </span>
                </div>
              </div>
            )}

            {/* Tombol Navigasi Step Wizard */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="font-sans inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-secondaryText hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="font-sans inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-xs"
                >
                  Lanjut ke Langkah {currentStep + 1}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isSubmitting}
                  className="font-sans inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <ShoppingBag size={18} />
                  {isSubmitting ? 'Menyimpan Racikan...' : 'Masukkan ke Keranjang'}
                </button>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Live Price Summary & Preview Racikan (Sticky Panel) */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
              <h3 className="font-heading text-lg font-bold text-primaryText mb-4 pb-3 border-b border-gray-100">
                Ringkasan Racikan Anda
              </h3>

              {/* Mini Preview Bunga & Wrapping */}
              <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-softLavender/30 border border-softLavender">
                <img
                  src={selectedFlower.image}
                  alt={selectedFlower.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <span className="font-sans text-[11px] text-primary uppercase font-bold">
                    Custom Studio
                  </span>
                  <h4 className="font-heading text-sm font-bold text-primaryText line-clamp-1">
                    {selectedFlower.name}
                  </h4>
                  <p className="font-roboto text-xs text-secondaryText">
                    {flowerQty} Tangkai Bunga Segar
                  </p>
                </div>
              </div>

              {/* Rincian Komponen Biaya */}
              <div className="space-y-2.5 text-xs pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center text-secondaryText">
                  <span className="font-sans">
                    {selectedFlower.name} ({flowerQty}x)
                  </span>
                  <span className="font-roboto font-semibold text-primaryText">
                    {formatIDR(selectedFlower.pricePerStem * flowerQty)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-secondaryText">
                  <span className="font-sans">Wrapping: {selectedWrapping.name}</span>
                  <span className="font-roboto font-semibold text-primaryText">
                    {formatIDR(selectedWrapping.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-secondaryText">
                  <span className="font-sans">Pita: {selectedRibbon.name}</span>
                  <span className="font-roboto font-semibold text-primaryText">
                    {formatIDR(selectedRibbon.price)}
                  </span>
                </div>
                {selectedAccessories.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center text-secondaryText">
                    <span className="font-sans">{acc.name}</span>
                    <span className="font-roboto font-semibold text-primaryText">
                      {formatIDR(acc.price)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-secondaryText">
                  <span className="font-sans">Kartu Ucapan</span>
                  <span className="font-roboto font-semibold text-emerald-600">Gratis (Rp 0)</span>
                </div>
              </div>

              {/* Total Harga Live */}
              <div className="pt-4 flex justify-between items-baseline mb-6">
                <span className="font-heading text-sm font-bold text-primaryText">
                  Total Estimasi:
                </span>
                <span className="font-roboto text-2xl font-bold text-primary">
                  {formatIDR(calculatedTotal)}
                </span>
              </div>

              {/* Tombol Simpan / Masukkan ke Keranjang */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSubmitting}
                className="font-sans w-full py-3.5 px-4 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag size={18} />
                {isSubmitting ? 'Menyimpan...' : 'Tambahkan ke Keranjang'}
              </button>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-secondaryText justify-center">
                <Info size={14} className="text-primary shrink-0" />
                <span className="font-sans">
                  Dirangkai langsung oleh florist bersertifikasi FloverArts_.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

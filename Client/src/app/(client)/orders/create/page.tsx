"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/utils/notifications";
import { sendWhatsApp, buildOrderMessage } from "@/utils/whatsapp";
import { PRODUCTS } from "@/constants/products";
import { ProductImageCarousel } from "@/components/orders/ProductImageCarousel";
import { FileUploadZone } from "@/components/orders/FileUploadZone";

// ─── Create Order Form ────────────────────────────────────────────────────────

function CreateOrderForm() {
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const serviceQuery = searchParams.get("service");

    // Filter products by service category if a ?service= query is present
    const filteredProducts = serviceQuery
        ? PRODUCTS.filter((p) => p.categoryId === serviceQuery || p.name.includes(serviceQuery))
        : PRODUCTS;
    const currentProducts = filteredProducts.length > 0 ? filteredProducts : PRODUCTS;

    // ── State ──────────────────────────────────────────────────────────────────
    const [orderName, setOrderName] = useState("");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [fileOption, setFileOption] = useState<"attach" | "email" | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [specialRemark, setSpecialRemark] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formFieldsData, setFormFieldsData] = useState<Record<string, string>>({});
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Derive product from selected ID
    const product = PRODUCTS.find((p) => p.id === selectedProductId);

    // ── Carousel Auto-Slide ────────────────────────────────────────────────────
    const slideCount = product?.images.length ?? 0;
    const activeIndexOverride = product?.getActiveImageIndex ? product.getActiveImageIndex(formFieldsData) : -1;

    useEffect(() => {
        if (activeIndexOverride !== -1) setCarouselIndex(activeIndexOverride);
    }, [activeIndexOverride, formFieldsData]);

    useEffect(() => {
        if (submitted || slideCount <= 1 || activeIndexOverride !== -1) return;
        const id = setInterval(() => setCarouselIndex((prev) => (prev + 1) % slideCount), 3000);
        return () => clearInterval(id);
    }, [submitted, slideCount, activeIndexOverride]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleProductChange = (id: string) => {
        setSelectedProductId(id);
        const prod = PRODUCTS.find((p) => p.id === id);
        if (prod) {
            const initialData: Record<string, string> = {};
            prod.fields.forEach((f) => {
                if (f.type === "select") initialData[f.id] = f.options[0]?.value || "";
                if (f.type === "number") initialData[f.id] = String(f.min || 1);
                if (f.type === "text") initialData[f.id] = "";
            });
            setFormFieldsData(initialData);
        } else {
            setFormFieldsData({});
        }
        setCarouselIndex(0);
        setFileOption(null);
        if (errors.selectedProductId) setErrors((p) => ({ ...p, selectedProductId: "" }));
    };

    const handleFieldChange = (id: string, value: string) => {
        setFormFieldsData((prev) => ({ ...prev, [id]: value }));
        if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
    };

    // ── Price Calculation ──────────────────────────────────────────────────────
    const { applicableCost, discount } = product
        ? product.calculatePrice(formFieldsData)
        : { applicableCost: 0, discount: 0 };
    const emailCharge = fileOption === "email" && product ? product.emailExtraCharge : 0;
    const amountPayable = applicableCost + emailCharge - discount;
    const freeDelivery = product ? amountPayable >= product.freeDeliveryThreshold : false;

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const e: Record<string, string> = {};
        if (!orderName.trim()) e.orderName = "Order name is required";
        if (!selectedProductId) e.selectedProductId = "Please select a product";

        if (product) {
            product.fields.forEach((f) => {
                const val = formFieldsData[f.id];
                if (!val) e[f.id] = `Please select ${f.label}`;
                if (f.type === "number" && (isNaN(parseInt(val)) || parseInt(val) < f.min)) {
                    e[f.id] = `Minimum ${f.label} is ${f.min}`;
                }
            });
        }

        if (fileOption === "attach" && !uploadedFile) e.file = "Please attach a design file";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const detailsParts = product!.fields.map((f) => `${f.label}: ${formFieldsData[f.id]}`).join(", ");
        const message = buildOrderMessage({
            clientId: user?.clientId || "N/A",
            orderName,
            service: product!.name,
            quantity: Number(formFieldsData["quantity"] || 0),
            paperType: formFieldsData["holderType"] || detailsParts,
            finishingOption: fileOption === "email" ? "Send via Email" : "Attach File Online",
        });

        setSubmitted(true);
        notify.whatsapp("Order placed! Admin will confirm via WhatsApp.");
        setTimeout(() => sendWhatsApp(message), 800);
    };

    const handleReset = () => {
        setSubmitted(false);
        setOrderName("");
        setUploadedFile(null);
        setSelectedProductId("");
        setFormFieldsData({});
        setFileOption(null);
    };

    // ─── Success Screen ────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-12">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white rounded-2xl border shadow p-12">
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-xl font-extrabold text-slate-900 mb-2">Order Placed!</h2>
                    <p className="text-slate-500 text-sm max-w-md mb-6">
                        Your order &quot;{orderName}&quot; has been submitted. WhatsApp will open to confirm with the admin.
                    </p>
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Another Order
                    </button>
                </div>
            </div>
        );
    }

    // ─── Main Form ─────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-[1200px] mx-auto px-4 py-8">

                {/* Page Title */}
                <h1 className="text-center text-lg font-extrabold text-gray-800 tracking-widest uppercase border-b border-red-500 pb-2 mb-6">
                    ADD ORDER
                </h1>

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ── LEFT COLUMN: Form ── */}
                    <div className="flex-1 min-w-0">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-0">

                            {/* Order Name */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                                    ORDER NAME
                                </label>
                                <input
                                    value={orderName}
                                    onChange={(e) => {
                                        setOrderName(e.target.value);
                                        if (errors.orderName) setErrors((p) => ({ ...p, orderName: "" }));
                                    }}
                                    placeholder="Type your customer's name here to easily track order status..."
                                    className={`w-full px-3 py-2.5 rounded border text-sm text-gray-800 bg-white outline-none transition ${
                                        errors.orderName ? "border-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    }`}
                                />
                                {errors.orderName && <p className="text-red-500 text-xs mt-1">{errors.orderName}</p>}
                            </div>

                            {/* Select Product */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                                    SELECT PRODUCT
                                </label>
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => handleProductChange(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded border border-gray-300 text-sm text-gray-800 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                                >
                                    <option value="">-- Choose a Product --</option>
                                    {currentProducts.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.selectedProductId && <p className="text-red-500 text-xs mt-1">{errors.selectedProductId}</p>}
                            </div>

                            {/* Conditionally render the rest of the form only when a product is selected */}
                            {product && (
                                <>
                                    {/* SELECT DETAIL */}
                                    <div className="border border-gray-300 rounded mb-4 overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">SELECT DETAIL</span>
                                        </div>
                                        <div className="px-4 py-4 flex flex-col gap-4 bg-white">
                                            {product.fields.map((field, idx) => (
                                                <div key={field.id}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 w-48 min-w-[140px]">
                                                            <span className="text-blue-500 text-base">{field.icon}</span>
                                                            <label className="text-sm font-semibold text-blue-600">{field.label}</label>
                                                        </div>
                                                        <div className="flex-1 flex items-center gap-2">
                                                            {field.type === "select" ? (
                                                                <select
                                                                    value={formFieldsData[field.id] || ""}
                                                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                                    className={`w-full px-3 py-2 border rounded text-sm text-gray-800 bg-gray-50 appearance-none cursor-pointer ${
                                                                        errors[field.id] ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                                                                    }`}
                                                                >
                                                                    <option value="" disabled>--Select--</option>
                                                                    {field.options.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            ) : field.type === "number" ? (
                                                                <input
                                                                    type="number"
                                                                    min={field.min}
                                                                    value={formFieldsData[field.id] || ""}
                                                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                                    className={`w-full max-w-[100px] px-2 py-1.5 border rounded text-sm text-center bg-gray-50 focus:bg-white focus:border-blue-500 outline-none ${
                                                                        errors[field.id] ? "border-red-500" : "border-gray-300"
                                                                    }`}
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    placeholder={field.placeholder}
                                                                    value={formFieldsData[field.id] || ""}
                                                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                                    className={`w-full px-3 py-2 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 outline-none ${
                                                                        errors[field.id] ? "border-red-500" : "border-gray-300"
                                                                    }`}
                                                                />
                                                            )}
                                                            {field.hint && <span className="text-gray-500 text-xs font-medium ml-2 whitespace-nowrap">{field.hint}</span>}
                                                        </div>
                                                    </div>
                                                    {errors[field.id] && <p className="text-red-500 text-xs mt-1 ml-52">{errors[field.id]}</p>}
                                                    {idx < product.fields.length - 1 && <hr className="border-gray-100 mt-4" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Free Delivery Banner */}
                                    {freeDelivery && (
                                        <div className="bg-white border border-gray-300 rounded px-4 py-3 mb-4">
                                            <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                                                🎉 CONGRATULATIONS! ORDER&apos;S ELIGIBLE FOR FREE DELIVERY
                                            </p>
                                        </div>
                                    )}

                                    {/* SELECT FILE OPTION */}
                                    <div className="border border-gray-300 rounded mb-4 overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">SELECT FILE OPTION</span>
                                        </div>
                                        <div className="px-4 py-4 bg-white">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <span className="text-blue-500">☁️</span>
                                                    <input type="radio" checked={fileOption === "attach"} onChange={() => setFileOption("attach")} className="accent-blue-600 w-4 h-4 cursor-pointer" />
                                                    <span className="text-sm text-gray-700 font-medium">Attach File Online</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <span className="text-gray-500">✉️</span>
                                                    <input type="radio" checked={fileOption === "email"} onChange={() => setFileOption("email")} className="accent-blue-600 w-4 h-4 cursor-pointer" />
                                                    <span className="text-sm text-gray-700 font-medium">Send via Email</span>
                                                </label>
                                            </div>

                                            {fileOption === "attach" && <FileUploadZone file={uploadedFile} onFile={setUploadedFile} />}
                                            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}

                                            {fileOption === "email" && (
                                                <div className="mt-2 text-center py-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                                    <p className="text-sm text-gray-600">
                                                        Send file to{" "}
                                                        <a href="mailto:direct@printersclub.in" className="text-blue-600 font-semibold underline">
                                                            direct@printersclub.in
                                                        </a>
                                                        <br />
                                                        <span className="text-orange-500 mt-1 inline-block text-xs font-semibold bg-orange-100 px-2 py-0.5 rounded">
                                                            (Extra Charges - Rs.{product.emailExtraCharge}.00 is applicable)
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="border border-gray-300 rounded mb-4 bg-white">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                <tr className="border-b border-gray-200">
                                                    <td className="px-4 py-3 text-gray-600 font-medium">Applicable Cost</td>
                                                    <td className="px-4 py-3 text-gray-800">Rs.</td>
                                                    <td className="px-4 py-3 font-bold text-gray-900 text-right">
                                                        {applicableCost.toLocaleString("en-IN")}{emailCharge > 0 ? ` + ${emailCharge}` : ""}/-
                                                    </td>
                                                </tr>
                                                {fileOption === "email" && emailCharge > 0 && (
                                                    <tr className="border-b border-gray-200">
                                                        <td className="px-4 py-3 text-orange-600 font-medium">Email Extra Charge</td>
                                                        <td className="px-4 py-3 text-orange-600">Rs.</td>
                                                        <td className="px-4 py-3 font-bold text-orange-600 text-right">+{emailCharge.toLocaleString("en-IN")}/-</td>
                                                    </tr>
                                                )}
                                                <tr className="border-b border-gray-200">
                                                    <td className={`px-4 py-3 font-medium ${discount > 0 ? "text-green-600" : "text-gray-400"}`}>Discount</td>
                                                    <td className={discount > 0 ? "px-4 py-3 text-green-600" : "px-4 py-3 text-gray-400"}>Rs.</td>
                                                    <td className={`px-4 py-3 font-bold ${discount > 0 ? "text-green-600" : "text-gray-400"} text-right`}>
                                                        -{discount > 0 ? discount.toLocaleString("en-IN") : "0"}/-
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-gray-600 font-medium">Amount Payable</td>
                                                    <td className="px-4 py-3 text-gray-800 font-bold">Rs.</td>
                                                    <td className="px-4 py-3 font-extrabold text-blue-600 text-right text-lg">
                                                        {amountPayable.toLocaleString("en-IN")}/-
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Special Remark */}
                                    <div className="mb-4">
                                        <div className="flex items-start gap-0 border border-gray-300 rounded overflow-hidden">
                                            <div className="bg-gray-50 px-3 py-3 border-r border-gray-300 min-w-[130px] h-full">
                                                <p className="text-sm font-medium text-gray-700 mt-2">Special Remark</p>
                                                <p className="text-[11px] text-gray-500 font-medium mt-0.5">(Optional)</p>
                                            </div>
                                            <textarea
                                                value={specialRemark}
                                                onChange={(e) => setSpecialRemark(e.target.value)}
                                                placeholder="remarks for order processing team..."
                                                rows={3}
                                                className="flex-1 px-4 py-3 text-sm text-gray-800 resize-y outline-none bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="w-full py-3 px-4 bg-blue-600 text-white text-sm font-extrabold tracking-wide uppercase rounded-lg border-b-4 border-blue-800 shadow-sm cursor-pointer hover:bg-blue-700 hover:border-blue-900 active:transform active:translate-y-[2px] active:border-b-2 transition-all mt-1"
                                    >
                                        Add Order (Pay From Wallet)
                                    </button>
                                </>
                            )}

                        </form>
                    </div>

                    {/* ── RIGHT COLUMN: Image Carousel + Product Info ── */}
                    {product && (
                        <div className="w-full lg:w-[480px] flex flex-col gap-5 flex-shrink-0">
                            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                                <ProductImageCarousel
                                    images={product.images}
                                    productCode={product.name}
                                    activeIndex={carouselIndex}
                                    onDotClick={setCarouselIndex}
                                />
                            </div>
                            <div className="w-full">
                                {product.renderProductInfo()}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function CreateOrderPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500 font-medium animate-pulse">Loading experience...</p>
                </div>
            }
        >
            <CreateOrderForm />
        </Suspense>
    );
}

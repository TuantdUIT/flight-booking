"use client";

import { Button } from "@/core/components/ui/button";
import { ErrorBanner } from "@/core/components/ui/error-banner";
import { InputField } from "@/core/components/ui/input-field";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { PriceBreakdownCard } from "@/core/components/ui/price-breakdown-card";
import { SelectField } from "@/core/components/ui/select-field";
import { useBookingStore } from "@/core/lib/store";
import type { Booking } from "@/core/types";
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";

interface PaymentForm {
	paymentMethod: string;
	cardholderName: string;
	cardNumber: string;
	expirationDate: string;
	cvv: string;
}

interface PaymentErrors {
	cardholderName?: string;
	cardNumber?: string;
	expirationDate?: string;
	cvv?: string;
}

export default function PaymentPage() {
	const router = useRouter();
	const { selectedFlight, searchParams, passengers, setCurrentBooking } =
		useBookingStore();

	const [form, setForm] = useState<PaymentForm>({
		paymentMethod: "credit-card",
		cardholderName: "",
		cardNumber: "",
		expirationDate: "",
		cvv: "",
	});
	const [errors, setErrors] = useState<PaymentErrors>({});
	const [isProcessing, setIsProcessing] = useState(false);
	const [paymentError, setPaymentError] = useState("");

	useEffect(() => {
		if (!selectedFlight || !searchParams || passengers.length === 0) {
			router.push("/");
			return;
		}
	}, [selectedFlight, searchParams, passengers, router]);

	const formatCardNumber = (value: string) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
		const matches = v.match(/\d{4,16}/g);
		const match = (matches && matches[0]) || "";
		const parts = [];
		for (let i = 0, len = match.length; i < len; i += 4) {
			parts.push(match.substring(i, i + 4));
		}
		return parts.length ? parts.join(" ") : value;
	};

	const formatExpirationDate = (value: string) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
		if (v.length >= 2) {
			return v.substring(0, 2) + "/" + v.substring(2, 4);
		}
		return v;
	};

	const validatePayment = (): boolean => {
		const newErrors: PaymentErrors = {};

		if (!form.cardholderName.trim()) {
			newErrors.cardholderName = "Cardholder name is required";
		}

		const cardNum = form.cardNumber.replace(/\s/g, "");
		if (!cardNum) {
			newErrors.cardNumber = "Card number is required";
		} else if (cardNum.length < 16) {
			newErrors.cardNumber = "Please enter a valid card number";
		}

		if (!form.expirationDate) {
			newErrors.expirationDate = "Expiration date is required";
		} else if (!/^\d{2}\/\d{2}$/.test(form.expirationDate)) {
			newErrors.expirationDate = "Please use MM/YY format";
		}

		if (!form.cvv) {
			newErrors.cvv = "CVV is required";
		} else if (form.cvv.length < 3) {
			newErrors.cvv = "CVV must be 3-4 digits";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setPaymentError("");

		if (!validatePayment()) return;

		setIsProcessing(true);

		// Simulate payment processing
		await new Promise((resolve) => setTimeout(resolve, 2500));

		// 10% chance of payment failure for demo
		if (Math.random() < 0.1) {
			setPaymentError("Payment failed. Please try again.");
			setIsProcessing(false);
			return;
		}

		// Generate booking
		const baseFare = selectedFlight!.price * searchParams!.passengers;
		const taxes = Math.round(baseFare * 0.12);
		const serviceFee = 15;
		const total = baseFare + taxes + serviceFee;

		const booking: Booking = {
			id: Math.random().toString(36).substr(2, 9),
			pnr: Math.random().toString(36).substr(2, 6).toUpperCase(),
			flight: selectedFlight!,
			passengers: passengers,
			totalPrice: total,
			status: "confirmed",
			createdAt: new Date().toISOString().split("T")[0],
		};

		setCurrentBooking(booking);
		router.push("/confirmation");
	};

	if (!selectedFlight || !searchParams) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner text="Loading..." />
			</div>
		);
	}

	return (
		<div className="bg-background">
			<div className="py-8 lg:py-12">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to summary
						</button>
						<h1 className="text-3xl font-bold text-foreground">Payment</h1>
						<p className="mt-2 text-muted-foreground">
							Complete your booking securely
						</p>
					</div>

					{paymentError && (
						<ErrorBanner
							message={paymentError}
							onDismiss={() => setPaymentError("")}
							className="mb-6"
						/>
					)}

					<div className="grid gap-8 lg:grid-cols-3">
						{/* Payment Form */}
						<div className="lg:col-span-2">
							<div className="rounded-xl border bg-card p-6">
								<div className="flex items-center gap-2 mb-6">
									<ShieldCheck className="h-5 w-5 text-success" />
									<span className="text-sm text-muted-foreground">
										Secure payment processing
									</span>
								</div>

								<form onSubmit={handleSubmit} className="space-y-6">
									<SelectField
										label="Payment Method"
										options={[{ value: "credit-card", label: "Credit Card" }]}
										value={form.paymentMethod}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												paymentMethod: e.target.value,
											}))
										}
										icon={<CreditCard className="h-4 w-4" />}
									/>

									<InputField
										label="Cardholder Name"
										placeholder="John Doe"
										value={form.cardholderName}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												cardholderName: e.target.value,
											}))
										}
										error={errors.cardholderName}
										disabled={isProcessing}
									/>

									<InputField
										label="Card Number"
										placeholder="1234 5678 9012 3456"
										value={form.cardNumber}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												cardNumber: formatCardNumber(e.target.value),
											}))
										}
										error={errors.cardNumber}
										maxLength={19}
										icon={<CreditCard className="h-4 w-4" />}
										disabled={isProcessing}
									/>

									<div className="grid gap-4 md:grid-cols-2">
										<InputField
											label="Expiration Date"
											placeholder="MM/YY"
											value={form.expirationDate}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													expirationDate: formatExpirationDate(e.target.value),
												}))
											}
											error={errors.expirationDate}
											maxLength={5}
											disabled={isProcessing}
										/>

										<InputField
											label="CVV"
											placeholder="123"
											type="password"
											value={form.cvv}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
												}))
											}
											error={errors.cvv}
											maxLength={4}
											icon={<Lock className="h-4 w-4" />}
											disabled={isProcessing}
										/>
									</div>

									<Button
										type="submit"
										className="w-full"
										size="lg"
										disabled={isProcessing}
									>
										{isProcessing ? (
											<div className="flex items-center gap-2">
												<LoadingSpinner size="sm" />
												Processing Payment...
											</div>
										) : (
											<>
												<Lock className="h-4 w-4 mr-2" />
												Pay Now
											</>
										)}
									</Button>
								</form>
							</div>
						</div>

						{/* Order Summary */}
						<div className="lg:col-span-1">
							<PriceBreakdownCard
								flight={selectedFlight}
								passengerCount={searchParams.passengers}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

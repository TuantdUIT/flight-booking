"use client";

import { Button } from "@/core/components/ui/button";
import { ErrorBanner } from "@/core/components/ui/error-banner";
import { InputField } from "@/core/components/ui/input-field";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { PriceBreakdownCard } from "@/core/components/ui/price-breakdown-card";
import { SelectField } from "@/core/components/ui/select-field";
import { useBookingStore } from "@/core/lib/store";
import { useCreateBookingMutation } from "@/features/bookings/api";
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

	// Use the booking mutation hook
	const createBooking = useCreateBookingMutation();

	const [form, setForm] = useState<PaymentForm>({
		paymentMethod: "credit-card",
		cardholderName: "",
		cardNumber: "",
		expirationDate: "",
		cvv: "",
	});
	const [errors, setErrors] = useState<PaymentErrors>({});
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
		if (!selectedFlight || !searchParams) {
			toast.error("Missing flight or search information");
			return;
		}

		try {
			// Prepare booking data with real payment information
			const bookingData = {
				flightId: String(selectedFlight.id),
				passengers: passengers.map((p) => ({
					firstName: p.fullName.split(" ")[0] || p.fullName,
					lastName: p.fullName.split(" ").slice(1).join(" ") || p.fullName,
					email: p.email,
					phone: p.phoneNumber,
					dob: p.dateOfBirth,
				})),
				paymentInfo: {
					cardNumber: form.cardNumber.replace(/\s/g, ""), // Remove spaces
					expiryDate: form.expirationDate,
					cvv: form.cvv,
					cardholderName: form.cardholderName,
				},
			};

			// Call the mutation to create booking with paid status
			const result = await createBooking.mutateAsync(bookingData);

			// Show success message
			toast.success(`Payment successful! PNR: ${result.pnr}`);

			// Calculate total for display
			const priceBase = Number.parseFloat(selectedFlight.priceBase);
			const priceTax = Number.parseFloat(selectedFlight.priceTax);
			const baseFare = priceBase * searchParams.passengers;
			const taxes = priceTax * searchParams.passengers;
			const total = baseFare + taxes;

			// Create booking object for confirmation page
			const booking = {
				id: result.bookingId.toString(),
				pnr: result.pnr,
				flight: selectedFlight,
				passengers: passengers,
				totalPrice: total,
				status:
					result.status === "confirmed"
						? ("confirmed" as const)
						: ("pending" as const),
				createdAt: new Date().toISOString().split("T")[0],
			};

			setCurrentBooking(booking);
			router.push("/confirmation");
		} catch (error) {
			console.error("Payment error:", error);

			// Handle specific error types
			if (error instanceof Error) {
				if (error.message.includes("Not enough available seats")) {
					setPaymentError("Seats are no longer available");
					toast.error("Seats are no longer available");
				} else if (error.message.includes("Flight not found")) {
					setPaymentError("Flight is no longer available");
					toast.error("Flight is no longer available");
					setTimeout(() => router.push("/"), 2000);
				} else {
					setPaymentError(error.message || "Payment failed. Please try again.");
					toast.error(error.message || "Payment failed. Please try again.");
				}
			} else {
				setPaymentError("An unexpected error occurred. Please try again.");
				toast.error("An unexpected error occurred. Please try again.");
			}
		}
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
										disabled={createBooking.isPending}
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
										disabled={createBooking.isPending}
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
											disabled={createBooking.isPending}
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
											disabled={createBooking.isPending}
										/>
									</div>

									<Button
										type="submit"
										className="w-full"
										size="lg"
										disabled={createBooking.isPending}
									>
										{createBooking.isPending ? (
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

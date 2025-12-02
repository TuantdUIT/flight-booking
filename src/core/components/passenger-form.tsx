"use client";
import { InputField } from "@/core/components/ui/input-field";
import { DateInput } from "@/core/components/ui/date-input";
import { SelectField } from "@/core/components/ui/select-field";
import type { Passenger } from "@/core/types";
import { User, Mail, Phone, Globe, FileText } from "lucide-react";

interface PassengerFormProps {
	index: number;
	passenger: Passenger;
	onChange: (passenger: Passenger) => void;
	errors: Partial<Record<keyof Passenger, string>>;
}

const nationalities = [
	{ value: "", label: "Select nationality" },
	{ value: "United States", label: "United States" },
	{ value: "United Kingdom", label: "United Kingdom" },
	{ value: "Canada", label: "Canada" },
	{ value: "Australia", label: "Australia" },
	{ value: "Germany", label: "Germany" },
	{ value: "France", label: "France" },
	{ value: "Japan", label: "Japan" },
	{ value: "China", label: "China" },
	{ value: "India", label: "India" },
	{ value: "Brazil", label: "Brazil" },
	{ value: "Other", label: "Other" },
];

export function PassengerForm({
	index,
	passenger,
	onChange,
	errors,
}: PassengerFormProps) {
	const handleChange = (field: keyof Passenger, value: string) => {
		onChange({ ...passenger, [field]: value });
	};

	return (
		<div className="rounded-xl border bg-card p-6">
			<h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
					{index + 1}
				</div>
				Passenger {index + 1}
			</h3>

			<div className="grid gap-4 md:grid-cols-2">
				<InputField
					label="Full Name"
					placeholder="John Doe"
					value={passenger.fullName}
					onChange={(e) => handleChange("fullName", e.target.value)}
					error={errors.fullName}
					icon={<User className="h-4 w-4" />}
				/>

				<DateInput
					label="Date of Birth"
					value={passenger.dateOfBirth}
					onChange={(e) => handleChange("dateOfBirth", e.target.value)}
					error={errors.dateOfBirth}
					max={new Date().toISOString().split("T")[0]}
				/>

				<SelectField
					label="Nationality"
					options={nationalities}
					value={passenger.nationality}
					onChange={(e) => handleChange("nationality", e.target.value)}
					error={errors.nationality}
					icon={<Globe className="h-4 w-4" />}
				/>

				<InputField
					label="Passport Number"
					placeholder="AB1234567"
					value={passenger.passportNumber}
					onChange={(e) =>
						handleChange("passportNumber", e.target.value.toUpperCase())
					}
					error={errors.passportNumber}
					icon={<FileText className="h-4 w-4" />}
				/>

				<InputField
					label="Email Address"
					type="email"
					placeholder="john@university.edu"
					value={passenger.email}
					onChange={(e) => handleChange("email", e.target.value)}
					error={errors.email}
					icon={<Mail className="h-4 w-4" />}
				/>

				<InputField
					label="Phone Number"
					type="tel"
					placeholder="+1 234 567 8900"
					value={passenger.phoneNumber}
					onChange={(e) => handleChange("phoneNumber", e.target.value)}
					error={errors.phoneNumber}
					icon={<Phone className="h-4 w-4" />}
				/>
			</div>
		</div>
	);
}
